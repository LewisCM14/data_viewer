import { AppBar, Toolbar, Typography } from "@mui/material";
import type React from "react";

export const AppHeader: React.FC = () => {
  return (
    <AppBar position="static" data-testid="app-header">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Data Viewer
        </Typography>
        {/* favourites menu removed; users can bookmark URLs directly in browser */}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
