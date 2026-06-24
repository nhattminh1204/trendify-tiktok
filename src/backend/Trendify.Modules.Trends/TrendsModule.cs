using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Trends.Application.Services;
using Trendify.Modules.Trends.Infrastructure;
using Trendify.Modules.Trends.Jobs;

namespace Trendify.Modules.Trends;

public static class TrendsModule
{
    public static IServiceCollection AddTrendsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(TrendsModule).Assembly);

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(TrendsModule).Assembly));

        services.AddValidatorsFromAssembly(typeof(TrendsModule).Assembly);
        services.AddScoped<ITrendsRepository, TrendsRepository>();
        services.AddScoped<TrendScoringService>();
        services.AddScoped<TrendScanJob>();
        services.AddScoped<CompetitorScanJob>();

        return services;
    }
}
