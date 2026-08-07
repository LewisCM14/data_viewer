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

  /**
   * addDigitalChannel
   *
   * Add a digital channel id to the `digitalChannels` array. This is idempotent
   * — adding an already-present id will not duplicate it.
   */
  function addDigitalChannel(channelId: string) {
    const current = state.digitalChannels;
    if (!current.includes(channelId)) {
      setState({ digitalChannels: [...current, channelId] });
    }
  }

  /**
   * removeDigitalChannel
   *
   * Remove a digital channel id from the `digitalChannels` array if present.
   */
  function removeDigitalChannel(channelId: string) {
    if (state.digitalChannels.includes(channelId)) {
      setState({
        digitalChannels: state.digitalChannels.filter((c) => c !== channelId),
      });
    }
  }

  /**
   * addAnalogueChannel
   *
   * Add an analogue channel id to the `analogueChannels` array. Idempotent.
   */
  function addAnalogueChannel(channelId: string) {
    const current = state.analogueChannels;
    if (!current.includes(channelId)) {
      setState({ analogueChannels: [...current, channelId] });
    }
  }

  /**
   * removeAnalogueChannel
   *
   * Remove an analogue channel id from the `analogueChannels` array if present.
   */
  function removeAnalogueChannel(channelId: string) {
    if (state.analogueChannels.includes(channelId)) {
      setState({
        analogueChannels: state.analogueChannels.filter((c) => c !== channelId),
      });
    }
  }

  /**
   * setDateRange
   *
   * Set the selected date range as a tuple of ISO strings `[from, to]` or `null`.
   */
  function setDateRange(range: [string, string] | null) {
    setState({ dateRange: range });
  }

  /**
   * setSampleRate
   *
   * Update the `sampleRate` numeric value.
   */
  function setSampleRate(rate: number) {
    setState({ sampleRate: rate });
  }

  /**
   * setChannelColour
   *
   * Assign a hex colour string to a channel id.
   */
  function setChannelColour(channelId: string, colour: string) {
    setState({
      channelColours: { ...state.channelColours, [channelId]: colour },
    });
  }

  /**
   * resetFilters
   *
   * Restore the slice to `initialFilterState`.
   */
  function resetFilters() {
    state = { ...initialFilterState };
  }

  const inst = {
    getState,
    setState,
    setEquipment,
    addDigitalChannel,
    removeDigitalChannel,
    addAnalogueChannel,
    removeAnalogueChannel,
    setDateRange,
    setSampleRate,
    setChannelColour,
    resetFilters,
    initialFilterState,
  } as const;
  // register as the last-created instance for helpers/tests
  // `_lastSlice` is declared below; assign directly to keep a shared instance
  _lastSlice = inst as ReturnType<typeof useFilterSlice>;
  return inst;
}
// Keep a reference to the last-created slice so utilities can access the
// same instance when needed (tests and simple helpers expect a shared
// point of access without a full store provider).
let _lastSlice: ReturnType<typeof useFilterSlice> | null = null;

export function getLastFilterSlice() {
  return _lastSlice;
}

// Wrap the factory so we can capture instances created by callers.
export function createFilterSliceInstance() {
  const inst = useFilterSlice();
  _lastSlice = inst;
  return inst;
}
