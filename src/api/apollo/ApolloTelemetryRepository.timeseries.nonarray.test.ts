import { describe, expect, test, vi } from "vitest";

// Mock the client to return a non-array timeseries payload
vi.mock("./client", () => ({
  createApolloClient: () => ({
    query: async () => ({ data: { timeseries: { not: "an array" } } }),
  }),
}));

import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository#getTimeseries (non-array)", () => {
  test("returns empty array when timeseries payload is not an array", async () => {
    const repo = new ApolloTelemetryRepository();
    const res = await repo.getTimeseries();
    expect(res).toEqual([]);
  });
});
