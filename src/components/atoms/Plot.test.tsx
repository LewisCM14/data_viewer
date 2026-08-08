import { render, screen } from "@testing-library/react";
import type { Data } from "plotly.js";
import { describe, expect, test, vi } from "vitest";
import Plot from "./Plot";

// Mock react-plotly.js
vi.mock("react-plotly.js", () => ({
  default: vi.fn(({ data, layout, config, style }) => (
    <div
      data-testid="plot-canvas"
      data-plot-data={JSON.stringify(data)}
      data-plot-layout={JSON.stringify(layout)}
      data-plot-config={JSON.stringify(config)}
      style={style}
    />
  )),
}));

describe("Plot", () => {
  test("renders data-testid='plot-canvas'", () => {
    render(
      <Plot
        data={[]}
        layout={{}}
        config={{}}
        style={{ width: "100%", height: "100%" }}
      />,
    );

    expect(screen.getByTestId("plot-canvas")).toBeInTheDocument();
  });

  test("passes data and layout props to the underlying react-plotly.js component", () => {
    const mockData: Partial<Data>[] = [
      {
        type: "scatter",
        mode: "lines",
        name: "Channel 1",
        x: [1, 2, 3],
        y: [10, 20, 30],
      },
    ];

    const mockLayout = {
      xaxis: { title: { text: "Timestamp" } },
      yaxis: { title: { text: "Value" } },
    };

    render(
      <Plot
        data={mockData}
        layout={mockLayout}
        config={{}}
        style={{ width: "100%", height: "100%" }}
      />,
    );

    const plotElement = screen.getByTestId("plot-canvas");

    // Verify data was passed through
    const passedData = JSON.parse(
      plotElement.getAttribute("data-plot-data") || "[]",
    );
    expect(passedData).toEqual(mockData);

    // Verify layout was passed through
    const passedLayout = JSON.parse(
      plotElement.getAttribute("data-plot-layout") || "{}",
    );
    expect(passedLayout).toEqual(mockLayout);
  });

  test("passes config and style props", () => {
    const mockConfig = { displayModeBar: false };
    const mockStyle = { width: "100%", height: "600px" };

    render(
      <Plot data={[]} layout={{}} config={mockConfig} style={mockStyle} />,
    );

    const plotElement = screen.getByTestId("plot-canvas");

    const passedConfig = JSON.parse(
      plotElement.getAttribute("data-plot-config") || "{}",
    );
    expect(passedConfig).toEqual(mockConfig);

    expect(plotElement).toHaveStyle(mockStyle);
  });
});
