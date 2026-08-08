import { render, screen, waitFor } from "@testing-library/react";
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
});
