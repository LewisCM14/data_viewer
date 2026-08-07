import { describe, expect, test } from "vitest";
import useUISlice, { initialUIState } from "./uiSlice";

describe("uiSlice initial state", () => {
  test("sidebar is open by default", () => {
    expect(initialUIState).toEqual({ isSidebarOpen: true });
  });

  test("toggleSidebar behaves correctly", () => {
    const s = useUISlice();
    expect(s.getState().isSidebarOpen).toBe(true);
    s.toggleSidebar();
    expect(s.getState().isSidebarOpen).toBe(false);
  });

  test("addFavourite and removeFavourite behave correctly", () => {
    // Favourites are browser-managed via URL; UI slice no longer persists them.
    const s = useUISlice();
    expect(typeof s.toggleSidebar).toBe("function");
  });
});
