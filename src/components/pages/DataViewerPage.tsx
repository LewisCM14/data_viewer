import type React from "react";
import AppThemeProvider from "../../theme/AppThemeProvider";
import PlotContainer from "../molecules/PlotContainer";
import PageLayout from "../templates/PageLayout";

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
