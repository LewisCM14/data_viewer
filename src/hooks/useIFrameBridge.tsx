import { useEffect } from "react";
import { parseFiltersFromQuery, type FilterSnapshot } from "../types";
import { useFilterStore } from "../store/useFilterStore";

export function useIFrameBridge() {
  const replaceFilters = useFilterStore((s) => s.replaceFilters);

  useEffect(() => {
    function handler(ev: MessageEvent) {
      try {
        if (!ev.data || typeof ev.data !== "object") return;
        // biome-ignore lint/suspicious/noExplicitAny: postMessage payloads have a loose shape
        const { type, payload } = ev.data as { type?: string; payload?: any };

        if (type === "SET_FILTERS") {
          // payload may be a query-string or FilterSnapshot
          let snapshot: FilterSnapshot | null = null;
          if (typeof payload === "string")
            snapshot = parseFiltersFromQuery(payload);
          else if (typeof payload === "object")
            snapshot = payload as FilterSnapshot;

          if (snapshot) {
            replaceFilters(snapshot);
            // acknowledge
            try {
              // Attempt to call `postMessage` on the message source if present.
              type PostMessageTarget = {
                postMessage?: (message: unknown, origin?: string) => void;
              } | null;
              const target = ev.source as unknown as PostMessageTarget;
              target?.postMessage?.(
                { type: "FILTERS_APPLIED" },
                ev.origin || "*",
              );
            } catch (_error_) {
              // ignore postMessage errors
            }
          }
        }
      } catch (_error_) {
        // swallow bad messages
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [replaceFilters]);
}

export default useIFrameBridge;
