import { beforeEach, describe, expect, test } from "vitest";
import { createFilterSliceInstance, type FilterState } from "./filterSlice";

describe("filterSlice additional edge cases", () => {
  beforeEach(() => {
    createFilterSliceInstance();
  });

  test("partial setState preserves unspecified fields", () => {
    const s = createFilterSliceInstance();
    s.setState({
      equipmentId: "eq1",
      digitalChannels: ["d1"],
      sampleRate: 40,
    });

    s.setState({ equipmentId: "eq2" });

    const state = s.getState();
    expect(state.equipmentId).toBe("eq2");
    expect(state.digitalChannels).toEqual(["d1"]);
    expect(state.sampleRate).toBe(40);
  });

  test("setState with undefined values skips those properties", () => {
    const s = createFilterSliceInstance();
    s.setState({ equipmentId: "eq1" });
    s.setState({ equipmentId: undefined } as Partial<FilterState>);

    const state = s.getState();
    expect(state.equipmentId).toBe("eq1");
  });
});
