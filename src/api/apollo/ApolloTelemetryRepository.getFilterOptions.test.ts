import { describe, expect, test, vi } from "vitest";

// Mock the client factory before importing the repository so the instance
// created in the module uses our mocked client.
vi.mock("./client", () => ({
  createApolloClient: () => ({
    query: async () => ({
      data: {
        filterOptions: {
          equipments: [{ id: "eqX", name: "Equipment X" }],
          digitalChannels: [{ id: "dX", name: "Digital X", color: "#fff" }],
          analogueChannels: [{ id: "aX", name: "Analogue X", color: "#000" }],
        },
      },
    }),
  }),
}));

import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository#getFilterOptions", () => {
  test("returns filter options from the GraphQL response when present", async () => {
    const repo = new ApolloTelemetryRepository();
    const res = await repo.getFilterOptions();
    expect(res).toHaveProperty("equipments");
    expect(res.equipments[0].id).toBe("eqX");
    expect(res.digitalChannels[0].id).toBe("dX");
    expect(res.analogueChannels[0].id).toBe("aX");
  });
});
