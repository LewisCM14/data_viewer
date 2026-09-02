/**
 * Legacy-compatible filter slice used by tests and older modules. This file
 * exposes a tiny factory `createFilterSliceInstance` and a default
 * `useFilterSlice` accessor that returns a shared instance. The slice uses a
 * simple closure-based state object (no React hooks) to make it easy to mock
 * and reset in tests.
 */

export interface FilterState {
  equipmentId: string | null;
  digitalChannels: string[];
  analogueChannels: string[];
  dateRange: [string, string] | null;
  sampleRate: number | undefined;
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

type SliceAPI = {
  getState: () => FilterState;
  setState: (p: Partial<FilterState>) => void;
  setEquipment: (id: string | null) => void;
  addDigitalChannel: (id: string) => void;
  removeDigitalChannel: (id: string) => void;
  addAnalogueChannel: (id: string) => void;
  removeAnalogueChannel: (id: string) => void;
  setDateRange: (r: [string, string] | null) => void;
  setSampleRate: (n?: number) => void;
  setChannelColour: (id: string, c: string) => void;
  resetFilters: () => void;
};

import { create } from "zustand";

let _lastSlice: SliceAPI | null = null;

// Helper functions to reduce nesting depth
const addChannelToState = (
  list: "digitalChannels" | "analogueChannels",
  id: string,
  state: FilterState,
): Partial<FilterState> | FilterState => {
  const isDuplicate = state[list].includes(id);
  if (isDuplicate) return state;
  return { [list]: [...state[list], id] };
};

const removeChannelFromState = (
  list: "digitalChannels" | "analogueChannels",
  id: string,
  state: FilterState,
): Partial<FilterState> => ({
  [list]: state[list].filter((c) => c !== id),
});

function makeSlice(): SliceAPI {
  // Create a per-instance Zustand store so each slice instance remains
  // isolated for tests and callers, but internally uses Zustand for state
  // management.

  const useSlice = create<
    FilterState & {
      setState: (p: Partial<FilterState>) => void;
      setEquipment: (id: string | null) => void;
      addDigitalChannel: (id: string) => void;
      removeDigitalChannel: (id: string) => void;
      addAnalogueChannel: (id: string) => void;
      removeAnalogueChannel: (id: string) => void;
      setDateRange: (r: [string, string] | null) => void;
      setSampleRate: (n?: number) => void;
      setChannelColour: (id: string, c: string) => void;
      resetFilters: () => void;
    }
  >((set) => ({
    ...initialFilterState,

    setState: (p: Partial<FilterState>) =>
      set((s) => ({ ...s, ...p }) as FilterState),

    setEquipment: (id: string | null) =>
      set(() => ({ equipmentId: id }) as FilterState),
    addDigitalChannel: (id: string) =>
      set((s: FilterState) => addChannelToState("digitalChannels", id, s)),
    removeDigitalChannel: (id: string) =>
      set((s: FilterState) => removeChannelFromState("digitalChannels", id, s)),
    addAnalogueChannel: (id: string) =>
      set((s: FilterState) => addChannelToState("analogueChannels", id, s)),
    removeAnalogueChannel: (id: string) =>
      set((s: FilterState) =>
        removeChannelFromState("analogueChannels", id, s),
      ),

    setDateRange: (r: [string, string] | null) =>
      set(() => ({ dateRange: r }) as FilterState),

    setSampleRate: (n?: number) =>
      set(() => ({ sampleRate: n }) as FilterState),
    setChannelColour: (id: string, c: string) =>
      set((s) => ({
        channelColours: { ...s.channelColours, [id]: c },
      })),
    resetFilters: () => set(() => ({ ...initialFilterState }) as FilterState),
  }));

  return {
    getState: () => {
      const s = useSlice.getState();
      return {
        equipmentId: s.equipmentId,
        digitalChannels: s.digitalChannels,
        analogueChannels: s.analogueChannels,
        dateRange: s.dateRange,
        sampleRate: s.sampleRate,
        channelColours: s.channelColours,
      } as FilterState;
    },

    setState: (p: Partial<FilterState>) => {
      const updates: Partial<FilterState> = {};
      if (p.equipmentId !== undefined) updates.equipmentId = p.equipmentId;
      if (p.digitalChannels !== undefined)
        updates.digitalChannels = p.digitalChannels;
      if (p.analogueChannels !== undefined)
        updates.analogueChannels = p.analogueChannels;
      if (p.dateRange !== undefined) updates.dateRange = p.dateRange;
      if (p.sampleRate !== undefined) updates.sampleRate = p.sampleRate;
      if (p.channelColours !== undefined)
        updates.channelColours = p.channelColours;
      useSlice.setState((s) => ({ ...s, ...updates }) as Partial<FilterState>);
    },

    setEquipment: (id: string | null) =>
      useSlice.setState(() => ({ equipmentId: id }) as Partial<FilterState>),
    addDigitalChannel: (id: string) =>
      useSlice.getState().addDigitalChannel(id),
    removeDigitalChannel: (id: string) =>
      useSlice.getState().removeDigitalChannel(id),
    addAnalogueChannel: (id: string) =>
      useSlice.getState().addAnalogueChannel(id),
    removeAnalogueChannel: (id: string) =>
      useSlice.getState().removeAnalogueChannel(id),

    setDateRange: (r: [string, string] | null) =>
      useSlice.setState(() => ({ dateRange: r }) as Partial<FilterState>),

    setSampleRate: (n?: number) =>
      useSlice.setState(() => ({ sampleRate: n }) as Partial<FilterState>),
    setChannelColour: (id: string, c: string) =>
      useSlice.getState().setChannelColour(id, c),
    resetFilters: () => useSlice.getState().resetFilters(),
  };
}

export function createFilterSliceInstance() {
  const inst = makeSlice();
  _lastSlice = inst;
  return inst;
}

export function getLastFilterSlice() {
  return _lastSlice;
}

export default function useFilterSlice() {
  _lastSlice ??= makeSlice();
  return _lastSlice;
}
