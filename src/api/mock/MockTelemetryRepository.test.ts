import { describe, expect, test } from "vitest";
import { MOCK_RECORDINGS } from "./fixtures";
import MockTelemetryRepository from "./MockTelemetryRepository";

describe("MockTelemetryRepository", () => {
  test("getTimeseries returns mock data", async () => {
    const data = await MockTelemetryRepository.getTimeseries();
    expect(data).toEqual(MOCK_RECORDINGS);
  });
});
