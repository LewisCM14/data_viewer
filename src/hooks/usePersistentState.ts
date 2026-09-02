import { useEffect } from "react";
import {
  hydrateFiltersFromSearch,
  serialiseFiltersToSearch,
} from "../store/middleware/urlSyncMiddleware";
import {
  createFilterSliceInstance,
  getLastFilterSlice,
} from "../store/slices/filterSlice";
import { type FilterState, useFilterStore } from "../store/useFilterStore";
import { parseFiltersFromQuery, serializeFiltersToQuery } from "../types";

/**
 * Named hook: hydrates filter store from the current URL on mount and keeps
 * the URL query string in sync with filter state changes.
 */
export function usePersistentState() {
  const replaceFilters = useFilterStore((s) => s.replaceFilters);

  useEffect(() => {
    try {
      const snapshot = parseFiltersFromQuery(globalThis.location.search);
      const hasAny =
        snapshot.equipmentId !== undefined ||
        (snapshot.digitalChannels && snapshot.digitalChannels.length > 0) ||
        (snapshot.analogueChannels && snapshot.analogueChannels.length > 0) ||
        (snapshot.dateRange &&
          (snapshot.dateRange.from || snapshot.dateRange.to)) ||
        snapshot.sampleRate !== undefined ||
        (snapshot.channelColours &&
          Object.keys(snapshot.channelColours).length > 0);

      if (hasAny) replaceFilters(snapshot);
    } catch (error) {
      console.warn("Failed to restore filters from URL search params:", error);
    }

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const unsub = useFilterStore.subscribe((s: FilterState) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        try {
          const q = serializeFiltersToQuery({
            equipmentId: s.equipmentId ? Number(s.equipmentId) : null,
            digitalChannels: s.digitalChannels,
            analogueChannels: s.analogueChannels,
            dateRange: s.dateRange,
            sampleRate: s.sampleRate,
            channelColours: s.channelColours,
          });
          const url = q
            ? `${globalThis.location.pathname}?${q}`
            : globalThis.location.pathname;
          globalThis.history.replaceState({}, "", url);
        } catch (error) {
          console.warn("Failed to sync filters to URL search params:", error);
        }
      }, 200);
    });

    const onPop = () => {
      try {
        const snapshot = parseFiltersFromQuery(globalThis.location.search);
        replaceFilters(snapshot);
      } catch (error) {
        console.warn(
          "Failed to restore filters on browser back/forward:",
          error,
        );
      }
    };
    globalThis.addEventListener("popstate", onPop);

    return () => {
      unsub();
      globalThis.removeEventListener("popstate", onPop);
      if (timeout) clearTimeout(timeout);
    };
  }, [replaceFilters]);
}

/**
 * Default export: compatibility factory used by older code/tests. Returns a
 * small API with `toURL` and `applyFromURL` that operates against the
 * Zustand store.
 */
export default function createPersistentState() {
  // Legacy factory compatible with earlier modules/tests — operates on the
  // legacy slice implementation rather than the Zustand store.
  const s = getLastFilterSlice() ?? createFilterSliceInstance();

  function toURL(): string {
    const state = s.getState();
    return serialiseFiltersToSearch(
      state as unknown as Record<string, unknown>,
    );
  }

  function applyFromURL(search: string) {
    const obj = hydrateFiltersFromSearch(search);
    // Map recognised keys back to slice setters
    if (obj.equipmentId !== undefined)
      s.setEquipment(obj.equipmentId as string | null);
    if (obj.digitalChannels !== undefined)
      s.setState({ digitalChannels: obj.digitalChannels as string[] });
    if (obj.analogueChannels !== undefined)
      s.setState({ analogueChannels: obj.analogueChannels as string[] });
    if (obj.dateRange !== undefined)
      s.setDateRange(obj.dateRange as [string, string] | null);
    if (obj.sampleRate !== undefined) s.setSampleRate(Number(obj.sampleRate));
    if (obj.channelColours !== undefined)
      s.setState({
        channelColours: obj.channelColours as Record<string, string>,
      });
  }

  return { toURL, applyFromURL };
}
