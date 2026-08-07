import { render, screen } from "@testing-library/react";
import { useTheme } from "@mui/material/styles";
import { AppThemeProvider } from "./AppThemeProvider";
import { test, expect } from "vitest";

function ThemedChild() {
  const theme = useTheme();
  return <div data-testid="theme-primary">{theme.palette.primary.main}</div>;
}

test("AppThemeProvider renders children and exposes theme via useTheme", () => {
  render(
    <AppThemeProvider>
      <ThemedChild />
    </AppThemeProvider>,
  );

  const el = screen.getByTestId("theme-primary");
  expect(el.textContent).toBe("#1976d2");
});
