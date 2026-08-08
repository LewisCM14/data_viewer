import { Box } from "@mui/material";
import type React from "react";

export interface ColorSwatchProps {
  color: string;
}

/**
 * ColorSwatch
 *
 * Simple Box component displaying a solid colour block used in channel
 * selection lists to show the assigned channel colour that will appear
 * in the plot legend.
 */
export const ColorSwatch: React.FC<ColorSwatchProps> = ({ color }) => {
  return (
    <Box
      data-testid="color-swatch"
      sx={{
        width: 24,
        height: 24,
        backgroundColor: color,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    />
  );
};

export default ColorSwatch;
