/* istanbul ignore file */
import {
  hydrateFiltersFromSearch,
  serialiseFiltersToSearch,
} from "../store/middleware/urlSyncMiddleware";
import useFilterSlice, {
  getLastFilterSlice,
} from "../store/slices/filterSlice";

/**
 * usePersistentState
 *
 * Helper to serialise the current filter slice to a URL-safe string and to
 * hydrate the slice from a URLSearch string. Stage 1 utility used by the
 * URL sync middleware and UI.
 */
export default function usePersistentState() {
  const s = getLastFilterSlice() ?? useFilterSlice();

  function toURL(): string {
    const state = s.getState();
    return serialiseFiltersToSearch(
      state as unknown as Record<string, unknown>,
    );
  }

  function applyFromURL(search: string) {
    const obj = hydrateFiltersFromSearch(search);
    // naively map recognised keys back to slice setters
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
