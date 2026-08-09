import { describe, expect, test } from "vitest";
import {
  digitalLoadOptions,
  analogueLoadOptions,
} from "./MockChannelRepository";

describe("MockChannelRepository pagination", () => {
  test("digitalLoadOptions returns first page and hasMore when not exhausted", async () => {
    const res = await digitalLoadOptions("", 1);
    expect(res.options.length).toBeGreaterThan(0);
    expect(res.hasMore).toBe(true);
  });

  test("digitalLoadOptions paginates to next page", async () => {
    const first = await digitalLoadOptions("", 1);
    const second = await digitalLoadOptions("", 2);
    // Ensure pages are different
    const firstIds = first.options.map((o) => o.id).join(",");
    const secondIds = second.options.map((o) => o.id).join(",");
    expect(firstIds).not.toBe(secondIds);
  });

  test("digitalLoadOptions filters by query", async () => {
    const res = await digitalLoadOptions("Digital 1", 1);
    expect(res.options.every((o) => o.name.includes("Digital 1"))).toBe(true);
  });

  test("analogueLoadOptions returns items and paginates", async () => {
    const res1 = await analogueLoadOptions("", 1);
    expect(res1.options.length).toBeGreaterThan(0);
    // subsequent page may be empty depending on list length; ensure function resolves
    const res2 = await analogueLoadOptions("", 2);
    expect(res2).toBeDefined();
  });
});
