import { render } from "@testing-library/react";
import type { Mock } from "vitest";
import { describe, expect, test, vi } from "vitest";

vi.mock("../../hooks/useGetGraphData", () => ({ default: vi.fn() }));

import useGetGraphData from "../../hooks/useGetGraphData";
import PlotContainer from "./PlotContainer";

const mockedHook = useGetGraphData as unknown as Mock;

describe("PlotContainer", () => {
  test("renders plot when data is present", () => {
    mockedHook.mockReturnValueOnce({ data: [{ id: 1 }], loading: false });
    const { getByTestId } = render(<PlotContainer />);
    expect(getByTestId("plot")).toBeTruthy();
  });

  test("renders loading when hook reports loading", () => {
    mockedHook.mockReturnValueOnce({ data: null, loading: true });
    const { getByTestId } = render(<PlotContainer />);
    expect(getByTestId("plot-loading")).toBeTruthy();
  });

  test("renders placeholder when no data", () => {
    mockedHook.mockReturnValueOnce({ data: [], loading: false });
    const { getByTestId } = render(<PlotContainer />);
    expect(getByTestId("plot-placeholder")).toBeTruthy();
  });
});
