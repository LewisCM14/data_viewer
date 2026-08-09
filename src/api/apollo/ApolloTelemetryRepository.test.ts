import { describe, expect, test, vi } from "vitest";

// Prevent network call by mocking the client used inside the repository
vi.mock("./client", () => ({
  createApolloClient: () => ({
    query: vi.fn(async () => ({ data: {} })),
  }),
}));

import ApolloTelemetryRepository from "./ApolloTelemetryRepository";

describe("ApolloTelemetryRepository", () => {
  test("getTimeseries returns empty array by default", async () => {
    const repo = new ApolloTelemetryRepository();
    const res = await repo.getTimeseries();
    expect(res).toEqual([]);
  });
});
