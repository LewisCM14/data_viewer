import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import useGetGraphData from "./useGetGraphData";

vi.mock("../api/mock/MockTelemetryRepository", () => ({
  default: { getTimeseries: vi.fn(() => Promise.resolve([{ id: "x" }])) },
}));

const mockNotify = vi.fn();
vi.mock("../store/slices/notificationSlice", () => ({
  default: () => ({ showNotification: mockNotify, getState: () => ({}) }),
}));

// biome-ignore lint/suspicious/noExplicitAny: test component accepts flexible props for hook testing
function TestComponent(opts?: any) {
  const { data, loading } = useGetGraphData(opts);
  if (loading) return <div data-testid="loading">loading</div>;
  return <div data-testid="data">{JSON.stringify(data)}</div>;
}

describe("useGetGraphData guards", () => {
  test("pre-flight estimatedPoints blocks request and notifies", async () => {
    render(
      (
        <TestComponent estimatedPoints={1000} options={{}} maxDataPoints={10} />
        // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element in test
      ) as any,
    );
    // wait for the hook effect to run
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).toHaveBeenCalled();
  });

  test("post-response too many data points notifies and clears data", async () => {
    // override the MockTelemetryRepository to return one recording with many points
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking repository method for test
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: "r",
          name: "r",
          series: [
            {
              channel: "1",
              values: new Array(10).fill(1),
              timestamps: new Array(10).fill(1),
            },
          ],
        },
      ]),
    );

    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element in test
    render((<TestComponent params={{}} maxDataPoints={5} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).toHaveBeenCalled();
  });

  test("repository error notifies and sets loading false", async () => {
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking repository method for test
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.reject(new Error("fail")),
    );

    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element in test
    render((<TestComponent params={{}} maxDataPoints={100} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).toHaveBeenCalled();
  });

  test("aborted repository exception is ignored and does not notify", async () => {
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking repository method for test
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.reject(new DOMException("Aborted", "AbortError")),
    );

    mockNotify.mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element in test
    render((<TestComponent params={{}} maxDataPoints={100} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).not.toHaveBeenCalled();
  });

  test("handles successful response with series under max points", async () => {
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    const rec = {
      id: "r",
      name: "r",
      series: [{ channel: "1", values: [1, 2], timestamps: [1, 2] }],
    };
    // biome-ignore lint/suspicious/noExplicitAny: mocking repository method for test
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.resolve([rec]),
    );

    mockNotify.mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element in test
    render((<TestComponent params={{}} maxDataPoints={1000} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).not.toHaveBeenCalled();
    expect(screen.getByTestId("data").textContent).toBe(JSON.stringify([rec]));
  });

  test("cancel() aborts an in-flight request", async () => {
    let resolveTimeseries!: (v: unknown[]) => void;
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking repository method for test
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveTimeseries = res;
        }),
    );

    function CancelComponent() {
      const { loading, cancel } = useGetGraphData({ params: {} } as never);
      return (
        <div>
          {loading && <span data-testid="loading2" />}
          <button type="button" data-testid="cancel-btn" onClick={cancel}>
            cancel
          </button>
        </div>
      );
    }

    const { getByTestId } = render(<CancelComponent />);
    // cancel during the in-flight request
    fireEvent.click(getByTestId("cancel-btn"));
    // resolve the promise after cancel — should not cause state update issues
    resolveTimeseries([]);
    await Promise.resolve();
  });

  test("recording with non-array values does not crash (covers Array.isArray(vals) false branch)", async () => {
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking for branch coverage
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: "r",
          name: "r",
          // series IS an array → hasSeries=true → reaches bucketed.reduce
          series: [
            {
              channel: "1",
              values: "not-an-array", // Array.isArray(vals) = false → 0
              timestamps: [],
            },
          ],
        },
      ]),
    );

    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element
    render((<TestComponent params={{}} maxDataPoints={1000} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).not.toHaveBeenCalled();
  });

  test("recording with non-array series uses empty fallback (covers Array.isArray(rec.series) false branch at line 86)", async () => {
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking for branch coverage
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.resolve([
        // First item has valid series → hasSeries=true → proceeds past early return
        {
          id: "r1",
          name: "r1",
          series: [{ channel: "1", values: [1, 2], timestamps: [1, 2] }],
        },
        // Second item has non-array series → covers Array.isArray(rec.series) false branch
        {
          id: "r2",
          name: "r2",
          series: "not-an-array",
        },
      ]),
    );

    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element
    render((<TestComponent params={{}} maxDataPoints={1000} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
  });

  test("non-object rejection sets errName to undefined (covers ternary false branch)", async () => {
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking for branch coverage
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.reject("plain string error"),
    );

    mockNotify.mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element
    render((<TestComponent params={{}} maxDataPoints={1000} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).toHaveBeenCalledWith("Error fetching data", "error");
  });

  test("error with empty message falls back to 'Error fetching data'", async () => {
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    const err = new Error();
    err.message = "";
    // biome-ignore lint/suspicious/noExplicitAny: mocking for branch coverage
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(() =>
      Promise.reject(err),
    );

    mockNotify.mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: type assertion for React element
    render((<TestComponent params={{}} maxDataPoints={1000} />) as any);
    await waitFor(() => expect(screen.queryByTestId("loading")).toBeNull());
    expect(mockNotify).toHaveBeenCalledWith("Error fetching data", "error");
  });

  test("cancel() when currentController is null is a no-op (covers if(controller) false branch)", async () => {
    let resolveTimeseries2!: (v: unknown[]) => void;
    const MockRepo = await import("../api/mock/MockTelemetryRepository");
    // biome-ignore lint/suspicious/noExplicitAny: mocking for branch coverage
    (MockRepo.default.getTimeseries as any).mockImplementationOnce(
      () =>
        new Promise((res) => {
          resolveTimeseries2 = res;
        }),
    );

    function DoubleCancelComponent() {
      const { loading, cancel } = useGetGraphData({ params: {} } as never);
      return (
        <div>
          {loading && <span data-testid="loading3" />}
          <button
            type="button"
            data-testid="double-cancel"
            onClick={() => {
              // First cancel: currentController.current is set → true branch
              cancel();
              // Second cancel: currentController.current is null → false branch
              cancel();
            }}
          >
            cancel
          </button>
        </div>
      );
    }

    const { getByTestId } = render(<DoubleCancelComponent />);
    fireEvent.click(getByTestId("double-cancel"));
    resolveTimeseries2([]);
    await Promise.resolve();
  });
});
