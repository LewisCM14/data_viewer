import type { Layout } from "plotly.js";
import type { FilterState } from "../store/slices/filterSlice";

/**
 * getLayout
 *
 * Derives a Plotly Layout configuration from the current filter state.
 * Sets axis titles and optionally constrains the x-axis range to match
 * the selected date range filter.
 *
 * @param state - Current filter slice state
 * @returns Partial Plotly.Layout object
 */
export function getLayout(state: FilterState): Partial<Layout> {
  const layout: Partial<Layout> = {
    xaxis: {
      title: {
        text: "Timestamp",
      },
    },
    yaxis: {
      title: {
        text: "Value",
      },
    },
  };

  // Apply date range if set
  if (state.dateRange) {
    layout.xaxis = {
      ...layout.xaxis,
      range: state.dateRange,
    };
  }

  return layout;
}
