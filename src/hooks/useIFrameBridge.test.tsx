import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useIFrameBridge from "./useIFrameBridge";
import { serializeFiltersToQuery } from "../types";
import { useFilterStore } from "../store/useFilterStore";

describe("useIFrameBridge", () => {
  beforeEach(() => {
    useFilterStore.setState({
      equipmentId: null,
      digitalChannels: [],
      analogueChannels: [],
      dateRange: null,
      sampleRate: undefined,
      channelColours: {},
    });
  });

  it("ignores non-object messages", () => {
    const { unmount } = renderHook(() => useIFrameBridge());
    expect(() =>
      window.dispatchEvent(new MessageEvent("message", { data: "hello" })),
    ).not.toThrow();
    unmount();
  });

  it("applies filters from string payload and acknowledges", () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    const { unmount } = renderHook(() => useIFrameBridge());
    const evt = new MessageEvent("message", {
      data: { type: "SET_FILTERS", payload: "?equipmentId=88&digital=d8" },
      origin: "http://test",
      source: target,
    });
    window.dispatchEvent(evt as unknown as Event);
    const s = useFilterStore.getState();
    expect(s.equipmentId).toBe(88);
    expect(s.digitalChannels).toEqual(["d8"]);
    expect(target.postMessage).toHaveBeenCalledWith(
      { type: "FILTERS_APPLIED" },
      "http://test",
    );
    unmount();
  });

  it("applies filters from object payload", () => {
    const { unmount } = renderHook(() => useIFrameBridge());
    const payload = { equipmentId: 21, digitalChannels: ["d21"] };
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "SET_FILTERS", payload },
      } as unknown as MessageEventInit),
    );
    const s = useFilterStore.getState();
    expect(s.equipmentId).toBe(21);
    expect(s.digitalChannels).toEqual(["d21"]);
    unmount();
  });

  it("applies filters from SET_FILTERS message into the store (serialize path)", () => {
    const { unmount } = renderHook(() => useIFrameBridge());

    const q = serializeFiltersToQuery({ equipmentId: 42, sampleRate: 10 });
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "SET_FILTERS", payload: q },
        }),
      );
    });

    const state = useFilterStore.getState();
    expect(state.equipmentId).toBe(42);
    expect(state.sampleRate).toBe(10);
    unmount();
  });
});
