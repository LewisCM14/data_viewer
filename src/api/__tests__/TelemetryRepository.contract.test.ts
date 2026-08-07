import { describe, expect, test } from "vitest";
import MockTelemetryRepository from "../mock/MockTelemetryRepository";

describe("TelemetryRepository contract - MockTelemetryRepository", () => {
  test("getTimeseries returns an array of BucketedRecording items", async () => {
    const data = await MockTelemetryRepository.getTimeseries();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const item = data[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("series");
    expect(Array.isArray(item.series)).toBe(true);
    const series = item.series[0];
    expect(series).toHaveProperty("channel");
    expect(series).toHaveProperty("values");
    expect(series).toHaveProperty("timestamps");
  });
});
