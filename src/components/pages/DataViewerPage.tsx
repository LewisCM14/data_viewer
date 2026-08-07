import type React from "react";
import AppThemeProvider from "../../theme/AppThemeProvider";
import PageLayout from "../templates/PageLayout";
import PlotContainer from "../molecules/PlotContainer";

/**
 * DataViewerPage
 *
 * Top-level page that composes the application shell and the primary
 * `PlotContainer` molecule. This component is the mounting point in `main.tsx`.
 */
export const DataViewerPage: React.FC = () => {
  return (
    <AppThemeProvider>
      <PageLayout>
        <PlotContainer />
      </PageLayout>
    </AppThemeProvider>
  );
};

export default DataViewerPage;
