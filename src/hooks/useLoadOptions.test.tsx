import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import useLoadOptions from "./useLoadOptions";
import MockTelemetryRepository from "../api/mock/MockTelemetryRepository";

describe("useLoadOptions", () => {
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
});
