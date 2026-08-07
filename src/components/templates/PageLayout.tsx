import type React from "react";

/**
 * PageLayout template
 *
 * Provides a simple page shell used by pages in the app. Tests rely on
 * the landmark regions (`header`, `aside`, `main`, `footer`) being present.
 */
export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <header data-testid="header">Header</header>
      <div style={{ display: "flex" }}>
        <aside data-testid="aside" style={{ width: "20%" }}>
          Aside
        </aside>
        <main data-testid="main" style={{ width: "80%" }}>
          {children}
        </main>
      </div>
      <footer data-testid="footer">Footer</footer>
    </div>
  );
};

export default PageLayout;
