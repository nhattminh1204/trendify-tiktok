using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Accounts.Infrastructure;
using Trendify.Modules.Accounts.Infrastructure.TikTok;
using Trendify.Modules.Accounts.Jobs;

namespace Trendify.Modules.Accounts;

public static class AccountsModule
{
    public static IServiceCollection AddAccountsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(AccountsModule).Assembly);

        services.AddScoped<IAccountsRepository, AccountsRepository>();

        services.Configure<TikTokOptions>(configuration.GetSection(TikTokOptions.Section));
        services.AddHttpClient<TikTokOAuthService>();

        // Hangfire job — token refresh runs every 30 min
        services.AddScoped<TikTokTokenRefreshJob>();

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(AccountsModule).Assembly));

        services.AddValidatorsFromAssembly(typeof(AccountsModule).Assembly);

        return services;
    }
}
