/**
 * urlSyncMiddleware
 *
 * Stage 1 stub: provides functions to serialise a filter snapshot into a
 * URLSearchParams string and to hydrate a snapshot from one. The real
 * middleware will listen to store changes and call `history.replaceState`.
 */

export function serialiseFiltersToSearch(params: Record<string, unknown>) {
  const sp = new URLSearchParams();
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v == null) return;
    if (Array.isArray(v)) {
      try {
        sp.set(k, JSON.stringify(v));
      } catch {
        sp.set(k, (v as unknown[]).join(","));
      }
    } else if (typeof v === "object") {
      try {
        sp.set(k, JSON.stringify(v));
      } catch {
        // Fallback: object couldn't be JSON.stringified (circular refs),
        // use explicit String conversion as a last resort.
        sp.set(k, String(v));
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
