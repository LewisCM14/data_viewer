import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("../../hooks/useGetGraphData", () => ({
  default: () => ({
    data: [
      {
        id: "rec1",
        name: "Recording 1",
        series: [{ channel: "1", values: [10], timestamps: [1000] }],
      },
    ],
    loading: false,
    error: null,
  }),
}));

import DataViewerPage from "./DataViewerPage";

describe("DataViewerPage", () => {
  test("mounts and contains a plot", () => {
    render(<DataViewerPage />);
    expect(screen.getByTestId("plot-canvas")).toBeInTheDocument();
  });
});
