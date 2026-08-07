import { describe, expect, test } from "vitest";
import useFilterSlice, {
  type FilterState,
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
});
