import type { Data } from "plotly.js";
import { describe, expect, test } from "vitest";
import type { BucketedRecording } from "../types";
import { getPlotData } from "./getPlotData";

describe("getPlotData", () => {
  test("returns one Plotly.Data trace per unique channel in recordings", () => {
    const recordings: BucketedRecording[] = [
      {
        id: "rec1",
        name: "Recording 1",
        series: [
          { channel: "1", values: [10, 20], timestamps: [1000, 2000] },
          { channel: "2", values: [30, 40], timestamps: [1000, 2000] },
        ],
      },
      {
        id: "rec2",
        name: "Recording 2",
        series: [{ channel: "1", values: [50, 60], timestamps: [3000, 4000] }],
      },
    ];

    const colours = { "1": "#ff0000", "2": "#00ff00" };
    const result = getPlotData(recordings, colours);

    // Should have 2 traces (one per unique channel)
    expect(result).toHaveLength(2);

    // Check that we have traces for both channels
    const channelNames = result.map((trace: Partial<Data>) => trace.name);
    expect(channelNames).toContain("Channel 1");
    expect(channelNames).toContain("Channel 2");
  });

  test("each trace's marker.color equals the colour for that channel from the colours map", () => {
    const recordings: BucketedRecording[] = [
      {
        id: "rec1",
        name: "Recording 1",
        series: [
          { channel: "1", values: [10], timestamps: [1000] },
          { channel: "2", values: [20], timestamps: [1000] },
        ],
      },
    ];

    const colours = { "1": "#ff0000", "2": "#00ff00" };
    const result = getPlotData(recordings, colours);

    const trace1 = result.find(
      (t: Partial<Data>) => t.name === "Channel 1",
    ) as {
      marker?: { color?: string };
    };
    const trace2 = result.find(
      (t: Partial<Data>) => t.name === "Channel 2",
    ) as {
      marker?: { color?: string };
    };

    expect(trace1?.marker?.color).toBe("#ff0000");
    expect(trace2?.marker?.color).toBe("#00ff00");
  });

  test("x array of each trace equals timestamps for that channel; y array equals values", () => {
    const recordings: BucketedRecording[] = [
      {
        id: "rec1",
        name: "Recording 1",
        series: [{ channel: "1", values: [10, 20], timestamps: [1000, 2000] }],
      },
      {
        id: "rec2",
        name: "Recording 2",
        series: [{ channel: "1", values: [30, 40], timestamps: [3000, 4000] }],
      },
    ];

    const colours = { "1": "#ff0000" };
    const result = getPlotData(recordings, colours);

    const trace = result.find((t: Partial<Data>) => t.name === "Channel 1") as {
      x?: number[];
      y?: number[];
    };

    // Should combine all values and timestamps for channel "1"
    expect(trace?.x).toEqual([1000, 2000, 3000, 4000]);
    expect(trace?.y).toEqual([10, 20, 30, 40]);
  });

  test("returns [] for an empty recordings array", () => {
    const recordings: BucketedRecording[] = [];
    const colours = {};

    const result = getPlotData(recordings, colours);

    expect(result).toEqual([]);
  });

  test("channels absent from the colours map receive a fallback colour", () => {
    const recordings: BucketedRecording[] = [
      {
        id: "rec1",
        name: "Recording 1",
        series: [
          { channel: "1", values: [10], timestamps: [1000] },
          { channel: "2", values: [20], timestamps: [1000] },
        ],
      },
    ];

    // Only provide colour for channel "1"
    const colours = { "1": "#ff0000" };
    const result = getPlotData(recordings, colours);

    const trace1 = result.find(
      (t: Partial<Data>) => t.name === "Channel 1",
    ) as {
      marker?: { color?: string };
    };
    const trace2 = result.find(
      (t: Partial<Data>) => t.name === "Channel 2",
    ) as {
      marker?: { color?: string };
    };

    expect(trace1?.marker?.color).toBe("#ff0000");
    // Channel 2 should get fallback colour
    expect(trace2?.marker?.color).toBe("#cccccc");
  });
});
