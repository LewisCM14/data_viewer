import { describe, expect, test } from "vitest";
import {
  hydrateFiltersFromSearch,
  serialiseFiltersToSearch,
} from "./urlSyncMiddleware";

describe("urlSyncMiddleware edge cases", () => {
  test("serialise handles circular arrays by falling back to join", () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing circular reference edge case
    const a: any[] = [];
    a.push(a);
    const s = serialiseFiltersToSearch({ arr: a } as Record<string, unknown>);
    // fallback will attempt to join the array; result should contain 'arr='
    expect(typeof s).toBe("string");
    expect(s.includes("arr=")).toBe(true);
  });

  test("serialise handles circular objects by falling back to string conversion", () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing circular reference edge case
    const o: Record<string, any> = {};
    o.self = o;
    const s = serialiseFiltersToSearch({ obj: o } as Record<string, unknown>);
    expect(typeof s).toBe("string");
    // hydration should not throw and should return a string for obj
    const parsed = hydrateFiltersFromSearch(s);
    expect(parsed.obj).toBeDefined();
  });
});
