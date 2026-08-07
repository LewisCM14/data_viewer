import type React from "react";
import useGetGraphData from "../../hooks/useGetGraphData";
import Plot from "../atoms/Plot";

/**
 * PlotContainer
 *
 * Molecule responsible for obtaining graph data via `useGetGraphData` and
 * rendering the `Plot` atom. Shows a loading indicator and a placeholder
 * message when there is no data.
 */
export const PlotContainer: React.FC = () => {
  const { data, loading } = useGetGraphData();

  if (loading) return <div data-testid="plot-loading">Loading</div>;
  if (!data || data.length === 0)
    return (
      <div data-testid="plot-placeholder">Select channels to view data</div>
    );

  return <Plot />;
};

export default PlotContainer;
