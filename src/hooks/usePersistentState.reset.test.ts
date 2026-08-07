import { describe, expect, test, vi } from "vitest";

describe("usePersistentState module-reset fallback", () => {
  test("falls back to useFilterSlice when no last slice registered", async () => {
    // reset module registry so internal _lastSlice is null again
    vi.resetModules();
    const mod = await import("./usePersistentState");
    const p = mod.default();
    const url = p.toURL();
    expect(typeof url).toBe("string");
  });
});
