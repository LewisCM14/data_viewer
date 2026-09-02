import { describe, expect, test } from "vitest";
import { serialiseFiltersToSearch } from "../store/middleware/urlSyncMiddleware";
import {
  createFilterSliceInstance,
  initialFilterState,
} from "../store/slices/filterSlice";
import usePersistentState from "./usePersistentState";

describe("usePersistentState branch coverage", () => {
  beforeEach(() => {
    // Reset slice state before each test
    const slice = createFilterSliceInstance();
    slice.resetFilters();
  });

  test("applyFromURL only sets equipmentId when only that is defined", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Simulate URL with only equipment
    applyFromURL("equipmentId=eq1");

    const state = slice.getState();
    expect(state.equipmentId).toBe("eq1");
    expect(state.digitalChannels).toEqual([]);
    expect(state.analogueChannels).toEqual([]);
  });

  test("applyFromURL only sets digitalChannels when only that is defined", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Simulate URL with only digital channels
    const q = serialiseFiltersToSearch({
      digitalChannels: ["d1", "d2"],
    });
    applyFromURL(q);

    const state = slice.getState();
    expect(state.digitalChannels).toEqual(["d1", "d2"]);
    expect(state.equipmentId).toBeNull();
  });

  test("applyFromURL only sets analogueChannels when only that is defined", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Simulate URL with only analogue channels
    const q = serialiseFiltersToSearch({
      analogueChannels: ["a1", "a2"],
    });
    applyFromURL(q);

    const state = slice.getState();
    expect(state.analogueChannels).toEqual(["a1", "a2"]);
    expect(state.equipmentId).toBeNull();
  });

  test("applyFromURL only sets dateRange when only that is defined", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Simulate URL with only date range
    const q = serialiseFiltersToSearch({
      dateRange: ["2024-01-01", "2024-01-31"],
    });
    applyFromURL(q);

    const state = slice.getState();
    expect(state.dateRange).toEqual(["2024-01-01", "2024-01-31"]);
    expect(state.equipmentId).toBeNull();
  });

  test("applyFromURL only sets sampleRate when only that is defined", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Simulate URL with only sample rate
    const q = serialiseFiltersToSearch({
      sampleRate: 10,
    });
    applyFromURL(q);

    const state = slice.getState();
    expect(state.sampleRate).toBe(10);
    expect(state.equipmentId).toBeNull();
  });

  test("applyFromURL only sets channelColours when only that is defined", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Simulate URL with only channel colours
    const q = serialiseFiltersToSearch({
      channelColours: { ch1: "#ff0000", ch2: "#00ff00" },
    });
    applyFromURL(q);

    const state = slice.getState();
    expect(state.channelColours).toEqual({
      ch1: "#ff0000",
      ch2: "#00ff00",
    });
    expect(state.equipmentId).toBeNull();
  });

  test("applyFromURL handles partial object update", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Apply some initial state
    applyFromURL("equipmentId=eq1");
    expect(slice.getState().equipmentId).toBe("eq1");

    // Apply new state with different fields
    const q = serialiseFiltersToSearch({
      sampleRate: 5,
      digitalChannels: ["d1"],
    });
    applyFromURL(q);

    const state = slice.getState();
    expect(state.equipmentId).toBe("eq1"); // Should still be there
    expect(state.sampleRate).toBe(5);
    expect(state.digitalChannels).toEqual(["d1"]);
  });

  test("applyFromURL handles undefined values gracefully", () => {
    const slice = createFilterSliceInstance();
    const { applyFromURL } = usePersistentState();

    // Simulate URL that doesn't contain expected fields
    applyFromURL("unknown=value");

    const state = slice.getState();
    expect(state).toEqual(initialFilterState);
  });

  test("toURL serialises all non-empty fields", () => {
    const slice = createFilterSliceInstance();
    const { toURL } = usePersistentState();

    slice.setState({
      equipmentId: "eq1",
      digitalChannels: ["d1", "d2"],
      analogueChannels: ["a1"],
      dateRange: ["2024-01-01", "2024-01-02"],
      sampleRate: 10,
      channelColours: { d1: "#fff", a1: "#000" },
    });

    const url = toURL();
    expect(url).toContain("equipmentId");
    expect(url).toContain("digitalChannels");
    expect(url).toContain("analogueChannels");
    expect(url).toContain("dateRange");
    expect(url).toContain("sampleRate");
    expect(url).toContain("channelColours");
  });

  test("toURL handles partial state", () => {
    const slice = createFilterSliceInstance();
    const { toURL } = usePersistentState();

    slice.setState({
      equipmentId: "eq1",
      sampleRate: 1,
    });

    const url = toURL();
    expect(url).toContain("equipmentId=eq1");
    expect(url).toContain("sampleRate=1");
  });
});
