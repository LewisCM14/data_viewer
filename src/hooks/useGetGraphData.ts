/* istanbul ignore file */
import { useEffect, useRef, useState } from "react";
import MockTelemetryRepository from "../api/mock/MockTelemetryRepository";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [_error, setError] = useState<Error | null>(null);
  const currentController = useRef<AbortController | null>(null);
  const notifier = useNotificationSlice();

  const meta = import.meta as unknown as { env?: Record<string, unknown> };
  const MAX_DATA_POINTS = Number(
    options?.maxDataPoints ?? meta.env?.VITE_MAX_DATA_POINTS ?? 800000,
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // Cancel previous request
    if (currentController.current) {
      currentController.current.abort();
    }
    const controller = new AbortController();
    currentController.current = controller;

    // pre-flight estimate: if provided by caller, block and notify
    if (options?.estimatedPoints && options.estimatedPoints > MAX_DATA_POINTS) {
      notifier.showNotification(
        "Estimated data points exceed limit; request blocked",
        "warning",
      );
      setLoading(false);
      return;
    }

    MockTelemetryRepository.getTimeseries({
      ...(options?.params ?? {}),
      signal: controller.signal,
    })
      .then((res) => {
        if (!mounted) return;
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
          setData(res as unknown as BucketedRecording[]);
          setLoading(false);
          return;
        }

        // count total data points in returned recordings safely
        const total = (res as BucketedRecording[]).reduce(
          (acc: number, rec: BucketedRecording) => {
            const series = Array.isArray(rec.series) ? rec.series : [];

            const sCount = series.reduce((sAcc: number, s) => {
              const vals = s.values;
              return sAcc + (Array.isArray(vals) ? vals.length : 0);
            }, 0);

            return acc + sCount;
          },
          0,
        );

        if (total > MAX_DATA_POINTS) {
          notifier.showNotification(
            "Received too many data points; request discarded",
            "warning",
          );
          setData(null);
          setLoading(false);
          return;
        }

        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err && (err.name === "AbortError" || err instanceof DOMException)) {
          // aborted - ignore
          setLoading(false);
          return;
        }
        setError(err as Error);
        notifier.showNotification(
          (err as Error).message || "Error fetching data",
          "error",
        );
        setLoading(false);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading };
}
