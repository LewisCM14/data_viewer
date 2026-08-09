import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Global mock for react-plotly.js to avoid module resolution issues
vi.mock("react-plotly.js", () => ({
  default: vi.fn(({ data, layout, config, style }) =>
    React.createElement("div", {
      "data-testid": "plot-canvas",
      "data-plot-data": JSON.stringify(data),
      "data-plot-layout": JSON.stringify(layout),
      "data-plot-config": JSON.stringify(config),
      style: style,
    }),
  ),
}));

// Mock react-transition-group to avoid async transition warnings in tests.
vi.mock("react-transition-group", () => {
  const React = require("react");
  return {
    TransitionGroup: (props: any) => React.createElement(React.Fragment, null, props.children),
    CSSTransition: (props: any) => React.createElement(React.Fragment, null, props.children),
    Transition: (props: any) => React.createElement(React.Fragment, null, props.children),
  };
});

// Also mock common deep import entry points used by some libraries (cjs/esm paths)
vi.mock("react-transition-group/TransitionGroup", () => {
  const React = require("react");
  return { default: (props: any) => React.createElement(React.Fragment, null, props.children) };
});

vi.mock("react-transition-group/CSSTransition", () => {
  const React = require("react");
  return { default: (props: any) => React.createElement(React.Fragment, null, props.children) };
});

vi.mock("react-transition-group/Transition", () => {
  const React = require("react");
  return { default: (props: any) => React.createElement(React.Fragment, null, props.children) };
});

vi.mock("react-transition-group/cjs/TransitionGroup", () => {
  const React = require("react");
  return { default: (props: any) => React.createElement(React.Fragment, null, props.children) };
});

vi.mock("react-transition-group/cjs/CSSTransition", () => {
  const React = require("react");
  return { default: (props: any) => React.createElement(React.Fragment, null, props.children) };
});

vi.mock("react-transition-group/cjs/Transition", () => {
  const React = require("react");
  return { default: (props: any) => React.createElement(React.Fragment, null, props.children) };
});

// Quiet specific React testing warnings about transitions not wrapped in act(...)
const _consoleError = console.error;
console.error = (...args: any[]) => {
  try {
    const msg = args[0];
    if (typeof msg === "string" && msg.includes("not wrapped in act(")) return;
    if (msg && msg.message && typeof msg.message === "string" && msg.message.includes("not wrapped in act(")) return;
  } catch (e) {
    // ignore
  }
  _consoleError(...args);
};
