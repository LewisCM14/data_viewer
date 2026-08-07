import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("../../hooks/useGetGraphData", () => ({
  default: () => ({ data: [{ id: 1 }], loading: false }),
}));

import DataViewerPage from "./DataViewerPage";

describe("DataViewerPage", () => {
  test("mounts and contains a plot", () => {
    const { getByTestId } = render(<DataViewerPage />);
    expect(getByTestId("plot")).toBeTruthy();
  });
});
