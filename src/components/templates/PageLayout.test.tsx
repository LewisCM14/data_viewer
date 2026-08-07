import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import PageLayout from "./PageLayout";

describe("PageLayout", () => {
  test("renders header, aside, main and footer with expected layout portions", () => {
    const { getByTestId } = render(
      <PageLayout>
        <div>content</div>
      </PageLayout>,
    );

    expect(getByTestId("header")).toBeTruthy();
    expect(getByTestId("aside")).toBeTruthy();
    expect(getByTestId("main")).toBeTruthy();
    expect(getByTestId("footer")).toBeTruthy();
  });
});
