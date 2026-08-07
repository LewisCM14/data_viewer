import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Plot from "./Plot";

describe("Plot atom", () => {
  test("renders plot stub", () => {
    const { getByTestId } = render(<Plot />);
    expect(getByTestId("plot")).toBeTruthy();
  });
});
