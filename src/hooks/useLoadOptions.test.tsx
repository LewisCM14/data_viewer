import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import MockTelemetryRepository from "../api/mock/MockTelemetryRepository";
import useLoadOptions from "./useLoadOptions";

describe("useLoadOptions", () => {
  beforeEach(() => {
    // Reset mock before each test
    // biome-ignore lint/suspicious/noExplicitAny: test helper
    delete (MockTelemetryRepository as any).getFilterOptions;
  });

  test("loads options from the repository and exposes them", async () => {
    const fake = {
      equipments: [{ id: "eq1", name: "Eq 1" }],
      digitalChannels: [{ id: "d1", name: "D1", color: "#000" }],
      analogueChannels: [{ id: "a1", name: "A1", color: "#fff" }],
    };

    // override the mock repository method
    // biome-ignore lint/suspicious/noExplicitAny: test helper
    (MockTelemetryRepository as any).getFilterOptions = vi.fn(async () => fake);

    const { result } = renderHook(() => useLoadOptions());

    // wait for the effect to fetch
    await waitFor(() => expect(result.current.options).not.toBeNull());

    expect(result.current.options?.equipments[0].id).toBe("eq1");
  });

  test("loads default options when repo does not have getFilterOptions", async () => {
    // Do not set getFilterOptions, so it falls back to defaults

    const { result } = renderHook(() => useLoadOptions());

    // wait for the effect to fetch
    await waitFor(() => expect(result.current.options).not.toBeNull());

    // Should have default options
    expect(result.current.options?.equipments).toHaveLength(3);
    expect(result.current.options?.digitalChannels).toHaveLength(5);
    expect(result.current.options?.analogueChannels).toHaveLength(4);
    expect(result.current.options?.equipments[0].id).toBe("eq1");
  });

  test("sets error state when getFilterOptions throws", async () => {
    const testError = new Error("Fetch failed");

    // biome-ignore lint/suspicious/noExplicitAny: test helper
    (MockTelemetryRepository as any).getFilterOptions = vi.fn(async () => {
      throw testError;
    });

    const { result } = renderHook(() => useLoadOptions());

    // wait for the error to be set
    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error?.message).toBe("Fetch failed");
    expect(result.current.options).toBeNull();
  });

  test("transitions loading state correctly", async () => {
    const fake = {
      equipments: [],
      digitalChannels: [],
      analogueChannels: [],
    };

    // biome-ignore lint/suspicious/noExplicitAny: test helper
    (MockTelemetryRepository as any).getFilterOptions = vi.fn(async () => fake);

    const { result } = renderHook(() => useLoadOptions());

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    // wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.options).not.toBeNull();
  });
});
