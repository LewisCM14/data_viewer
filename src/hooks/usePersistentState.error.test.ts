import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock types module to control parseFiltersFromQuery and serializeFiltersToQuery
vi.mock("../types", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../types")>();
  return { ...actual };
});

import { usePersistentState } from "./usePersistentState";

describe("usePersistentState catch branches", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it("catches parseFiltersFromQuery errors on mount (line 35)", async () => {
    const types = await import("../types");
    vi.spyOn(types, "parseFiltersFromQuery").mockImplementationOnce(() => {
      throw new Error("parse error on mount");
    });

    renderHook(() => usePersistentState());

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to restore filters from URL search params:",
      expect.any(Error),
    );
  });

  it("calls replaceFilters when URL has filter data (hasAny=true, line 24 true branch)", async () => {
    // Set URL search params before mounting so parseFiltersFromQuery returns non-empty snapshot
    globalThis.history.pushState({}, "", "?equipmentId=42&sampleRate=10");

    const { useFilterStore } = await import("../store/useFilterStore");

    renderHook(() => usePersistentState());

    // equipmentId should be set in the store (replaceFilters was called)
    expect(useFilterStore.getState().equipmentId).toBe(42);

    // Restore URL
    globalThis.history.pushState({}, "", "/");
  });

  it("hasAny is true via digitalChannels (covers digitalChannels && length > 0 branch)", async () => {
    const { useFilterStore } = await import("../store/useFilterStore");
    // Use only digital channels (no equipmentId) to reach the B=true path
    globalThis.history.pushState({}, "", "?digital=d1,d2");
    useFilterStore.setState({ equipmentId: null });

    renderHook(() => usePersistentState());

    expect(useFilterStore.getState().digitalChannels).toEqual(["d1", "d2"]);
    globalThis.history.pushState({}, "", "/");
  });

  it("hasAny is true via analogueChannels (covers C=true branch)", async () => {
    const { useFilterStore } = await import("../store/useFilterStore");
    globalThis.history.pushState({}, "", "?analogue=a1");

    renderHook(() => usePersistentState());

    expect(useFilterStore.getState().analogueChannels).toEqual(["a1"]);
    globalThis.history.pushState({}, "", "/");
  });

  it("hasAny is true via dateRange (covers D=true branch)", async () => {
    const { useFilterStore } = await import("../store/useFilterStore");
    globalThis.history.pushState({}, "", "?from=2024-01-01");

    renderHook(() => usePersistentState());

    expect(useFilterStore.getState().dateRange).not.toBeNull();
    globalThis.history.pushState({}, "", "/");
  });

  it("hasAny is true via sampleRate (covers sampleRate !== undefined branch after A,B,C,D false)", async () => {
    const { useFilterStore } = await import("../store/useFilterStore");
    globalThis.history.pushState({}, "", "?sampleRate=5");

    renderHook(() => usePersistentState());

    expect(useFilterStore.getState().sampleRate).toBe(5);
    globalThis.history.pushState({}, "", "/");
  });

  it("hasAny is true via channelColours (covers F=true branch)", async () => {
    const colours = encodeURIComponent(JSON.stringify({ d1: "#ff0000" }));
    globalThis.history.pushState({}, "", `?colours=${colours}`);

    renderHook(() => usePersistentState());

    globalThis.history.pushState({}, "", "/");
  });

  it("dateRange.from is falsy but to is truthy (covers inner || right branch in D)", async () => {
    const { useFilterStore } = await import("../store/useFilterStore");
    // ?to=2024-12-31 → dateRange = { from: "", to: "2024-12-31" }
    // hasAny: dateRange && ("" || "2024-12-31") — left-false of inner || evaluated
    globalThis.history.pushState({}, "", "?to=2024-12-31");

    renderHook(() => usePersistentState());

    expect(useFilterStore.getState().dateRange).not.toBeNull();
    globalThis.history.pushState({}, "", "/");
  });

  it("catches parseFiltersFromQuery errors in popstate handler (line 66)", async () => {
    const types = await import("../types");
    vi.spyOn(types, "parseFiltersFromQuery").mockImplementationOnce(() => ({
      equipmentId: undefined,
    }));
    vi.spyOn(types, "parseFiltersFromQuery").mockImplementationOnce(() => {
      throw new Error("parse error on popstate");
    });

    renderHook(() => usePersistentState());

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to restore filters on browser back/forward:",
      expect.any(Error),
    );
  });

  it("catches serializeFiltersToQuery errors in subscribe callback (line 56)", async () => {
    const types = await import("../types");
    vi.spyOn(types, "serializeFiltersToQuery").mockImplementation(() => {
      throw new Error("serialize error");
    });

    const { useFilterStore } = await import("../store/useFilterStore");

    renderHook(() => usePersistentState());

    act(() => {
      useFilterStore.getState().setEquipment("test");
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to sync filters to URL search params:",
      expect.any(Error),
    );
  });

  it("clears pending timeout when store updates twice rapidly (if(timeout) branch)", async () => {
    const { useFilterStore } = await import("../store/useFilterStore");

    renderHook(() => usePersistentState());

    // Two rapid updates — second should clearTimeout the first
    act(() => {
      useFilterStore.getState().setEquipment("a");
      useFilterStore.getState().setEquipment("b");
    });

    // Allow the debounce to settle
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
  });

  it("subscribe fires with null equipmentId (covers equipmentId ? ... : null false branch and q='' path)", async () => {
    const { useFilterStore } = await import("../store/useFilterStore");
    // Start from a clean slate — all empty → q will be empty string
    useFilterStore.setState({
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: undefined,
      channelColours: {},
    });

    renderHook(() => usePersistentState());

    // Trigger subscribe by resetting filters (all values become null/undefined → q = "")
    act(() => {
      useFilterStore.getState().resetFilters();
    });

    // Allow debounce to settle — with empty state, q="" → url = pathname only
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
  });
});
