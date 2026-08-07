import { describe, expect, test } from "vitest";
import {
  hydrateFiltersFromSearch,
  serialiseFiltersToSearch,
} from "./urlSyncMiddleware";

describe("urlSyncMiddleware serialise/hydrate", () => {
  test("serialises simple state to search string and hydrates back", () => {
    const state = {
      equipmentId: "eq1",
      digitalChannels: ["d1", "d2"],
      sampleRate: 5,
    };
    const s = serialiseFiltersToSearch(state as Record<string, unknown>);
    const parsed = hydrateFiltersFromSearch(s);
    expect(parsed.equipmentId).toBe("eq1");
    expect(Array.isArray(parsed.digitalChannels)).toBe(true);
    expect(parsed.digitalChannels).toEqual(["d1", "d2"]);
    expect(Number(parsed.sampleRate)).toBe(5);
  });

  test("hydrates comma separated lists and single value channel arrays", () => {
    const search = "digitalChannels=d1,d2&analogueChannels=a1";
    const parsed = hydrateFiltersFromSearch(search);
    expect(parsed.digitalChannels).toEqual(["d1", "d2"]);
    expect(parsed.analogueChannels).toEqual(["a1"]);
  });
});
