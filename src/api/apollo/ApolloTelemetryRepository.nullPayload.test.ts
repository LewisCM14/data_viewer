import { describe, expect, test, vi } from "vitest";

// Simulate client.query returning data without a filterOptions field
vi.mock("./client", () => ({
  createApolloClient: () => ({
    query: async () => ({ data: {} }),
  }),
}));

import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository#getFilterOptions (null payload)", () => {
  test("returns empty arrays when filterOptions is absent from response", async () => {
    const repo = new ApolloTelemetryRepository();
    const res = await repo.getFilterOptions();
    expect(res).toEqual({
      equipments: [],
      digitalChannels: [],
      analogueChannels: [],
    });
  });
});
