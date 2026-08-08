import { describe, expect, test } from "vitest";
import useFilterSlice, {
  createFilterSliceInstance,
  type FilterState,
  getLastFilterSlice,
  initialFilterState,
} from "./filterSlice";

describe("filterSlice initial state", () => {
  test("has the expected shape and defaults", () => {
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

  test("getState/setState stub updates state", () => {
    const s = useFilterSlice();
    expect(s.getState()).toEqual(initialFilterState);
    s.setState({ equipmentId: "eq1" });
    expect(s.getState().equipmentId).toBe("eq1");
  });

  test("setEquipment helper updates equipmentId", () => {
    const s = useFilterSlice();
    expect(s.getState().equipmentId).toBeNull();
    s.setEquipment("eq2");
    expect(s.getState().equipmentId).toBe("eq2");
  });

  test("addDigitalChannel appends unique channels", () => {
    const s = useFilterSlice();
    expect(s.getState().digitalChannels).toEqual([]);
    s.addDigitalChannel("d1");
    expect(s.getState().digitalChannels).toEqual(["d1"]);
    s.addDigitalChannel("d2");
    expect(s.getState().digitalChannels).toEqual(["d1", "d2"]);
  });

  test("addDigitalChannel is idempotent when adding the same channel twice", () => {
    const s = useFilterSlice();
    s.addDigitalChannel("d1");
    s.addDigitalChannel("d1");
    expect(s.getState().digitalChannels).toEqual(["d1"]);
  });

  test("removeDigitalChannel removes an existing channel", () => {
    const s = useFilterSlice();
    s.setState({ digitalChannels: ["d1", "d2"] });
    s.removeDigitalChannel("d1");
    expect(s.getState().digitalChannels).toEqual(["d2"]);
  });

  test("analogue channel add/remove and idempotency", () => {
    const s = useFilterSlice();
    expect(s.getState().analogueChannels).toEqual([]);
    s.addAnalogueChannel("a1");
    expect(s.getState().analogueChannels).toEqual(["a1"]);
    s.addAnalogueChannel("a1");
    expect(s.getState().analogueChannels).toEqual(["a1"]);
    s.addAnalogueChannel("a2");
    expect(s.getState().analogueChannels).toEqual(["a1", "a2"]);
    s.removeAnalogueChannel("a1");
    expect(s.getState().analogueChannels).toEqual(["a2"]);
  });

  test("setDateRange, setSampleRate, setChannelColour and resetFilters", () => {
    const s = useFilterSlice();
    s.setDateRange(["2020-01-01", "2020-01-02"]);
    expect(s.getState().dateRange).toEqual(["2020-01-01", "2020-01-02"]);
    s.setSampleRate(10);
    expect(s.getState().sampleRate).toBe(10);
    s.setChannelColour("1", "#ff0000");
    expect(s.getState().channelColours["1"]).toBe("#ff0000");
    s.resetFilters();
    expect(s.getState()).toEqual(initialFilterState);
  });

  test("createFilterSliceInstance registers as last slice", () => {
    const inst = createFilterSliceInstance();
    expect(getLastFilterSlice()).toBe(inst);
  });
});
