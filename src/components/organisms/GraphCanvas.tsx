import { Box } from "@mui/material";
import type React from "react";
import PlotContainer from "../molecules/PlotContainer";

/**
 * GraphCanvas
 *
 * Organism that renders the main graph visualization area.
 * Contains PlotContainer within a flex layout container
 * that occupies 80% width of its parent.
 *
 * This is the primary visualization component in the data viewer,
 * responsible for displaying time-series plots based on selected
 * equipment and channels.
 */
export const GraphCanvas: React.FC = () => {
  return (
    <Box
      data-testid="graph-canvas"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PlotContainer />
    </Box>
  );
};

export default GraphCanvas;
