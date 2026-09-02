import { describe, expect, test, vi, afterEach } from "vitest";
import {
  hydrateFiltersFromSearch,
  serialiseFiltersToSearch,
} from "./urlSyncMiddleware";

describe("urlSyncMiddleware edge cases", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  test("serialise handles array JSON.stringify failure by joining", () => {
    // Mock JSON.stringify to throw on arrays
    const originalStringify = JSON.stringify;
    let callCount = 0;
    vi.spyOn(JSON, "stringify").mockImplementation((value, replacer) => {
      callCount++;
      // Throw on first call (array), but allow subsequent calls
      if (callCount === 1 && Array.isArray(value)) {
        throw new Error("Mock stringify error");
      }
      return originalStringify(value, replacer as never);
    });

    const s = serialiseFiltersToSearch({
      myArray: ["a", "b", "c"],
    } as Record<string, unknown>);
    // Should fall back to join
    expect(s).toContain("myArray=a%2Cb%2Cc");
  });

  test("serialise handles object JSON.stringify failure by skipping", () => {
    // Mock JSON.stringify to throw on objects
    const originalStringify = JSON.stringify;
    let callCount = 0;
    vi.spyOn(JSON, "stringify").mockImplementation((value, replacer) => {
      callCount++;
      // Throw on first call (object), but allow subsequent calls
      if (
        callCount === 1 &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        throw new Error("Mock stringify error");
      }
      return originalStringify(value, replacer as never);
    });

    const s = serialiseFiltersToSearch({
      myObject: { key: "value" },
      fallbackString: "should be present",
    } as Record<string, unknown>);
    // Object should be skipped, but fallbackString should be there
    expect(s).toContain("fallbackString=should+be+present");
    expect(s).not.toContain("myObject=");
  });

  test("serialise preserves [Circular] markers in output", () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing circular reference edge case
    const o: Record<string, any> = { a: 1 };
    o.self = o;
    const s = serialiseFiltersToSearch({ obj: o } as Record<string, unknown>);
    expect(typeof s).toBe("string");
    // Should contain the [Circular] marker (URL-encoded as %5BCircular%5D)
    expect(s).toContain("%5BCircular%5D");
  });

  test("serialise handles null and undefined values", () => {
    const s = serialiseFiltersToSearch({
      nullValue: null,
      undefinedValue: undefined,
      validValue: "present",
    } as Record<string, unknown>);
    expect(s).toContain("validValue=present");
    expect(s).not.toContain("nullValue");
    expect(s).not.toContain("undefinedValue");
  });

  test("hydrate handles [Circular] marker strings", () => {
    const search = "obj=%7B%22self%22%3A%22%5BCircular%5D%22%7D";
    const parsed = hydrateFiltersFromSearch(search);
    expect(parsed.obj).toBeDefined();
    // Should be parsed as an object with the [Circular] string
    expect(typeof parsed.obj).toBe("object");
  });
});
