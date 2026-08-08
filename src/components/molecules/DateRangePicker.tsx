import type React from "react";
import { useEffect } from "react";
import { Box } from "@mui/material";
import DatePicker from "../atoms/DatePicker";

export interface DateRangePickerProps {
  from: string | null;
  to: string | null;
  onChange: (range: { from: string | null; to: string | null }) => void;
  onError: (message: string) => void;
}

/**
 * DateRangePicker
 *
 * Molecule that wraps two DatePicker atoms for selecting a date range.
 * Validates that 'from' date is before 'to' date and calls onError if invalid.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from,
  to,
  onChange,
  onError,
}) => {
  // Validate range whenever from or to changes
  useEffect(() => {
    if (from && to && from > to) {
      onError("'From' date must be before 'To' date");
    }
  }, [from, to, onError]);

  const handleFromChange = (newFrom: string | null) => {
    onChange({ from: newFrom, to });
  };

  const handleToChange = (newTo: string | null) => {
    onChange({ from, to: newTo });
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <DatePicker label="From" value={from} onChange={handleFromChange} />
      <DatePicker label="To" value={to} onChange={handleToChange} />
    </Box>
  );
};

export default DateRangePicker;
