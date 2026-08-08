import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import ColorSwatch from "./ColorSwatch";

describe("ColorSwatch", () => {
  test("container has backgroundColor matching the passed color hex string", () => {
    render(<ColorSwatch color="#ff0000" />);

    const swatch = screen.getByTestId("color-swatch");
    expect(swatch).toHaveStyle({ backgroundColor: "#ff0000" });
  });

  test("renders with different colors", () => {
    const { rerender } = render(<ColorSwatch color="#00ff00" />);

    let swatch = screen.getByTestId("color-swatch");
    expect(swatch).toHaveStyle({ backgroundColor: "#00ff00" });

    rerender(<ColorSwatch color="#0000ff" />);
    swatch = screen.getByTestId("color-swatch");
    expect(swatch).toHaveStyle({ backgroundColor: "#0000ff" });
  });
});
