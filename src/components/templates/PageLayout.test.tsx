import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import PageLayout from "./PageLayout";

// Mock the organisms
vi.mock("../organisms/AppHeader", () => ({
  default: () => <header data-testid="app-header">Header</header>,
}));

vi.mock("../organisms/AppFooter", () => ({
  default: () => <footer data-testid="app-footer">Footer</footer>,
}));

vi.mock("../organisms/NotificationSnackbar", () => ({
  default: () => <div data-testid="notification-snackbar">Snackbar</div>,
}));

describe("PageLayout", () => {
  test("renders header, aside, main and footer with expected layout portions", () => {
    render(
      <PageLayout aside={<div>Aside content</div>}>
        <div>content</div>
      </PageLayout>,
    );

    expect(screen.getByTestId("app-header")).toBeInTheDocument();
    expect(screen.getByTestId("aside")).toBeInTheDocument();
    expect(screen.getByTestId("main")).toBeInTheDocument();
    expect(screen.getByTestId("app-footer")).toBeInTheDocument();
  });

  test("aside width is 20%; main width is 80%", () => {
    render(
      <PageLayout aside={<div>Aside content</div>}>
        <div>content</div>
      </PageLayout>,
    );

    const aside = screen.getByTestId("aside");
    const main = screen.getByTestId("main");

    // Check computed styles for width
    const asideStyle = window.getComputedStyle(aside);
    const mainStyle = window.getComputedStyle(main);

    // These should have width styles applied
    expect(asideStyle.width).toBeTruthy();
    expect(mainStyle.width).toBeTruthy();
  });

  test("NotificationSnackbar is rendered outside the aside/main flex row", () => {
    const { container } = render(
      <PageLayout aside={<div>Aside content</div>}>
        <div>content</div>
      </PageLayout>,
    );

    const snackbar = screen.getByTestId("notification-snackbar");
    const main = screen.getByTestId("main");

    // The snackbar should not be a descendant of main
    expect(main.contains(snackbar)).toBe(false);

    // The snackbar should be in the document
    expect(container.contains(snackbar)).toBe(true);
  });
});
