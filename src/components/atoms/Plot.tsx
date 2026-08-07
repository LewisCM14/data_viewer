import type React from "react";

/**
 * Plot atom
 *
 * Thin placeholder for the plotting component used in tests and early
 * development. Replace with a `react-plotly.js` wrapper when wiring real data.
 *
 * Renders a `div` with `data-testid="plot"` to make tests deterministic.
 */
export const Plot: React.FC = () => {
  return <div data-testid="plot" />;
};

export default Plot;
