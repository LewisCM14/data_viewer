import { describe, expect, test, vi } from "vitest";

describe("repository", () => {
  beforeEach(() => {
    // Reset modules before each test
    vi.resetModules();
  });

  test("returns MockTelemetryRepository when PROD is not set", async () => {
    const mod = await import("./repository");
    const repo = mod.default();

    expect(repo).toBeDefined();
    expect(typeof repo).toBe("object");
    expect("getTimeseries" in repo).toBe(true);
  });

  test("getRepository returns a repository instance", async () => {
    const mod = await import("./repository");
    const { getRepository } = mod;
    const repo = getRepository();

    expect(repo).toBeDefined();
    expect(typeof repo).toBe("object");
    expect(typeof repo.getTimeseries).toBe("function");
  });

  test("getRepository and default export are the same function", async () => {
    const mod = await import("./repository");
    expect(mod.getRepository).toBe(mod.default);
  });

  test("returns same instance on multiple getRepository calls", async () => {
    const mod = await import("./repository");
    const repo1 = mod.getRepository();
    const repo2 = mod.getRepository();

    expect(repo1).toBe(repo2);
  });

  test("MockTelemetryRepository has required methods", async () => {
    const mod = await import("./repository");
    const repo = mod.getRepository();

    expect(typeof repo.getTimeseries).toBe("function");
    // Check if getFilterOptions exists (it's optional)
    if ("getFilterOptions" in repo) {
      expect(typeof repo.getFilterOptions).toBe("function");
    }
  });
});
