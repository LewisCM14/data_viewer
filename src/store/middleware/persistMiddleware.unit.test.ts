import { describe, expect, test } from "vitest";
import { loadFavourites, saveFavourites } from "./persistMiddleware";

describe("persistMiddleware (no-op favourites)", () => {
  test("saveFavourites is a no-op and loadFavourites returns []", () => {
    expect(() => saveFavourites([{ a: 1 }])).not.toThrow();
    expect(loadFavourites()).toEqual([]);
  });
});
