import { useTheme } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { AppThemeProvider } from "./AppThemeProvider";

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
