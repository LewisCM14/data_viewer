import { describe, expect, test } from "vitest";
import usePersistentState from "./usePersistentState";
import useFilterSlice, {
  createFilterSliceInstance,
} from "../store/slices/filterSlice";
import { serialiseFiltersToSearch } from "../store/middleware/urlSyncMiddleware";

describe("usePersistentState mapping", () => {
  test("applyFromURL maps search to slice setters and toURL serialises state", () => {
    const slice = createFilterSliceInstance();
    const { toURL, applyFromURL } = usePersistentState();

    const state = {
      equipmentId: "eq1",
      digitalChannels: ["d1"],
      analogueChannels: ["a1"],
      dateRange: ["2020-01-01", "2020-01-02"],
      sampleRate: 10,
      channelColours: { c1: "#fff" },
    } as const;

    const q = serialiseFiltersToSearch(
      state as unknown as Record<string, unknown>,
    );
    applyFromURL(q);

    const got = slice.getState();
    expect(got.equipmentId).toBe("eq1");
    expect(got.digitalChannels).toEqual(["d1"]);
    expect(got.analogueChannels).toEqual(["a1"]);
    expect(got.dateRange).toEqual(["2020-01-01", "2020-01-02"]);
    expect(got.sampleRate).toBe(10);
    expect(got.channelColours.c1).toBe("#fff");

    // roundtrip
    const out = toURL();
    expect(typeof out).toBe("string");
  });
});

describe("usePersistentState", () => {
  test("toURL and applyFromURL round-trip", () => {
    const slice = useFilterSlice();
    slice.setState({
      equipmentId: "eq5",
      digitalChannels: ["d1"],
      sampleRate: 10,
    });
    const p = usePersistentState();
    const url = p.toURL();
    // clear and reapply
    slice.resetFilters();
    expect(slice.getState().equipmentId).toBeNull();
    p.applyFromURL(url);
    expect(slice.getState().equipmentId).toBe("eq5");
    expect(slice.getState().digitalChannels).toEqual(["d1"]);
    expect(slice.getState().sampleRate).toBe(10);
  });
});
