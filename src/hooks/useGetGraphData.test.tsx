import { render, screen, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";
import { describe, expect, test, vi } from "vitest";
import useGetGraphData from "./useGetGraphData";

vi.mock("../api/mock/MockTelemetryRepository", () => ({
  default: { getTimeseries: vi.fn(() => Promise.resolve([{ id: "x" }])) },
}));

function TestComponent() {
  const { data, loading } = useGetGraphData();
  if (loading) return <div data-testid="loading">loading</div>;
  return <div data-testid="data">{JSON.stringify(data)}</div>;
}

describe("useGetGraphData", () => {
  test("fetches data and updates state", async () => {
    render(<TestComponent />);
    expect(screen.getByTestId("loading")).toBeTruthy();
    await waitFor(() => expect(screen.getByTestId("data")).toBeTruthy());
    expect(screen.getByTestId("data").textContent).toBe('[{"id":"x"}]');
  });

  test("does not update state after unmount", async () => {
    let resolvePromise!: (value?: unknown) => void;
    const promise = new Promise((res) => {
      resolvePromise = res;
    });

    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    (MockRepo.default.getTimeseries as unknown as Mock).mockImplementationOnce(
      () => promise,
    );

    function TestComponent2() {
      const { data, loading } = useGetGraphData();
      if (loading) return <div data-testid="loading2">loading</div>;
      return <div data-testid="data2">{JSON.stringify(data)}</div>;
    }

    const { unmount } = render(<TestComponent2 />);
    // unmount before the promise resolves
    unmount();
    // resolve the promise - hook should check mounted flag and not attempt state updates
    (resolvePromise as (v?: unknown) => void)([{ id: "y" }]);
    // allow any pending microtasks to run
    await Promise.resolve();
  });
});
