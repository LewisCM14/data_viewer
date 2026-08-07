import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { appTheme } from "./tokens";

/**
 * AppThemeProvider
 *
 * Wraps application children with the MUI `ThemeProvider` and `CssBaseline`.
 * This provider supplies the `appTheme` to all MUI components used in the app.
 */
export const AppThemeProvider = ({ children }: PropsWithChildren<unknown>) => (
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

export default AppThemeProvider;
