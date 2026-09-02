import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFilterStore } from "../store/useFilterStore";
import { serializeFiltersToQuery } from "../types";
import useIFrameBridge from "./useIFrameBridge";
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

  it("ignores messages with falsy data", () => {
    const { unmount } = renderHook(() => useIFrameBridge());
    expect(() =>
      window.dispatchEvent(new MessageEvent("message", { data: null })),
    ).not.toThrow();
    unmount();
  });

  it("ignores SET_FILTERS message when payload is null (snapshot is null)", () => {
    const { unmount } = renderHook(() => useIFrameBridge());
    const before = useFilterStore.getState().equipmentId;
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "SET_FILTERS", payload: null },
      }),
    );
    expect(useFilterStore.getState().equipmentId).toBe(before);
    unmount();
  });

  it("ignores SET_FILTERS message when payload is a number (neither string nor object)", () => {
    const { unmount } = renderHook(() => useIFrameBridge());
    const before = useFilterStore.getState().equipmentId;
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "SET_FILTERS", payload: 42 },
      }),
    );
    expect(useFilterStore.getState().equipmentId).toBe(before);
    unmount();
  });

  it("ignores messages with unknown type (non-SET_FILTERS object)", () => {
    const { unmount } = renderHook(() => useIFrameBridge());
    const before = useFilterStore.getState().equipmentId;
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "UNKNOWN_TYPE", payload: { equipmentId: 99 } },
      }),
    );
    expect(useFilterStore.getState().equipmentId).toBe(before);
    unmount();
  });

  it("uses '*' as origin when ev.origin is empty (covers || '*' branch)", () => {
    const target = { postMessage: vi.fn() } as unknown as Window;
    const { unmount } = renderHook(() => useIFrameBridge());
    const evt = new MessageEvent("message", {
      data: { type: "SET_FILTERS", payload: { equipmentId: 77 } },
      origin: "",
      source: target,
    });
    window.dispatchEvent(evt as unknown as Event);
    expect(target.postMessage).toHaveBeenCalledWith(
      { type: "FILTERS_APPLIED" },
      "*",
    );
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

  it("logs errors when message processing throws", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { unmount } = renderHook(() => useIFrameBridge());

    // A Proxy that throws on property access will cause replaceFilters to throw
    const throwingPayload = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === "equipmentId") throw new Error("deliberate error");
          return undefined;
        },
      },
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "SET_FILTERS", payload: throwingPayload },
        }),
      );
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error processing message event:",
      expect.any(Error),
    );

    unmount();
    consoleErrorSpy.mockRestore();
  });
});
