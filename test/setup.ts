import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Global mock for react-plotly.js to avoid module resolution issues
vi.mock("react-plotly.js", () => ({
  default: vi.fn(({ data, layout, config, style }) =>
    React.createElement("div", {
      "data-testid": "plot-canvas",
      "data-plot-data": JSON.stringify(data),
      "data-plot-layout": JSON.stringify(layout),
      "data-plot-config": JSON.stringify(config),
      style: style,
    }),
  ),
}));
