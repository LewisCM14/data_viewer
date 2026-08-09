import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

// Mock repository provider to return an object without getFilterOptions
vi.mock("../api/repository", () => ({ default: () => ({}) }));

import useLoadOptions from "./useLoadOptions";

describe("useLoadOptions fallback", () => {
  test("uses built-in fallback options when repo lacks getFilterOptions", async () => {
    const { result } = renderHook(() => useLoadOptions());
    await waitFor(() => expect(result.current.options).not.toBeNull());
    expect(result.current.options?.equipments.length).toBeGreaterThan(0);
  });
});
