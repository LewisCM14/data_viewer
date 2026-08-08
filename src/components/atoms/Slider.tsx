import { Box, Slider as MuiSlider, Typography } from "@mui/material";
import type React from "react";

export interface SliderMark {
  value: number;
  label: string;
}

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  marks: SliderMark[];
  step?: number | null;
  disabled?: boolean;
}

/**
 * Slider
 *
 * MUI Slider component with marks support for stepped numeric input.
 * Used in the sample rate selector with predefined marks and step=null
 * to enforce mark-only selection.
 */
export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  marks,
  step,
  disabled = false,
}) => {
  const handleChange = (_event: Event, newValue: number | number[]) => {
    /* istanbul ignore else -- range mode not supported, newValue will always be number */
    if (typeof newValue === "number") {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ px: 2 }}>
      <Typography
        id={`slider-label-${label.toLowerCase().replace(/\s+/g, "-")}`}
        gutterBottom
      >
        {label}
      </Typography>
      <MuiSlider
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        marks={marks}
        step={step}
        disabled={disabled}
        valueLabelDisplay="auto"
        aria-labelledby={`slider-label-${label.toLowerCase().replace(/\s+/g, "-")}`}
        data-testid={`slider-${label.toLowerCase().replace(/\s+/g, "-")}`}
      />
    </Box>
  );
};

export default Slider;
