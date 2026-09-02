import type React from "react";
import useIFrameBridge from "../../hooks/useIFrameBridge";
import AppThemeProvider from "../../theme/AppThemeProvider";
import FilterPanel from "../organisms/FilterPanel";
import GraphCanvas from "../organisms/GraphCanvas";
import PageLayout from "../templates/PageLayout";

/**
 * DataViewerPage
 *
 * Top-level page that composes the application shell with filter panel,
 * graph canvas, header, footer, and notification system. This component
 * is the mounting point in `main.tsx`.
 */
export const DataViewerPage: React.FC = () => {
  useIFrameBridge();
  return (
    <AppThemeProvider>
      <PageLayout aside={<FilterPanel />}>
        <GraphCanvas />
      </PageLayout>
    </AppThemeProvider>
  );
};

export default DataViewerPage;
