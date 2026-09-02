import { beforeEach, describe, expect, test } from "vitest";
import useFilterSlice, {
  createFilterSliceInstance,
  type FilterState,
  getLastFilterSlice,
  initialFilterState,
} from "./filterSlice";

describe("filterSlice", () => {
  beforeEach(() => {
    // Fresh instance for each test
    createFilterSliceInstance();
  });

  test("initialFilterState has correct defaults", () => {
    const expected: FilterState = {
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: 1,
      channelColours: {},
    };
    expect(initialFilterState).toEqual(expected);
  });

  test("getState returns current state", () => {
    const s = useFilterSlice();
    expect(s.getState()).toEqual(initialFilterState);
  });

  test("setState with partial updates", () => {
    const s = createFilterSliceInstance();
    s.setState({ equipmentId: "eq1" });
    expect(s.getState().equipmentId).toBe("eq1");
  });

  test("setState with empty object preserves state", () => {
    const s = createFilterSliceInstance();
    s.setState({ equipmentId: "eq1" });
    const before = s.getState();
    s.setState({});
    const after = s.getState();
    expect(after.equipmentId).toBe(before.equipmentId);
  });

  test("setEquipment updates equipmentId", () => {
    const s = createFilterSliceInstance();
    s.setEquipment("eq-test");
    expect(s.getState().equipmentId).toBe("eq-test");

    s.setEquipment(null);
    expect(s.getState().equipmentId).toBeNull();
  });

  test("addDigitalChannel adds unique channels only", () => {
    const s = createFilterSliceInstance();
    s.addDigitalChannel("d1");
    expect(s.getState().digitalChannels).toEqual(["d1"]);

    s.addDigitalChannel("d1");
    expect(s.getState().digitalChannels).toEqual(["d1"]);

    s.addDigitalChannel("d2");
    expect(s.getState().digitalChannels).toEqual(["d1", "d2"]);
  });

  test("removeDigitalChannel removes channels", () => {
    const s = createFilterSliceInstance();
    s.setState({ digitalChannels: ["d1", "d2", "d3"] });
    s.removeDigitalChannel("d2");
    expect(s.getState().digitalChannels).toEqual(["d1", "d3"]);
  });

  test("removeDigitalChannel is no-op when channel absent", () => {
    const s = createFilterSliceInstance();
    s.removeDigitalChannel("nothere");
    expect(s.getState().digitalChannels).toEqual([]);
  });

  test("addAnalogueChannel adds unique channels only", () => {
    const s = createFilterSliceInstance();
    s.addAnalogueChannel("a1");
    expect(s.getState().analogueChannels).toEqual(["a1"]);

    s.addAnalogueChannel("a1");
    expect(s.getState().analogueChannels).toEqual(["a1"]);

    s.addAnalogueChannel("a2");
    expect(s.getState().analogueChannels).toEqual(["a1", "a2"]);
  });

  test("removeAnalogueChannel removes channels", () => {
    const s = createFilterSliceInstance();
    s.setState({ analogueChannels: ["a1", "a2", "a3"] });
    s.removeAnalogueChannel("a2");
    expect(s.getState().analogueChannels).toEqual(["a1", "a3"]);
  });

  test("removeAnalogueChannel is no-op when channel absent", () => {
    const s = createFilterSliceInstance();
    s.removeAnalogueChannel("nothere");
    expect(s.getState().analogueChannels).toEqual([]);
  });

  test("setDateRange updates date range", () => {
    const s = createFilterSliceInstance();
    const range: [string, string] = ["2020-01-01", "2020-12-31"];
    s.setDateRange(range);
    expect(s.getState().dateRange).toEqual(range);

    s.setDateRange(null);
    expect(s.getState().dateRange).toBeNull();
  });

  test("setSampleRate updates sample rate", () => {
    const s = createFilterSliceInstance();
    s.setSampleRate(10);
    expect(s.getState().sampleRate).toBe(10);

    s.setSampleRate(0);
    expect(s.getState().sampleRate).toBe(0);

    s.setSampleRate(undefined);
    expect(s.getState().sampleRate).toBeUndefined();
  });

  test("setChannelColour updates color for channel", () => {
    const s = createFilterSliceInstance();
    s.setChannelColour("ch1", "#ff0000");
    expect(s.getState().channelColours.ch1).toBe("#ff0000");

    s.setChannelColour("ch1", "#00ff00");
    expect(s.getState().channelColours.ch1).toBe("#00ff00");

    s.setChannelColour("ch2", "#0000ff");
    expect(s.getState().channelColours).toEqual({
      ch1: "#00ff00",
      ch2: "#0000ff",
    });
  });

  test("resetFilters clears all state", () => {
    const s = createFilterSliceInstance();
    s.setEquipment("eq1");
    s.addDigitalChannel("d1");
    s.addAnalogueChannel("a1");
    s.setDateRange(["2020-01-01", "2020-12-31"]);
    s.setSampleRate(30);
    s.setChannelColour("c1", "#aabbcc");

    s.resetFilters();
    expect(s.getState()).toEqual(initialFilterState);
  });

  test("createFilterSliceInstance creates new instance", () => {
    const inst1 = createFilterSliceInstance();
    inst1.setEquipment("eq1");
    expect(getLastFilterSlice()).toBe(inst1);

    const inst2 = createFilterSliceInstance();
    inst2.setEquipment("eq2");
    expect(getLastFilterSlice()).toBe(inst2);
    expect(inst1.getState().equipmentId).toBe("eq1");
  });

  test("getLastFilterSlice returns last instance", () => {
    const inst = createFilterSliceInstance();
    expect(getLastFilterSlice()).toBe(inst);
  });

  test("useFilterSlice caches instance when _lastSlice not null", () => {
    createFilterSliceInstance();
    const inst2 = useFilterSlice();
    expect(getLastFilterSlice()).toBe(inst2);
  });

  test("setState with all property types", () => {
    const s = createFilterSliceInstance();
    s.setState({
      equipmentId: "eq-new",
      digitalChannels: ["d1", "d2"],
      analogueChannels: ["a1"],
      dateRange: ["2021-01-01", "2021-12-31"],
      sampleRate: 25,
      channelColours: { x: "#123", y: "#456" },
    });

    const state = s.getState();
    expect(state.equipmentId).toBe("eq-new");
    expect(state.digitalChannels).toEqual(["d1", "d2"]);
    expect(state.analogueChannels).toEqual(["a1"]);
    expect(state.dateRange).toEqual(["2021-01-01", "2021-12-31"]);
    expect(state.sampleRate).toBe(25);
    expect(state.channelColours).toEqual({ x: "#123", y: "#456" });
  });

  test("multiple property updates in sequence", () => {
    const s = createFilterSliceInstance();

    s.setState({ equipmentId: "eq1" });
    s.setState({ digitalChannels: ["d1"] });
    s.setState({ analogueChannels: ["a1"] });
    s.setState({ dateRange: ["2020-01-01", "2020-12-31"] });
    s.setState({ sampleRate: 35 });
    s.setState({ channelColours: { c: "#789" } });

    const state = s.getState();
    expect(state.equipmentId).toBe("eq1");
    expect(state.digitalChannels).toEqual(["d1"]);
    expect(state.analogueChannels).toEqual(["a1"]);
    expect(state.dateRange).toEqual(["2020-01-01", "2020-12-31"]);
    expect(state.sampleRate).toBe(35);
    expect(state.channelColours).toEqual({ c: "#789" });
  });

  test("complex channel operations", () => {
    const s = createFilterSliceInstance();

    // Digital channels
    s.addDigitalChannel("d1");
    s.addDigitalChannel("d2");
    s.addDigitalChannel("d3");
    expect(s.getState().digitalChannels).toHaveLength(3);

    s.removeDigitalChannel("d2");
    expect(s.getState().digitalChannels).toHaveLength(2);
    expect(s.getState().digitalChannels).not.toContain("d2");

    // Analogue channels
    s.addAnalogueChannel("a1");
    s.addAnalogueChannel("a2");
    expect(s.getState().analogueChannels).toHaveLength(2);

    s.removeAnalogueChannel("a1");
    expect(s.getState().analogueChannels).toHaveLength(1);
    expect(s.getState().analogueChannels).toEqual(["a2"]);
  });

  test("state isolation between instances", () => {
    const inst1 = createFilterSliceInstance();
    inst1.setEquipment("eq1");
    inst1.addDigitalChannel("d1");

    const inst2 = createFilterSliceInstance();
    inst2.setEquipment("eq2");
    inst2.addDigitalChannel("d2");

    expect(inst1.getState().equipmentId).toBe("eq1");
    expect(inst1.getState().digitalChannels).toEqual(["d1"]);

    expect(inst2.getState().equipmentId).toBe("eq2");
    expect(inst2.getState().digitalChannels).toEqual(["d2"]);
  });
});
