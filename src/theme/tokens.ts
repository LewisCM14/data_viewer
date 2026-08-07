import { createTheme } from "@mui/material/styles";

/**
 * Application theme tokens
 *
 * Minimal MUI theme used across the app. Expand this as the design system
 * grows (typography, spacing, semantic tokens, etc.).
 */
export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#fafafa",
    },
  },
});
