import { describe, expect, test } from "vitest";
import type { FilterState } from "../store/slices/filterSlice";
import { getLayout } from "./getLayout";

describe("getLayout", () => {
  test("xaxis.title.text is 'Timestamp'; yaxis.title.text is 'Value'", () => {
    const state: FilterState = {
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: 1,
      channelColours: {},
    };

    const layout = getLayout(state);

    expect(layout.xaxis?.title?.text).toBe("Timestamp");
    expect(layout.yaxis?.title?.text).toBe("Value");
  });

  test("when filterSlice.dateRange is set, xaxis.range equals [from, to]", () => {
    const state: FilterState = {
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: ["2024-01-01", "2024-01-31"],
      sampleRate: 1,
      channelColours: {},
    };

    const layout = getLayout(state);

    expect(layout.xaxis?.range).toEqual(["2024-01-01", "2024-01-31"]);
  });

  test("when filterSlice.dateRange is null, xaxis.range is undefined", () => {
    const state: FilterState = {
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: 1,
      channelColours: {},
    };

    const layout = getLayout(state);

    expect(layout.xaxis?.range).toBeUndefined();
  });
});
