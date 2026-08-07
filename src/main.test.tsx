import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const useGetGraphDataMock = vi.fn();
vi.mock("./hooks/useGetGraphData", () => ({ default: useGetGraphDataMock }));

describe("main.tsx", () => {
  test("mounts the app into #root without throwing", async () => {
    // Ensure import without #root covers the negative branch
    vi.resetModules();
    document.body.innerHTML = "";
    useGetGraphDataMock.mockImplementation(() => ({
      data: [{ id: 1 }],
      loading: false,
    }));
    await import("./main");

    // Now import again with #root present to execute the positive branch
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    useGetGraphDataMock.mockImplementation(() => ({
      data: [{ id: 1 }],
      loading: false,
    }));
    await import("./main");
    await waitFor(() => expect(screen.getByTestId("plot")).toBeTruthy());
  });
});
