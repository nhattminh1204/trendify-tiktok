using System.Reflection;

namespace Trendify.Infrastructure.Persistence;

// Populated at startup by each module's registration call.
public static class ModuleAssemblies
{
    private static readonly List<Assembly> _assemblies = [];

    public static IReadOnlyList<Assembly> All => _assemblies.AsReadOnly();

    public static void Register(Assembly assembly)
    {
        if (!_assemblies.Contains(assembly))
            _assemblies.Add(assembly);
    }
}
