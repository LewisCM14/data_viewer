import { createRoot } from "react-dom/client";
import DataViewerPage from "./components/pages/DataViewerPage";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<DataViewerPage />);
}
