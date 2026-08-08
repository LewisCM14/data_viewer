import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import GraphCanvas from "./GraphCanvas";

vi.mock("../../hooks/useGetGraphData", () => ({
  default: vi.fn(() => ({ data: [], loading: false, error: null })),
}));

vi.mock("../atoms/Plot", () => ({
  default: vi.fn(() => <div data-testid="plot-canvas" />),
}));

describe("GraphCanvas", () => {
  test("renders data-testid='graph-canvas' containing PlotContainer", () => {
    render(<GraphCanvas />);

    const graphCanvas = screen.getByTestId("graph-canvas");
    expect(graphCanvas).toBeInTheDocument();

    // PlotContainer will show placeholder or plot
    // In this test setup, it will show placeholder since data is []
    const placeholder = screen.getByText("Select channels to view data");
    expect(placeholder).toBeInTheDocument();
  });
});
