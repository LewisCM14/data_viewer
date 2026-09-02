import { beforeEach, describe, expect, test, vi } from "vitest";

// vi.mock is hoisted — intercepts both import() and require()
vi.mock("./apollo/ApolloTelemetryRepository", () => ({
  default: class MockApolloRepo {
    getTimeseries() {
      return Promise.resolve([]);
    }
    getFilterOptions() {
      return Promise.resolve({
        equipments: [],
        digitalChannels: [],
        analogueChannels: [],
      });
    }
  },
}));

describe("repository (Apollo branch)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("returns ApolloTelemetryRepository when useApollo=true", async () => {
    const mod = await import("./repository");
    const repo = mod.getRepository(true);
    expect(repo).toBeDefined();
    expect(typeof repo.getTimeseries).toBe("function");
  });

  test("caches the Apollo instance on repeated calls", async () => {
    const mod = await import("./repository");
    const repo1 = mod.getRepository(true);
    const repo2 = mod.getRepository(true);
    expect(repo1).toBe(repo2);
  });
});
