import { renderHook, act } from "@testing-library/react";
import { usePersistentState } from "./usePersistentState";
import { useFilterStore, type FilterState } from "../store/useFilterStore";
import { beforeEach, describe, it, expect, vi } from "vitest";

describe("usePersistentState", () => {
  beforeEach(() => {
    // reset store to defaults
    useFilterStore.setState({
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: undefined,
      channelColours: {},
    } as Partial<FilterState>);
  });

  it("hydrates filters from the URL on mount", () => {
    window.history.replaceState({}, "", "/?equipmentId=55&digital=d1,d2");
    const { unmount } = renderHook(() => usePersistentState());

    const state = useFilterStore.getState();
    expect(state.equipmentId).toBe(55);
    expect(state.digitalChannels).toEqual(["d1", "d2"]);
    unmount();
  });

  it("updates the URL when store changes (debounced)", () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => usePersistentState());
    // change the store
    useFilterStore.setState({ equipmentId: 123 } as Partial<FilterState>);
    // advance timers past debounce
    act(() => vi.advanceTimersByTime(250));
    expect(window.location.search).toContain("equipmentId=123");
    unmount();
    vi.useRealTimers();
  });

  it("applies filters on popstate", () => {
    const { unmount } = renderHook(() => usePersistentState());
    window.history.replaceState({}, "", "/?equipmentId=999&digital=d9");
    window.dispatchEvent(new PopStateEvent("popstate"));
    const state = useFilterStore.getState();
    expect(state.equipmentId).toBe(999);
    expect(state.digitalChannels).toEqual(["d9"]);
    unmount();
  });
});
