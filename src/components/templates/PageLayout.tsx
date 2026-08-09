import { Box } from "@mui/material";
import type React from "react";
import AppFooter from "../organisms/AppFooter";
import AppHeader from "../organisms/AppHeader";
import NotificationSnackbar from "../organisms/NotificationSnackbar";

export interface PageLayoutProps {
  aside: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PageLayout template
 *
 * Provides the application shell with header, aside (20%), main (80%),
 * footer, and notification snackbar. Composes all major organisms into
 * the full-page layout structure.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ aside, children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <AppHeader />

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Box
          component="aside"
          data-testid="aside"
          sx={{
            width: "20%",
            padding: "1rem",
            borderRight: "1px solid",
            borderColor: "divider",
            overflowY: "auto",
          }}
        >
          {aside}
        </Box>

        <Box
          component="main"
          data-testid="main"
          sx={{
            width: "80%",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>

      <AppFooter />

      {/* NotificationSnackbar rendered outside the flex row */}
      <NotificationSnackbar />
    </Box>
  );
};

export default PageLayout;
