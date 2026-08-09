export interface Channel {
  id: string;
  name: string;
  color: string;
}

const DIGITAL_CHANNELS: Channel[] = Array.from({ length: 50 }, (_, i) => ({
  id: `d${i + 1}`,
  name: `Digital ${i + 1}`,
  color: `#${(i % 10).toString(16).padStart(6, "0")}`,
}));

const ANALOGUE_CHANNELS: Channel[] = Array.from({ length: 20 }, (_, i) => ({
  id: `a${i + 1}`,
  name: `Analogue ${i + 1}`,
  color: `#${(i % 10).toString(16).padStart(6, "0")}`,
}));

function createLoadOptions(list: Channel[]) {
  const pageSize = 5;
  return async (query: string, page: number) => {
    const q = (query || "").trim().toLowerCase();
    const filtered = q
      ? list.filter((c) => c.name.toLowerCase().includes(q))
      : list.slice();

    const start = (page - 1) * pageSize;
    const options = filtered.slice(start, start + pageSize);
    const hasMore = start + pageSize < filtered.length;

    // simulate small network latency
    return new Promise<{ options: Channel[]; hasMore: boolean }>((resolve) =>
      setTimeout(() => resolve({ options, hasMore }), 10),
    );
  };
}

export const digitalLoadOptions = createLoadOptions(DIGITAL_CHANNELS);
export const analogueLoadOptions = createLoadOptions(ANALOGUE_CHANNELS);

export default {
  digitalLoadOptions,
  analogueLoadOptions,
};
