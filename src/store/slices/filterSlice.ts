/**
 * FilterState
 *
 * The minimal shape used by the walking skeleton for the filter slice.
 * Replace with a fully-featured Zustand slice in later stages.
 */
export interface FilterState {
  equipmentId: string | null;
  digitalChannels: string[];
  analogueChannels: string[];
  dateRange: [string, string] | null;
  sampleRate: number;
  channelColours: Record<string, string>;
}

export const initialFilterState: FilterState = {
  equipmentId: null,
  digitalChannels: [],
  analogueChannels: [],
  dateRange: null,
  sampleRate: 1,
  channelColours: {},
};

/**
 * useFilterSlice
 *
 * Lightweight in-memory slice used during the initial walking skeleton to
 * expose a `getState` / `setState` API. This mirrors what a Zustand slice
 * would provide but avoids adding store wiring at Stage 0.
 */
export default function useFilterSlice() {
  // Minimal stub for Stage 0; in real app this would use Zustand or redux
  let state: FilterState = { ...initialFilterState };

  function getState() {
    return state;
  }

  function setState(partial: Partial<FilterState>) {
    state = { ...state, ...partial };
  }

  /**
   * setEquipment
   *
   * Update the currently selected equipment identifier in the filter slice.
   * Use `null` to clear the selection.
   */
  function setEquipment(equipmentId: string | null) {
    setState({ equipmentId });
  }

  return { getState, setState, setEquipment, initialFilterState };
}
