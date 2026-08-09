import { describe, test, expect, vi } from "vitest";

// Simulate client.query throwing so the repository catches and returns defaults
vi.mock("./client", () => ({
  createApolloClient: () => ({
    query: async () => {
      throw new Error("boom");
    },
  }),
}));

import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository#getFilterOptions (error)", () => {
  test("returns empty arrays when the client throws", async () => {
    const repo = new ApolloTelemetryRepository();
    const res = await repo.getFilterOptions();
    expect(res).toEqual({
      equipments: [],
      digitalChannels: [],
      analogueChannels: [],
    });
  });
});
