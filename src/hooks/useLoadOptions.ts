import { useCallback, useEffect, useState } from "react";
import getRepository from "../api/repository";
import type { FilterOptions } from "../types";

export default function useLoadOptions() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [options, setOptions] = useState<FilterOptions | null>(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const repo = getRepository();
      if (typeof repo.getFilterOptions === "function") {
        const opts = await repo.getFilterOptions();
        setOptions(opts);
      } else {
        // fallback to small default set
        setOptions({
          equipments: [
            { id: "eq1", name: "Equipment 1" },
            { id: "eq2", name: "Equipment 2" },
            { id: "eq3", name: "Equipment 3" },
          ],
          digitalChannels: [
            { id: "d1", name: "Digital 1", color: "#FF6384" },
            { id: "d2", name: "Digital 2", color: "#36A2EB" },
            { id: "d3", name: "Digital 3", color: "#FFCE56" },
            { id: "d4", name: "Digital 4", color: "#4BC0C0" },
            { id: "d5", name: "Digital 5", color: "#9966FF" },
          ],
          analogueChannels: [
            { id: "a1", name: "Analogue 1", color: "#FF9F40" },
            { id: "a2", name: "Analogue 2", color: "#FF6384" },
            { id: "a3", name: "Analogue 3", color: "#C9CBCF" },
            { id: "a4", name: "Analogue 4", color: "#4BC0C0" },
          ],
        });
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return { loading, error, options, retry: fetchOptions } as const;
}
