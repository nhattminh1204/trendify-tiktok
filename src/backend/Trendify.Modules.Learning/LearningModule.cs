using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Learning.Infrastructure;

namespace Trendify.Modules.Learning;

public static class LearningModule
{
    public static IServiceCollection AddLearningModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(LearningModule).Assembly);
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(LearningModule).Assembly));
        services.AddValidatorsFromAssembly(typeof(LearningModule).Assembly);
        services.AddScoped<ILearningRepository, LearningRepository>();
        return services;
    }
}
