import { describe, expect, test } from "vitest";
import {
  hydrateFiltersFromSearch,
  serialiseFiltersToSearch,
} from "./urlSyncMiddleware";

describe("favourites via URL serialisation", () => {
  test("serialises and hydrates favourites array via URLSearchParams", () => {
    const state = { favs: ["/app?e=1", "/app?e=2"] };
    const s = serialiseFiltersToSearch(state as Record<string, unknown>);
    const parsed = hydrateFiltersFromSearch(s);
    expect(Array.isArray(parsed.favs)).toBe(true);
    expect(parsed.favs).toEqual(["/app?e=1", "/app?e=2"]);
  });
});
