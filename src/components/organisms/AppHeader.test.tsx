import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import AppHeader from "./AppHeader";

describe("AppHeader", () => {
  test("renders data-testid='app-header' with the app title text", () => {
    render(<AppHeader />);

    const header = screen.getByTestId("app-header");
    expect(header).toBeInTheDocument();

    // Should contain the app title
    expect(screen.getByText(/data viewer/i)).toBeInTheDocument();
  });
});
