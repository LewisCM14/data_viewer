import type React from "react";

/**
 * PageLayout template
 *
 * Provides a simple page shell used by pages in the app. Tests rely on
 * the landmark regions (`header`, `aside`, `main`, `footer`) being present.
 */
export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header
        data-testid="header"
        style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}
      >
        Header
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          data-testid="aside"
          style={{
            width: "20%",
            padding: "1rem",
            borderRight: "1px solid #ccc",
          }}
        >
          Aside
        </aside>
        <main
          data-testid="main"
          style={{
            width: "80%",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </main>
      </div>
      <footer
        data-testid="footer"
        style={{ padding: "1rem", borderTop: "1px solid #ccc" }}
      >
        Footer
      </footer>
    </div>
  );
};

export default PageLayout;
