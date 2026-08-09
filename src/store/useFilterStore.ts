import { create } from "zustand";
import type { FilterSnapshot, DateRange } from "../types";

export type FilterState = {
  equipmentId: string | null;
  digitalChannels: string[];
  analogueChannels: string[];
  dateRange: DateRange;
  sampleRate?: number;
  channelColours: Record<string, string>;

  setEquipment: (id: string | null) => void;
  addDigitalChannel: (channel: string) => void;
  removeDigitalChannel: (channel: string) => void;
  addAnalogueChannel: (channel: string) => void;
  removeAnalogueChannel: (channel: string) => void;
  toggleDigitalChannel: (channel: string) => void;
  toggleAnalogueChannel: (channel: string) => void;
  setDateRange: (dr: DateRange) => void;
  setSampleRate: (s?: number) => void;
  setChannelColour: (channel: string, colour: string) => void;
  replaceFilters: (snapshot: FilterSnapshot) => void;
  resetFilters: () => void;
};

const MAX_CHANNELS = 8;

export const useFilterStore = create<FilterState>((set, _get) => ({
  equipmentId: null,
  digitalChannels: [],
  analogueChannels: [],
  dateRange: null,
  sampleRate: undefined,
  channelColours: {},

  setEquipment: (id) => set(() => ({ equipmentId: id })),

  addDigitalChannel: (channel) =>
    set(
      (state) =>
        ({
          digitalChannels: state.digitalChannels.includes(channel)
            ? state.digitalChannels
            : [...state.digitalChannels, channel],
        }) as Partial<FilterState>,
    ),

  removeDigitalChannel: (channel) =>
    set(
      (state) =>
        ({
          digitalChannels: state.digitalChannels.filter((c) => c !== channel),
        }) as Partial<FilterState>,
    ),

  addAnalogueChannel: (channel) =>
    set(
      (state) =>
        ({
          analogueChannels: state.analogueChannels.includes(channel)
            ? state.analogueChannels
            : [...state.analogueChannels, channel],
        }) as Partial<FilterState>,
    ),

  removeAnalogueChannel: (channel) =>
    set(
      (state) =>
        ({
          analogueChannels: state.analogueChannels.filter((c) => c !== channel),
        }) as Partial<FilterState>,
    ),

  toggleDigitalChannel: (channel) =>
    set((state) => {
      const exists = state.digitalChannels.includes(channel);
      const total =
        state.digitalChannels.length + state.analogueChannels.length;
      if (!exists && total >= MAX_CHANNELS) return state; // ignore add beyond cap

      return {
        digitalChannels: exists
          ? state.digitalChannels.filter((c) => c !== channel)
          : [...state.digitalChannels, channel],
      } as Partial<FilterState>;
    }),

  toggleAnalogueChannel: (channel) =>
    set((state) => {
      const exists = state.analogueChannels.includes(channel);
      const total =
        state.digitalChannels.length + state.analogueChannels.length;
      if (!exists && total >= MAX_CHANNELS) return state;

      return {
        analogueChannels: exists
          ? state.analogueChannels.filter((c) => c !== channel)
          : [...state.analogueChannels, channel],
      } as Partial<FilterState>;
    }),

  setDateRange: (dr) => set(() => ({ dateRange: dr })),
  setSampleRate: (s) => set(() => ({ sampleRate: s })),
  setChannelColour: (channel, colour) =>
    set((state) => ({
      channelColours: { ...state.channelColours, [channel]: colour },
    })),

  replaceFilters: (snapshot) =>
    set(
      () =>
        ({
          equipmentId: snapshot.equipmentId ?? null,
          digitalChannels: snapshot.digitalChannels ?? [],
          analogueChannels: snapshot.analogueChannels ?? [],
          dateRange: snapshot.dateRange ?? null,
          sampleRate: snapshot.sampleRate,
          channelColours: snapshot.channelColours ?? {},
        }) as Partial<FilterState>,
    ),

  resetFilters: () =>
    set(
      () =>
        ({
          equipmentId: null,
          digitalChannels: [],
          analogueChannels: [],
          dateRange: null,
          sampleRate: undefined,
          channelColours: {},
        }) as Partial<FilterState>,
    ),
}));

export default useFilterStore;
