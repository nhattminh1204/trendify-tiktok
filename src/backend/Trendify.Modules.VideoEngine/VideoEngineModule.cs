using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.VideoEngine.Infrastructure;
using Trendify.Modules.VideoEngine.Jobs;

namespace Trendify.Modules.VideoEngine;

public static class VideoEngineModule
{
    public static IServiceCollection AddVideoEngineModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(VideoEngineModule).Assembly);

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(VideoEngineModule).Assembly));

        services.AddValidatorsFromAssembly(typeof(VideoEngineModule).Assembly);

        services.AddScoped<IVideoEngineRepository, VideoEngineRepository>();

        services.AddScoped<VideoRenderWorker>();
        services.AddScoped<StaleJobCleanupJob>();

        var pythonPath = configuration["VideoEngine:PythonPath"] ?? "python";
        var workerScript = configuration["VideoEngine:WorkerScript"]
            ?? Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "workers", "video-engine", "render_worker.py");

        services.AddSingleton(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<PythonSidecarService>>();
            return new PythonSidecarService(pythonPath, workerScript, logger);
        });

        return services;
    }
}
