import { beforeEach, describe, expect, it } from "vitest";
import { useFilterStore } from "./useFilterStore";

describe("useFilterStore actions", () => {
  beforeEach(() => {
    useFilterStore.setState({
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: undefined,
      channelColours: {},
    });
  });

  it("sets equipment", () => {
    useFilterStore.getState().setEquipment("eq1");
    expect(useFilterStore.getState().equipmentId).toBe("eq1");
  });

  it("adds and removes digital channels", () => {
    useFilterStore.getState().addDigitalChannel("d1");
    expect(useFilterStore.getState().digitalChannels).toEqual(["d1"]);
    useFilterStore.getState().addDigitalChannel("d1");
    expect(useFilterStore.getState().digitalChannels).toEqual(["d1"]);
    useFilterStore.getState().removeDigitalChannel("d1");
    expect(useFilterStore.getState().digitalChannels).toEqual([]);
  });

  it("adds and removes analogue channels", () => {
    useFilterStore.getState().addAnalogueChannel("a1");
    expect(useFilterStore.getState().analogueChannels).toEqual(["a1"]);
    useFilterStore.getState().removeAnalogueChannel("a1");
    expect(useFilterStore.getState().analogueChannels).toEqual([]);
  });

  it("toggles channels and enforces max channels", () => {
    // Populate with 7 channels (digital 5 + analogue 2)
    useFilterStore.setState({
      digitalChannels: ["d1", "d2", "d3", "d4", "d5"],
      analogueChannels: ["a1", "a2"],
    });
    // toggleAnalogueChannel should add the 8th
    useFilterStore.getState().toggleAnalogueChannel("a3");
    expect(useFilterStore.getState().analogueChannels).toContain("a3");
    // toggling another should be ignored due to cap
    useFilterStore.getState().toggleDigitalChannel("d6");
    expect(useFilterStore.getState().digitalChannels).not.toContain("d6");
    // toggling existing should remove
    useFilterStore.getState().toggleAnalogueChannel("a3");
    expect(useFilterStore.getState().analogueChannels).not.toContain("a3");
  });

  it("sets dateRange, sampleRate and colours", () => {
    useFilterStore.getState().setDateRange(["2024-01-01", "2024-12-31"]);
    expect(useFilterStore.getState().dateRange).toEqual([
      "2024-01-01",
      "2024-12-31",
    ]);
    useFilterStore.getState().setSampleRate(10);
    expect(useFilterStore.getState().sampleRate).toBe(10);
    useFilterStore.getState().setChannelColour("d1", "#123456");
    expect(useFilterStore.getState().channelColours.d1).toBe("#123456");
  });

  it("replaceFilters and resetFilters work", () => {
    useFilterStore
      .getState()
      .replaceFilters({
        equipmentId: 9,
        digitalChannels: ["d9"],
        analogueChannels: ["a9"],
        dateRange: { from: "x", to: "y" },
        sampleRate: 5,
        channelColours: { d9: "#fff" },
      });
    expect(useFilterStore.getState().equipmentId).toBe(9);
    expect(useFilterStore.getState().digitalChannels).toEqual(["d9"]);
    useFilterStore.getState().resetFilters();
    expect(useFilterStore.getState().digitalChannels).toEqual([]);
  });
});
