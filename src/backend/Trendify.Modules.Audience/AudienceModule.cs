using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Audience.Infrastructure;
using Trendify.Modules.Audience.Jobs;

namespace Trendify.Modules.Audience;

public static class AudienceModule
{
    public static IServiceCollection AddAudienceModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(AudienceModule).Assembly);
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(AudienceModule).Assembly));
        services.AddValidatorsFromAssembly(typeof(AudienceModule).Assembly);
        services.AddScoped<IAudienceRepository, AudienceRepository>();
        services.AddScoped<AudienceSyncJob>();
        return services;
    }
}
