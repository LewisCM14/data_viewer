import { beforeEach, describe, expect, test, vi } from "vitest";

// mock the notification slice so we can assert showNotification calls
const mockShow = vi.fn();
vi.mock("../../../store/slices/notificationSlice", () => ({
  default: () => ({
    showNotification: mockShow,
    getState: () => ({ open: false, message: "", severity: "info" }),
    dismissNotification: () => {},
    initialNotificationState: {},
  }),
}));

import { Observable } from "@apollo/client";
import type { FormattedExecutionResult } from "graphql";
import { errorLink } from "./errorLink";

describe("errorLink", () => {
  beforeEach(() => {
    mockShow.mockClear();
  });

  describe("safeStringify", () => {
    // We need to test safeStringify indirectly through errorLink behavior
    // since it's not exported. We'll test it via network error handling.

    test("handles falsy values in network errors", async () => {
      const link = errorLink();
      const forward = () =>
        new Observable((observer) => {
          observer.error(null);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await new Promise<void>((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: () => {},
          error: () => {
            resolve();
          },
        });
      });

      expect(mockShow).toHaveBeenCalledWith("null", "error");
    });

    test("handles Error objects in network errors", async () => {
      const link = errorLink();
      const testError = new Error("Test error message");
      const forward = () =>
        new Observable((observer) => {
          observer.error(testError);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await expect(
        new Promise((resolve, reject) => {
          // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
          const obs = link.request(op as any, forward as any);
          obs?.subscribe({ next: resolve, error: reject });
        }),
      ).rejects.toBeTruthy();

      expect(mockShow).toHaveBeenCalledWith("Test error message", "error");
    });

    test("handles string errors", async () => {
      const link = errorLink();
      const forward = () =>
        new Observable((observer) => {
          observer.error("String error");
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await expect(
        new Promise((resolve, reject) => {
          // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
          const obs = link.request(op as any, forward as any);
          obs?.subscribe({ next: resolve, error: reject });
        }),
      ).rejects.toBeTruthy();

      expect(mockShow).toHaveBeenCalledWith("String error", "error");
    });

    test("handles objects with circular references in network errors", async () => {
      const link = errorLink();
      const circularObj: Record<string, unknown> = { a: 1 };
      circularObj.self = circularObj;

      const forward = () =>
        new Observable((observer) => {
          observer.error(circularObj);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await expect(
        new Promise((resolve, reject) => {
          // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
          const obs = link.request(op as any, forward as any);
          obs?.subscribe({ next: resolve, error: reject });
        }),
      ).rejects.toBeTruthy();

      expect(mockShow).toHaveBeenCalled();
      const callArgs = mockShow.mock.calls[0];
      expect(callArgs[0]).toContain("[Circular]");
      expect(callArgs[1]).toBe("error");
    });

    test("handles objects with functions in network errors", async () => {
      const link = errorLink();
      const objWithFunc = { fn: () => {}, name: "test" };
      const forward = () =>
        new Observable((observer) => {
          observer.error(objWithFunc);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await expect(
        new Promise((resolve, reject) => {
          // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
          const obs = link.request(op as any, forward as any);
          obs?.subscribe({ next: resolve, error: reject });
        }),
      ).rejects.toBeTruthy();

      expect(mockShow).toHaveBeenCalled();
      const callArgs = mockShow.mock.calls[0];
      expect(callArgs[0]).toContain("[Function");
      expect(callArgs[1]).toBe("error");
    });

    test("handles objects that cannot be stringified then Error", async () => {
      const link = errorLink();

      // Create a proxy that throws on JSON.stringify but has a message property
      const problematicError = new Error("Fallback message");
      const forward = () =>
        new Observable((observer) => {
          observer.error(problematicError);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await expect(
        new Promise((resolve, reject) => {
          // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
          const obs = link.request(op as any, forward as any);
          obs?.subscribe({ next: resolve, error: reject });
        }),
      ).rejects.toBeTruthy();

      expect(mockShow).toHaveBeenCalledWith("Fallback message", "error");
    });

    test("handles objects that cannot be stringified at all", async () => {
      const link = errorLink();

      // Use Symbol which cannot be serialized or converted to string easily
      const nonSerializable = Symbol("test");
      const forward = () =>
        new Observable((observer) => {
          observer.error(nonSerializable);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await new Promise<void>((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: () => {},
          error: () => {
            resolve();
          },
        });
      });

      expect(mockShow).toHaveBeenCalled();
      const callArgs = mockShow.mock.calls[0];
      expect(callArgs[1]).toBe("error");
    });

    test("handles BigInt in network errors which cannot be stringified", async () => {
      const link = errorLink();

      // BigInt cannot be JSON.stringified, will trigger outer catch block
      const bigIntValue = BigInt(9007199254740992);
      const forward = () =>
        new Observable((observer) => {
          observer.error(bigIntValue);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await new Promise<void>((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: () => {},
          error: () => {
            resolve();
          },
        });
      });

      expect(mockShow).toHaveBeenCalled();
      const callArgs = mockShow.mock.calls[0];
      expect(callArgs[1]).toBe("error");
    });

    test("handles objects that throw both during stringify and String conversion", async () => {
      const link = errorLink();

      const forward = () =>
        new Observable((observer) => {
          // BigInt causes JSON.stringify to fail silently, but we need it to error
          // Use an object with a property that throws during stringify
          const badObj = Object.create(null);
          Object.defineProperty(badObj, "data", {
            get() {
              throw new Error("Data access failed");
            },
            enumerable: true,
          });
          observer.error(badObj);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      // Temporarily override String to throw after being called once
      const originalString = global.String;
      let stringCallCount = 0;
      // biome-ignore lint/suspicious/noExplicitAny: testing by mocking global
      (global as any).String = (value: unknown) => {
        stringCallCount++;
        if (stringCallCount > 0) {
          // Let the first call succeed (for initial error stringification)
          // Then throw to test the catch block
          throw new Error("String conversion failed");
        }
        return originalString(value);
      };
      // biome-ignore lint/suspicious/noExplicitAny: mocking global String for test
      (global.String as any).prototype = originalString.prototype;

      try {
        await new Promise<void>((resolve) => {
          // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
          const obs = link.request(op as any, forward as any);
          obs?.subscribe({
            next: () => {},
            error: () => {
              resolve();
            },
          });
        });

        expect(mockShow).toHaveBeenCalled();
        const callArgs = mockShow.mock.calls[0];
        expect(callArgs[1]).toBe("error");
      } finally {
        // Restore original String
        global.String = originalString;
      }
    });

    test("handles objects with functions (coverage for replacer branches)", async () => {
      const link = errorLink();

      const forward = () =>
        new Observable((observer) => {
          // Object with both functions and nested objects
          // This ensures the JSON.stringify replacer callback tests various branches
          const complexObj = {
            name: "test",
            fn: function namedFunc() {
              return "test";
            },
            nested: {
              method: () => {},
            },
            value: 42,
          };
          observer.error(complexObj);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await new Promise<void>((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: () => {},
          error: () => {
            resolve();
          },
        });
      });

      expect(mockShow).toHaveBeenCalled();
      const callArgs = mockShow.mock.calls[0];
      expect(callArgs[1]).toBe("error");
      // Should contain the [Function markers for the functions
      expect(callArgs[0]).toContain("[Function");
    });

    test("handles deeply nested circular references in objects", async () => {
      const link = errorLink();

      const forward = () =>
        new Observable((observer) => {
          // Create a deeply nested object with circular reference
          // biome-ignore lint/suspicious/noExplicitAny: creating dynamic structure for testing
          const obj1 = { name: "obj1" } as any;
          const obj2 = { name: "obj2", ref: obj1 };
          const obj3 = { name: "obj3", ref: obj2 };
          obj1.deep = obj3; // Create circular reference

          observer.error(obj1);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await new Promise<void>((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: () => {},
          error: () => {
            resolve();
          },
        });
      });

      expect(mockShow).toHaveBeenCalled();
      const callArgs = mockShow.mock.calls[0];
      expect(callArgs[1]).toBe("error");
      // Should detect circular reference
      expect(callArgs[0]).toContain("[Circular]");
    });

    test("handles objects with mixed types and nulls", async () => {
      const link = errorLink();

      const forward = () =>
        new Observable((observer) => {
          // Object with mixed types including null, undefined, and primitives
          // to exercise all branches in the replacer
          const mixedObj = {
            str: "string",
            num: 123,
            bool: true,
            nullVal: null,
            nested: {
              inner: {
                value: 42,
              },
            },
            anonFunc: () => {},
            namedFunc: function named() {},
          };
          observer.error(mixedObj);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await new Promise<void>((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: () => {},
          error: () => {
            resolve();
          },
        });
      });

      expect(mockShow).toHaveBeenCalled();
      const callArgs = mockShow.mock.calls[0];
      expect(callArgs[1]).toBe("error");
      expect(callArgs[0]).toContain("[Function");
    });
  });

  describe("GraphQL error handling", () => {
    test("notifies on GraphQL errors in response", async () => {
      const link = errorLink();

      const graphQLErrors = [
        { message: "Query error" },
        { message: "Validation error" },
      ];

      const forward = () =>
        new Observable<
          FormattedExecutionResult<
            Record<string, unknown>,
            Record<string, unknown>
          >
        >((observer) => {
          observer.next({
            // biome-ignore lint/suspicious/noExplicitAny: testing GraphQL result
            errors: graphQLErrors as any,
            data: null,
          });
          observer.complete();
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      const result = await new Promise((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: resolve,
          error: () => {},
          complete: () => {},
        });
      });

      expect(mockShow).toHaveBeenCalledWith(
        "Query error, Validation error",
        "error",
      );
      expect(result).toBeDefined();
    });

    test("does not notify on empty errors array", async () => {
      const link = errorLink();

      const forward = () =>
        new Observable<
          FormattedExecutionResult<
            Record<string, unknown>,
            Record<string, unknown>
          >
        >((observer) => {
          observer.next({
            errors: [],
            data: { test: "data" },
          });
          observer.complete();
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      const result = await new Promise((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: resolve,
          error: () => {},
          complete: () => {},
        });
      });

      expect(mockShow).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    test("handles responses with no errors property", async () => {
      const link = errorLink();

      const forward = () =>
        new Observable<
          FormattedExecutionResult<
            Record<string, unknown>,
            Record<string, unknown>
          >
        >((observer) => {
          observer.next({
            data: { test: "data" },
          });
          observer.complete();
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      const result = await new Promise((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: resolve,
          error: () => {},
          complete: () => {},
        });
      });

      expect(mockShow).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("network error handling", () => {
    test("notifies on network error", async () => {
      const link = errorLink();
      const networkError = new Error("Network failed");

      const forward = () =>
        new Observable((observer) => {
          observer.error(networkError);
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      await expect(
        new Promise((resolve, reject) => {
          // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
          const obs = link.request(op as any, forward as any);
          obs?.subscribe({ next: resolve, error: reject });
        }),
      ).rejects.toBeTruthy();

      expect(mockShow).toHaveBeenCalledWith("Network failed", "error");
    });
  });

  describe("observable completion and cleanup", () => {
    test("completes successfully", async () => {
      const link = errorLink();

      const forward = () =>
        new Observable<
          FormattedExecutionResult<
            Record<string, unknown>,
            Record<string, unknown>
          >
        >((observer) => {
          observer.next({ data: { test: "data" } });
          observer.complete();
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      const completed = await new Promise<boolean>((resolve) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        obs?.subscribe({
          next: () => {},
          error: () => {},
          complete: () => resolve(true),
        });
      });

      expect(completed).toBe(true);
    });

    test("unsubscribes properly", async () => {
      const link = errorLink();
      const unsubscribeSpy = vi.fn();

      const forward = () =>
        new Observable<
          FormattedExecutionResult<
            Record<string, unknown>,
            Record<string, unknown>
          >
        >((observer) => {
          observer.next({ data: { test: "data" } });
          return unsubscribeSpy;
        });

      const op = { setContext: () => {}, getContext: () => ({}) };

      // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
      const obs = link.request(op as any, forward as any);
      const subscription = obs?.subscribe({
        next: () => {},
        error: () => {},
        complete: () => {},
      });

      subscription?.unsubscribe();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("forward link handling", () => {
    test("handles null forward function", async () => {
      const link = errorLink();

      const op = { setContext: () => {}, getContext: () => ({}) };

      const completed = await new Promise<boolean>((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, null as any);
        if (!obs) {
          reject(new Error("No observable returned"));
          return;
        }
        obs.subscribe({
          next: () => reject(new Error("Should not emit")),
          error: () => reject(new Error("Should not error")),
          complete: () => resolve(true),
        });
      });

      expect(completed).toBe(true);
    });

    test("handles forward that returns null", async () => {
      const link = errorLink();

      const forward = () => null;

      const op = { setContext: () => {}, getContext: () => ({}) };

      const completed = await new Promise<boolean>((resolve, reject) => {
        // biome-ignore lint/suspicious/noExplicitAny: testing Apollo Link
        const obs = link.request(op as any, forward as any);
        if (!obs) {
          reject(new Error("No observable returned"));
          return;
        }
        obs.subscribe({
          next: () => reject(new Error("Should not emit")),
          error: () => reject(new Error("Should not error")),
          complete: () => resolve(true),
        });
      });

      expect(completed).toBe(true);
    });
  });
});
