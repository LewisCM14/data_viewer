import { beforeEach, describe, expect, test } from "vitest";
import MockTelemetryRepository from "./MockTelemetryRepository";

beforeEach(() => {
  MockTelemetryRepository.simulateError = false;
  MockTelemetryRepository.simulateSlowResponse = false;
  MockTelemetryRepository.callCount = 0;
});

describe("MockTelemetryRepository", () => {
  test("simulateError rejects", async () => {
    MockTelemetryRepository.simulateError = true;
    await expect(MockTelemetryRepository.getTimeseries()).rejects.toThrow(
      "simulated error",
    );
  });

  test("callCount increments and channel filter works", async () => {
    const _r1 = await MockTelemetryRepository.getTimeseries();
    expect(MockTelemetryRepository.callCount).toBe(1);

    // request only channel '1' — all returned recordings should include series for channel '1'
    const r2 = await MockTelemetryRepository.getTimeseries({ channels: ["1"] });
    expect(Array.isArray(r2)).toBe(true);
    expect(r2.every((rec) => rec.series.some((s) => s.channel === "1"))).toBe(
      true,
    );
  });

  test("honours abort signal when slow response", async () => {
    MockTelemetryRepository.simulateSlowResponse = true;
    const controller = new AbortController();
    const p = MockTelemetryRepository.getTimeseries({
      signal: controller.signal,
    });
    controller.abort();
    await expect(p).rejects.toBeTruthy();
  });

  test("rejects immediately if signal already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      MockTelemetryRepository.getTimeseries({ signal: controller.signal }),
    ).rejects.toBeTruthy();
  });
});

import { MOCK_RECORDINGS } from "./fixtures";

describe("MockTelemetryRepository (fixtures)", () => {
  test("getTimeseries returns mock data", async () => {
    const data = await MockTelemetryRepository.getTimeseries();
    expect(data).toEqual(MOCK_RECORDINGS);
  });
});
