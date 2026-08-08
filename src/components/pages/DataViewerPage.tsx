import type React from "react";
import AppThemeProvider from "../../theme/AppThemeProvider";
import GraphCanvas from "../organisms/GraphCanvas";
import PageLayout from "../templates/PageLayout";

/**
 * DataViewerPage
 *
 * Top-level page that composes the application shell and the primary
 * GraphCanvas organism. This component is the mounting point in `main.tsx`.
 */
export const DataViewerPage: React.FC = () => {
  return (
    <AppThemeProvider>
      <PageLayout>
        <GraphCanvas />
      </PageLayout>
    </AppThemeProvider>
  );
};

export default DataViewerPage;
