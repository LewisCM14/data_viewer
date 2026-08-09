import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import AppFooter from "./AppFooter";

describe("AppFooter", () => {
  test("renders data-testid='app-footer'", () => {
    render(<AppFooter />);

    const footer = screen.getByTestId("app-footer");
    expect(footer).toBeInTheDocument();
  });

  test("renders static footer text", () => {
    render(<AppFooter />);

    // Should contain some footer content
    expect(screen.getByTestId("app-footer")).toHaveTextContent(/./);
  });
});
