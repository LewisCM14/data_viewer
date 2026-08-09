import { Box, Typography } from "@mui/material";
import type React from "react";

/**
 * AppFooter
 *
 * Organism that renders the application footer with static content.
 */
export const AppFooter: React.FC = () => {
  return (
    <Box
      component="footer"
      data-testid="app-footer"
      sx={{
        p: 2,
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2026 Data Viewer Application
      </Typography>
    </Box>
  );
};

export default AppFooter;
