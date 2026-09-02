import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

// Provide the mock implementations inside the vi.mock factory (hoisted)
vi.mock("../../api/mock/MockChannelRepository", () => {
  const digitalLoadOptions = vi.fn((_query: string, page: number) => {
    if (page === 1) {
      return Promise.resolve({
        options: [{ id: "d10", name: "Digital 10", color: "#111111" }],
        hasMore: true,
      });
    }
    return Promise.resolve({
      options: [{ id: "d11", name: "Digital 11", color: "#222222" }],
      hasMore: false,
    });
  });

  const analogueLoadOptions = vi
    .fn()
    .mockResolvedValue({ options: [], hasMore: false });

  return { digitalLoadOptions, analogueLoadOptions };
});

// Replace ChannelSelect with a test-friendly mock that calls `loadOptions` immediately
vi.mock("../molecules/ChannelSelect", () => {
  const React = require("react");
  return {
    __esModule: true,
    // biome-ignore lint/suspicious/noExplicitAny: test mock accepts flexible props for ChannelSelect
    default: ({ type, loadOptions }: any) => {
      const [query, setQuery] = React.useState("");
      const [page, setPage] = React.useState(1);
      const [hasMore, setHasMore] = React.useState(true);

      // biome-ignore lint/suspicious/noExplicitAny: options element shape is flexible in test mock
      const [options, setOptions] = React.useState([] as any[]);

      React.useEffect(() => {
        if (query.length >= 2) {
          // biome-ignore lint/suspicious/noExplicitAny: mocked loadOptions returns a loose payload
          loadOptions(query, 1).then((res: any) => {
            setHasMore(res.hasMore);
            setOptions(res.options || []);
            setPage(1);
          });
        }
      }, [query, loadOptions]);

      return (
        <div>
          <input
            role="combobox"
            aria-expanded={false}
            aria-label={
              type === "digital" ? "Digital Channels" : "Analogue Channels"
            }
            placeholder="Search channels..."
            // biome-ignore lint/suspicious/noExplicitAny: event typing is intentionally permissive in test
            onChange={(e: any) => setQuery(e.target.value)}
          />
          <div
            id={`${type}-listbox`}
            role="listbox"
            onScroll={() => {
              if (hasMore) {
                const next = page + 1;
                // biome-ignore lint/suspicious/noExplicitAny: mocked loadOptions returns a loose payload
                loadOptions(query, next).then((res: any) => {
                  // biome-ignore lint/suspicious/noExplicitAny: options element shape is flexible in this test mock
                  setOptions((prev: any[]) => [
                    ...prev,
                    ...(res.options || []),
                  ]);
                  setHasMore(res.hasMore);
                  setPage(next);
                });
              }
            }}
          >
            {options.map(
              // biome-ignore lint/suspicious/noExplicitAny: option objects are flexible in this mock
              (o: any) => (
                <div key={o.id}>{o.name}</div>
              ),
            )}
          </div>
        </div>
      );
    },
  };
});

import FilterPanel from "./FilterPanel";

describe("FilterPanel loadOptions pagination", () => {
  test("loads first page on input and loads next page on scroll", async () => {
    render(<FilterPanel />);

    const MockRepo = await import("../../api/mock/MockChannelRepository");

    // Type into the digital channels input to trigger loadOptions
    const user = userEvent.setup();
    const digitalInput = screen.getByRole("combobox", {
      name: /digital channels/i,
    });
    await user.type(digitalInput, "Di");

    // Wait for loadOptions to be called for page 1
    await waitFor(() =>
      expect(MockRepo.digitalLoadOptions).toHaveBeenCalledWith("Di", 1),
    );

    const listbox = document.getElementById("digital-listbox");
    expect(listbox).toBeInTheDocument();
    if (listbox) {
      expect(within(listbox).getByText("Digital 10")).toBeInTheDocument();

      // Simulate scrolling to the bottom of the listbox to trigger loadMore
      Object.defineProperty(listbox, "scrollTop", {
        value: 100,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(listbox, "clientHeight", {
        value: 50,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(listbox, "scrollHeight", {
        value: 149,
        configurable: true,
        writable: true,
      });

      fireEvent.scroll(listbox);

      await waitFor(() =>
        expect(MockRepo.digitalLoadOptions).toHaveBeenCalledWith("Di", 2),
      );

      expect(within(listbox).getByText("Digital 11")).toBeInTheDocument();
    }
  });
});
