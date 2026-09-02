/**
 * urlSyncMiddleware
 *
 * Stage 1 stub: provides functions to serialise a filter snapshot into a
 * URLSearchParams string and to hydrate a snapshot from one. The real
 * middleware will listen to store changes and call `history.replaceState`.
 */

/**
 * Create a JSON replacer that handles circular references.
 * Circular references are replaced with a "[Circular]" marker.
 */
function createCircularRefReplacer() {
  const seen = new WeakSet();

  return (_key: string, value: unknown): unknown => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
}

export function serialiseFiltersToSearch(params: Record<string, unknown>) {
  const sp = new URLSearchParams();
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v == null) return;
    if (typeof v === "object") {
      // Handle all objects uniformly (arrays, objects, etc.)
      try {
        sp.set(k, JSON.stringify(v, createCircularRefReplacer()));
      } catch {
        // If JSON.stringify fails, try array fallback before skipping
        if (Array.isArray(v)) {
          sp.set(k, (v as unknown[]).join(","));
        } else {
          // Skip non-serializable objects to avoid "[object Object]"
          return;
        }
      }
    } else {
      sp.set(k, String(v));
    }
  });
  return sp.toString();
}

export function hydrateFiltersFromSearch(search: string) {
  const sp = new URLSearchParams(search);
  const out: Record<string, unknown> = {};
  for (const [k, v] of sp.entries()) {
    // try JSON parse
    try {
      out[k] = JSON.parse(v);
    } catch {
      if (v.includes(",")) out[k] = v.split(",");
      else if (k === "digitalChannels" || k === "analogueChannels")
        out[k] = [v];
      else out[k] = v;
    }
  }
  return out;
}
