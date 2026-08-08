import { Box, CircularProgress, Typography } from "@mui/material";
import type React from "react";
import useGetGraphData from "../../hooks/useGetGraphData";
import { initialFilterState } from "../../store/slices/filterSlice";
import { getLayout } from "../../utils/getLayout";
import { getPlotData } from "../../utils/getPlotData";
import Plot from "../atoms/Plot";

/**
 * PlotContainer
 *
 * Molecule responsible for obtaining graph data via `useGetGraphData` and
 * rendering the `Plot` atom with transformed data. Shows a loading indicator
 * (CircularProgress) when fetching data and a placeholder message when no
 * channels are selected.
 *
 * Transforms BucketedRecording[] into Plotly traces using getPlotData and
 * derives layout configuration from filter state using getLayout.
 */
export const PlotContainer: React.FC = () => {
  const { data, loading } = useGetGraphData();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Select channels to view data
        </Typography>
      </Box>
    );
  }

  // Transform data for Plotly
  const plotData = getPlotData(data, initialFilterState.channelColours);
  const layout = getLayout(initialFilterState);

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true }}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default PlotContainer;
