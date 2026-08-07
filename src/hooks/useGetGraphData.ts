import { useEffect, useState } from "react";
import MockTelemetryRepository from "../api/mock/MockTelemetryRepository";

/**
 * useGetGraphData
 *
 * Hook that fetches bucketed timeseries data via the repository layer and
 * exposes a simple `{ data, loading }` shape for components. In the walking
 * skeleton this calls the `MockTelemetryRepository`.
 *
 * @returns {{ data: unknown[] | null, loading: boolean }} current data and loading state
 */
export default function useGetGraphData() {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    MockTelemetryRepository.getTimeseries().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
