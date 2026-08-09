import { useCallback, useEffect, useRef, useState } from "react";
import getRepository from "../api/repository";
import useNotificationSlice from "../store/slices/notificationSlice";
import type { BucketedRecording, TimeseriesQueryParams } from "../types";

/**
 * useGetGraphData
 *
 * Hook that fetches bucketed timeseries data via the repository layer and
 * exposes a simple `{ data, loading }` shape for components. In the walking
 * skeleton this calls the `MockTelemetryRepository`.
 *
 * @returns {{ data: unknown[] | null, loading: boolean }} current data and loading state
 */
export default function useGetGraphData(options?: {
  estimatedPoints?: number;
  params?: TimeseriesQueryParams;
  maxDataPoints?: number;
}) {
  const [data, setData] = useState<BucketedRecording[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Error state kept for potential UI, but value is unused by callers.
  // Keep setter local for future use if needed.
  const [, setError] = useState<Error | null>(null);
  const currentController = useRef<AbortController | null>(null);
  const notifier = useNotificationSlice();

  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const DEFAULT_MAX = Number(meta.env?.VITE_MAX_DATA_POINTS ?? 800000);

  const doFetch = useCallback(
    async (
      params?: TimeseriesQueryParams,
      estimatedPoints?: number,
      maxDataPoints?: number,
    ) => {
      setLoading(true);
      setError(null);

      // cancel any existing request
      if (currentController.current) {
        currentController.current.abort();
      }
      const controller = new AbortController();
      currentController.current = controller;

      const MAX_DATA_POINTS = Number(maxDataPoints ?? DEFAULT_MAX);

      if (estimatedPoints && estimatedPoints > MAX_DATA_POINTS) {
        notifier.showNotification(
          "Estimated data points exceed limit; request blocked",
          "warning",
        );
        setLoading(false);
        return null;
      }

      try {
        const repo = getRepository();
        const requestPayload = params
          ? { ...params, signal: controller.signal }
          : { signal: controller.signal };
        const res = await repo.getTimeseries(requestPayload);

        // If returned items don't include `series`, keep raw data and skip
        // the MAX_DATA_POINTS check to remain compatible with simple tests.
        const isArray = Array.isArray(res);
        const hasSeries =
          isArray &&
          (res as unknown[]).some((item) => {
            return (
              typeof item === "object" &&
              item !== null &&
              Array.isArray((item as { series?: unknown }).series)
            );
          });

        if (!hasSeries) {
          // If items don't have series, store as-is and return early
          setData(res as BucketedRecording[]);
          setLoading(false);
          return res as BucketedRecording[];
        }

        const bucketed = res as BucketedRecording[];

        const total = bucketed.reduce((acc: number, rec: BucketedRecording) => {
          const series = Array.isArray(rec.series) ? rec.series : [];
          const sCount = series.reduce((sAcc: number, s) => {
            const vals = s.values;
            return sAcc + (Array.isArray(vals) ? vals.length : 0);
          }, 0);
          return acc + sCount;
        }, 0);

        if (total > MAX_DATA_POINTS) {
          notifier.showNotification(
            "Received too many data points; request discarded",
            "warning",
          );
          setData(null);
          setLoading(false);
          return null;
        }

        setData(bucketed);
        setLoading(false);
        return bucketed;
      } catch (err) {
        const errName =
          err && typeof err === "object" && "name" in err
            ? (err as { name?: unknown }).name
            : undefined;
        if (err instanceof DOMException || errName === "AbortError") {
          setLoading(false);
          return null;
        }
        setError(err as Error);
        notifier.showNotification(
          (err as Error).message || "Error fetching data",
          "error",
        );
        setLoading(false);
        return null;
      }
    },
    [DEFAULT_MAX, notifier],
  );

  const plot = useCallback(
    async (
      params?: TimeseriesQueryParams,
      estimatedPoints?: number,
      maxDataPoints?: number,
    ) => doFetch(params, estimatedPoints, maxDataPoints),
    [doFetch],
  );

  const cancel = useCallback(() => {
    if (currentController.current) {
      currentController.current.abort();
      currentController.current = null;
    }
  }, []);

  useEffect(() => {
    // trigger an initial fetch on mount to preserve previous behaviour
    // when the hook was mount-driven. Tests and some callers expect this.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      await plot(
        options?.params,
        options?.estimatedPoints,
        options?.maxDataPoints,
      );
    })();

    return () => {
      if (currentController.current) currentController.current.abort();
    };
    // We explicitly want this to run once on mount and to use the provided
    // options from the initial hook call only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, plot, cancel } as const;
}
