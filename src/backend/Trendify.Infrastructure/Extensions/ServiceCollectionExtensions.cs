using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;
using StackExchange.Redis;
using Trendify.Infrastructure.Auth;
using Trendify.Infrastructure.Caching;
using Trendify.Infrastructure.Messaging;
using Trendify.Infrastructure.Outbox;
using Trendify.Infrastructure.Persistence;
using Trendify.Infrastructure.Pipeline;
using Trendify.Infrastructure.Storage;
using Trendify.Infrastructure.TikTok;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddPostgres(configuration)
            .AddRedis(configuration)
            .AddMinIO(configuration)
            .AddJwtAuth(configuration)
            .AddEncryption(configuration)
            .AddDomainEvents()
            .AddCurrentUser()
            .AddPipelineBehaviors()
            .AddTikTokApiClient()
            .AddDatabaseInitializer();

        return services;
    }

    private static IServiceCollection AddPostgres(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("PostgreSQL connection string 'Default' is not configured.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql =>
            {
                npgsql.EnableRetryOnFailure(3);
                npgsql.CommandTimeout(30);
            })
            .UseSnakeCaseNamingConvention());

        return services;
    }

    private static IServiceCollection AddRedis(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var redisUrl = configuration["Redis:Url"]
            ?? throw new InvalidOperationException("Redis URL is not configured.");

        var password = configuration["Redis:Password"];
        var configOptions = ConfigurationOptions.Parse(redisUrl);
        if (!string.IsNullOrEmpty(password))
            configOptions.Password = password;

        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(configOptions));

        services.AddScoped<ICacheService, RedisCacheService>();

        return services;
    }

    private static IServiceCollection AddMinIO(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<MinIOOptions>(configuration.GetSection(MinIOOptions.Section));

        var opts = configuration.GetSection(MinIOOptions.Section).Get<MinIOOptions>()!;
        services.AddMinio(client => client
            .WithEndpoint(opts.Endpoint)
            .WithCredentials(opts.AccessKey, opts.SecretKey)
            .WithSSL(opts.UseSSL)
            .Build());

        services.AddScoped<IStorageService, MinIOStorageService>();

        return services;
    }

    private static IServiceCollection AddJwtAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.Section));
        services.AddSingleton<JwtService>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var jwtService = services
                    .BuildServiceProvider()
                    .GetRequiredService<JwtService>();

                options.TokenValidationParameters = jwtService.GetValidationParameters();
                options.Events = new JwtBearerEvents
                {
                    OnChallenge = ctx =>
                    {
                        ctx.HandleResponse();
                        ctx.Response.StatusCode = 401;
                        ctx.Response.ContentType = "application/json";
                        return ctx.Response.WriteAsync(
                            """{"data":null,"error":{"code":"UNAUTHORIZED","message":"Authentication required."}}""");
                    }
                };
            });

        services.AddAuthorization();

        return services;
    }

    private static IServiceCollection AddEncryption(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<EncryptionOptions>(configuration.GetSection(EncryptionOptions.Section));
        services.AddSingleton<TokenEncryptionService>();
        return services;
    }

    private static IServiceCollection AddDomainEvents(this IServiceCollection services)
    {
        // In-process (fast) — used directly in tests
        services.AddScoped<MediatREventDispatcher>();

        // Production binding: IDomainEventDispatcher → OutboxDomainEventDispatcher (durable)
        // Swap to MediatREventDispatcher here if you want in-process for a specific env.
        services.AddScoped<IDomainEventDispatcher, OutboxDomainEventDispatcher>();

        // Outbox processor (called by Hangfire every 10s)
        services.AddScoped<OutboxProcessor>();

        return services;
    }

    private static IServiceCollection AddPipelineBehaviors(this IServiceCollection services)
    {
        // Order matters — behaviors wrap in registration order (outer-first):
        // UnhandledException → Performance → Logging → Validation → Handler
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(UnhandledExceptionBehaviour<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(PerformanceBehaviour<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
        return services;
    }

    private static IServiceCollection AddCurrentUser(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUserService>();
        return services;
    }

    private static IServiceCollection AddTikTokApiClient(this IServiceCollection services)
    {
        services.AddHttpClient<TikTokApiClient>();
        return services;
    }

    private static IServiceCollection AddDatabaseInitializer(this IServiceCollection services)
    {
        services.AddScoped<DatabaseInitializer>();
        return services;
    }
}
