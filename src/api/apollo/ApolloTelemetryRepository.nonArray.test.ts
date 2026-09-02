import { describe, expect, test, vi } from "vitest";

// Simulate client returning non-array fields in the payload
vi.mock("./client", () => ({
  createApolloClient: () => ({
    query: async () => ({
      data: {
        filterOptions: {
          equipments: "not-an-array",
          digitalChannels: null,
          analogueChannels: undefined,
        },
      },
    }),
  }),
}));

import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository#getFilterOptions (non-array fields)", () => {
  test("returns empty arrays when payload fields are not arrays", async () => {
    const repo = new ApolloTelemetryRepository();
    const res = await repo.getFilterOptions();
    expect(res.equipments).toEqual([]);
    expect(res.digitalChannels).toEqual([]);
    expect(res.analogueChannels).toEqual([]);
  });
});
