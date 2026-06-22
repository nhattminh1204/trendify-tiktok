using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Content.Infrastructure;

namespace Trendify.Modules.Content;

public static class ContentModule
{
    public static IServiceCollection AddContentModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(ContentModule).Assembly);
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(ContentModule).Assembly));
        services.AddValidatorsFromAssembly(typeof(ContentModule).Assembly);
        services.AddScoped<IContentRepository, ContentRepository>();
        return services;
    }
}
