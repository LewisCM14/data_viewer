import { describe, expect, test } from "vitest";
import useFilterSlice from "./filterSlice";

describe("filterSlice edge cases", () => {
  test("removeDigitalChannel when channel not present is a no-op", () => {
    const s = useFilterSlice();
    s.resetFilters();
    expect(s.getState().digitalChannels).toEqual([]);
    // removing a non-existent channel should not throw and state remains unchanged
    s.removeDigitalChannel("nope");
    expect(s.getState().digitalChannels).toEqual([]);
  });

  test("removeAnalogueChannel when channel not present is a no-op", () => {
    const s = useFilterSlice();
    s.resetFilters();
    expect(s.getState().analogueChannels).toEqual([]);
    s.removeAnalogueChannel("nope");
    expect(s.getState().analogueChannels).toEqual([]);
  });
});
