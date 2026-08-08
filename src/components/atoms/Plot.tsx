import type { Config, Data, Layout } from "plotly.js";
import type React from "react";
import Plotly from "react-plotly.js";

export interface PlotProps {
  data: Partial<Data>[];
  layout: Partial<Layout>;
  config?: Partial<Config>;
  style?: React.CSSProperties;
}

/**
 * Plot
 *
 * Thin wrapper around react-plotly.js <Plotly> component.
 * Renders an interactive Plotly chart with the provided data, layout, and config.
 * Used throughout the app for time-series visualization.
 *
 * @param data - Array of Plotly trace objects
 * @param layout - Plotly layout configuration
 * @param config - Optional Plotly config (mode bar, etc.)
 * @param style - Optional inline styles for the container
 */
export const Plot: React.FC<PlotProps> = ({ data, layout, config, style }) => {
  return <Plotly data={data} layout={layout} config={config} style={style} />;
};

export default Plot;
