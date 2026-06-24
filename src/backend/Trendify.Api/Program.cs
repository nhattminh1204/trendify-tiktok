using Carter;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Prometheus;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;
using Trendify.Infrastructure.Extensions;
using Trendify.Infrastructure.Middleware;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Accounts;
using Trendify.Modules.Accounts.Jobs;
using Trendify.Modules.AIEngine;
using Trendify.Modules.Analytics;
using Trendify.Modules.Analytics.Jobs;
using Trendify.Modules.Audience;
using Trendify.Modules.Audience.Jobs;
using Trendify.Modules.Content;
using Trendify.Modules.Learning;
using Trendify.Modules.Products;
using Trendify.Modules.Trends;
using Trendify.Modules.Trends.Jobs;

// ─── Serilog bootstrap ───────────────────────────────────────────────────────

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {CorrelationId} {Message:lj}{NewLine}{Exception}")
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Trendify API...");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog ──────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, config) =>
    {
        config
            .ReadFrom.Configuration(ctx.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
            .WriteTo.Seq(
                ctx.Configuration["Seq:Url"] ?? "http://localhost:5341",
                apiKey: ctx.Configuration["Seq:ApiKey"]);
    });

    // ─── Infrastructure ───────────────────────────────────────────────────────
    builder.Services.AddInfrastructure(builder.Configuration);

    // ─── Modules ──────────────────────────────────────────────────────────────
    builder.Services.AddAccountsModule(builder.Configuration);
    builder.Services.AddTrendsModule(builder.Configuration);
    builder.Services.AddAudienceModule(builder.Configuration);
    builder.Services.AddContentModule(builder.Configuration);
    builder.Services.AddAnalyticsModule(builder.Configuration);
    builder.Services.AddLearningModule(builder.Configuration);
    builder.Services.AddProductsModule(builder.Configuration);
    builder.Services.AddAIEngineModule(builder.Configuration);

    // ─── Carter (Minimal API endpoint registration) ───────────────────────────
    builder.Services.AddCarter();

    // ─── Hangfire ─────────────────────────────────────────────────────────────
    var connectionString = builder.Configuration.GetConnectionString("Default")!;
    builder.Services.AddHangfire(config =>
        config.UsePostgreSqlStorage(c => c.UseNpgsqlConnection(connectionString)));
    builder.Services.AddHangfireServer(options =>
    {
        options.WorkerCount = 5;
        options.Queues = ["default", "critical", "low"];
    });

    // ─── Health Checks ────────────────────────────────────────────────────────
    builder.Services.AddHealthChecks()
        .AddNpgSql(connectionString, name: "postgres")
        .AddRedis(builder.Configuration["Redis:Url"]!, name: "redis");

    // ─── CORS ─────────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:3000"];
            policy.WithOrigins(origins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // ─── Session (for OAuth state) ────────────────────────────────────────────
    builder.Services.AddDistributedMemoryCache();
    builder.Services.AddSession(options =>
    {
        options.IdleTimeout = TimeSpan.FromMinutes(10);
        options.Cookie.HttpOnly = true;
        options.Cookie.IsEssential = true;
    });

    // ─── OpenAPI ──────────────────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    // ─────────────────────────────────────────────────────────────────────────

    var app = builder.Build();

    // ─── Database Schema Bootstrap ────────────────────────────────────────────
    using (var scope = app.Services.CreateScope())
    {
        var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
        await initializer.InitializeAsync();
    }

    // ─── Middleware Pipeline ──────────────────────────────────────────────────
    app.UseMiddleware<CorrelationIdMiddleware>();

    // CORS must run before ExceptionHandlingMiddleware so error responses include CORS headers
    app.UseCors();

    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate =
            "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000}ms";
    });

    app.UseSession();
    app.UseAuthentication();
    app.UseAuthorization();

    // ─── Prometheus metrics ───────────────────────────────────────────────────
    app.UseMetricServer();
    app.UseHttpMetrics();

    // ─── Health Checks ────────────────────────────────────────────────────────
    app.MapHealthChecks("/health");
    app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        Predicate = _ => true
    });

    // ─── Hangfire Dashboard (internal only) ──────────────────────────────────
    if (!app.Environment.IsProduction())
    {
        app.UseHangfireDashboard("/hangfire");
    }

    // ─── Hangfire Recurring Jobs ─────────────────────────────────────────────
    var jobs = app.Services.GetRequiredService<IRecurringJobManager>();

    jobs.AddOrUpdate<Trendify.Infrastructure.Outbox.OutboxProcessor>(
        "outbox-processor",
        job => job.ProcessAsync(CancellationToken.None),
        "*/10 * * * * *");  // every 10 seconds

    jobs.AddOrUpdate<TikTokTokenRefreshJob>(
        "tiktok-token-refresh",
        job => job.RunAsync(CancellationToken.None),
        "0 */30 * * * *");  // every 30 minutes

    jobs.AddOrUpdate<AudienceSyncJob>(
        "audience-sync",
        job => job.RunAsync(CancellationToken.None),
        "0 0 */6 * * *");   // every 6 hours

    jobs.AddOrUpdate<AnalyticsSyncJob>(
        "analytics-sync",
        job => job.RunAsync(CancellationToken.None),
        "0 0 */3 * * *");   // every 3 hours

    jobs.AddOrUpdate<TrendScanJob>(
        "trend-scan",
        job => job.RunAsync(CancellationToken.None),
        "0 */2 * * *");   // every 2 hours

    jobs.AddOrUpdate<CompetitorScanJob>(
        "competitor-scan",
        job => job.RunAsync(CancellationToken.None),
        "0 0 */6 * *");   // every 6 hours

    // ─── OpenAPI / Scalar ─────────────────────────────────────────────────────
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger(options => options.RouteTemplate = "openapi/{documentName}.json");
        app.MapScalarApiReference();
    }

    // ─── Carter routes ────────────────────────────────────────────────────────
    app.MapCarter();

    // ─── Version info ────────────────────────────────────────────────────────
    app.MapGet("/version", () => new
    {
        version = "1.0.0",
        environment = app.Environment.EnvironmentName,
        timestamp = DateTimeOffset.UtcNow
    });

    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly.");
}
finally
{
    await Log.CloseAndFlushAsync();
}
