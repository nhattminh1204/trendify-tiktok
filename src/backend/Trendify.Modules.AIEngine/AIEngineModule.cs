using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.AIEngine.Infrastructure;
using Trendify.Shared.Abstractions;

namespace Trendify.Modules.AIEngine;

public static class AIEngineModule
{
    public static IServiceCollection AddAIEngineModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(AIEngineModule).Assembly);

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(AIEngineModule).Assembly));

        services.AddValidatorsFromAssembly(typeof(AIEngineModule).Assembly);

        // AI Providers
        services.AddHttpClient<OpenAIProvider>();
        services.AddHttpClient<AnthropicProvider>();
        services.AddHttpClient<GeminiProvider>();

        // Router & cost tracker
        services.AddScoped<AIProviderRouter>();
        services.AddScoped<AICostCalculator>();
        services.AddScoped<TokenBudgetService>();

        // Register router as IAIProvider entry point
        services.AddScoped<IAIProvider>(sp => sp.GetRequiredService<AIProviderRouter>());

        return services;
    }
}
