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
});
