import { describe, test, expect } from "vitest";
import MockTelemetryRepository from "./MockTelemetryRepository";
import { MOCK_RECORDINGS } from "./fixtures";

describe("MockTelemetryRepository", () => {
  test("getTimeseries returns mock data", async () => {
    const data = await MockTelemetryRepository.getTimeseries();
    expect(data).toEqual(MOCK_RECORDINGS);
  });
});
