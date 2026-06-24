using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Trendify.Infrastructure.Persistence;
using Trendify.Modules.Products.Infrastructure;

namespace Trendify.Modules.Products;

public static class ProductsModule
{
    public static IServiceCollection AddProductsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ModuleAssemblies.Register(typeof(ProductsModule).Assembly);
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(ProductsModule).Assembly));
        services.AddValidatorsFromAssembly(typeof(ProductsModule).Assembly);
        services.AddScoped<IProductsRepository, ProductsRepository>();
        return services;
    }
}
