import { render, screen } from "@testing-library/react";
import type { Mock } from "vitest";
import { describe, expect, test, vi } from "vitest";

vi.mock("../../hooks/useGetGraphData", () => ({ default: vi.fn() }));
vi.mock("../atoms/Plot", () => ({
  default: vi.fn(({ data }) => (
    <div data-testid="plot-canvas" data-trace-count={data?.length || 0} />
  )),
}));

import useGetGraphData from "../../hooks/useGetGraphData";
import PlotContainer from "./PlotContainer";

const mockedHook = useGetGraphData as unknown as Mock;

describe("PlotContainer", () => {
  test("renders CircularProgress when loading state is true", () => {
    mockedHook.mockReturnValueOnce({
      data: null,
      loading: true,
      error: null,
    });

    render(<PlotContainer />);

    // MUI CircularProgress has role="progressbar"
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders placeholder text when digitalChannels and analogueChannels are both empty", () => {
    mockedHook.mockReturnValueOnce({
      data: [],
      loading: false,
      error: null,
    });

    render(<PlotContainer />);

    expect(
      screen.getByText("Select channels to view data"),
    ).toBeInTheDocument();
  });

  test("renders data-testid='plot-canvas' when data is present", () => {
    const mockData = [
      {
        id: "rec1",
        name: "Recording 1",
        series: [{ channel: "1", values: [10], timestamps: [1000] }],
      },
    ];

    mockedHook.mockReturnValueOnce({
      data: mockData,
      loading: false,
      error: null,
    });

    render(<PlotContainer />);

    expect(screen.getByTestId("plot-canvas")).toBeInTheDocument();
  });

  test("trace count in data prop matches the number of unique channels in mock recordings", () => {
    const mockData = [
      {
        id: "rec1",
        name: "Recording 1",
        series: [
          { channel: "1", values: [10], timestamps: [1000] },
          { channel: "2", values: [20], timestamps: [1000] },
        ],
      },
      {
        id: "rec2",
        name: "Recording 2",
        series: [{ channel: "1", values: [30], timestamps: [2000] }],
      },
    ];

    mockedHook.mockReturnValueOnce({
      data: mockData,
      loading: false,
      error: null,
    });

    render(<PlotContainer />);

    const plotElement = screen.getByTestId("plot-canvas");
    const traceCount = Number(plotElement.getAttribute("data-trace-count"));

    // Should have 2 traces (one per unique channel: "1" and "2")
    expect(traceCount).toBe(2);
  });
});
