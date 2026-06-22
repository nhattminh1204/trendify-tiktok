export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const g = globalThis as typeof globalThis & {
      localStorage?: Record<string, unknown>;
    };
    if (g.localStorage && typeof (g.localStorage as { getItem?: unknown }).getItem !== "function") {
      console.warn(
        "[instrumentation] Broken localStorage detected — patching getItem/setItem/removeItem with no-ops"
      );
      const store: Record<string, string> = {};
      g.localStorage = {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
        get length() { return Object.keys(store).length; },
        key: (i: number) => Object.keys(store)[i] ?? null,
      };
    }
  }
}
