using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Analytics.Infrastructure;
using Trendify.Modules.Analytics.Jobs;

namespace Trendify.Modules.Analytics;

public static class AnalyticsModule
{
    public static IServiceCollection AddAnalyticsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(AnalyticsModule).Assembly);
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(AnalyticsModule).Assembly));
        services.AddValidatorsFromAssembly(typeof(AnalyticsModule).Assembly);
        services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
        services.AddScoped<AnalyticsSyncJob>();
        return services;
    }
}
