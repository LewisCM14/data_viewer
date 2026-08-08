import type React from "react";
import Slider from "../atoms/Slider";

export interface SampleRateSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const SAMPLE_RATE_MARKS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 30, label: "30" },
];

/**
 * SampleRateSlider
 *
 * Molecule that wraps Slider atom with predefined sample rate marks.
 * Uses step={null} to enforce mark-only selection (users can only
 * select from the predefined values: 1, 2, 5, 10, 15, 30 Hz).
 */
export const SampleRateSlider: React.FC<SampleRateSliderProps> = ({
  value,
  onChange,
}) => {
  return (
    <Slider
      label="Sample Rate (Hz)"
      value={value}
      onChange={onChange}
      min={1}
      max={30}
      marks={SAMPLE_RATE_MARKS}
      step={null}
    />
  );
};

export default SampleRateSlider;
