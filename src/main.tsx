import { createRoot } from "react-dom/client";
import DataViewerPage from "./components/pages/DataViewerPage";

const root = document.getElementById("root");
/* istanbul ignore next */
if (root) {
  createRoot(root).render(<DataViewerPage />);
}
