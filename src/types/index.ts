/**
 * Shared domain types for the Data Viewer app
 */

export type DateRange = { from: string; to: string } | null;

export type FilterSnapshot = {
  equipmentId?: number | null;
  digitalChannels?: string[];
  analogueChannels?: string[];
  dateRange?: DateRange;
  sampleRate?: number;
  channelColours?: Record<string, string>;
};

export interface Channel {
  id: string;
  name: string;
  color: string;
}

export interface FilterOptions {
  equipments: { id: string; name: string }[];
  digitalChannels: Channel[];
  analogueChannels: Channel[];
}

/**
 * Serialises a FilterSnapshot to a query-string (without the leading `?`).
 */

export function serializeFiltersToQuery(snapshot: FilterSnapshot): string {
  const params = new URLSearchParams();
  if (snapshot.equipmentId != null)
    params.set("equipmentId", String(snapshot.equipmentId));
  if (snapshot.digitalChannels?.length)
    params.set("digital", snapshot.digitalChannels.join(","));
  if (snapshot.analogueChannels?.length)
    params.set("analogue", snapshot.analogueChannels.join(","));
  if (snapshot.dateRange) {
    if (snapshot.dateRange.from) params.set("from", snapshot.dateRange.from);
    if (snapshot.dateRange.to) params.set("to", snapshot.dateRange.to);
  }
  if (snapshot.sampleRate != null)
    params.set("sampleRate", String(snapshot.sampleRate));
  if (snapshot.channelColours && Object.keys(snapshot.channelColours).length)
    params.set(
      "colours",
      encodeURIComponent(JSON.stringify(snapshot.channelColours)),
    );

  return params.toString();
}

/**
 * Parses a query string or URLSearchParams into a FilterSnapshot.
 */

export function parseFiltersFromQuery(
  q: string | URLSearchParams,
): FilterSnapshot {
  const params =
    typeof q === "string" ? new URLSearchParams(q.replaceAll(/^\?/g, "")) : q;
  const equipmentId = params.get("equipmentId");
  const digital = params.get("digital");
  const analogue = params.get("analogue");
  const from = params.get("from");
  const to = params.get("to");
  const sampleRate = params.get("sampleRate");
  const colours = params.get("colours");

  let channelColours: Record<string, string> | undefined;
  if (colours) {
    try {
      channelColours = JSON.parse(decodeURIComponent(colours));
    } catch (error) {
      console.warn("Invalid colours parameter in query string:", error);
    }
  }

  let equipmentIdValue: number | null | undefined;
  if (equipmentId == null) {
    equipmentIdValue = undefined;
  } else if (equipmentId === "null") {
    equipmentIdValue = null;
  } else {
    equipmentIdValue = Number(equipmentId);
  }

  return {
    equipmentId: equipmentIdValue,
    digitalChannels: digital ? digital.split(",").filter(Boolean) : undefined,
    analogueChannels: analogue
      ? analogue.split(",").filter(Boolean)
      : undefined,
    dateRange: from || to ? { from: from ?? "", to: to ?? "" } : null,
    sampleRate: sampleRate ? Number(sampleRate) : undefined,
    channelColours,
  };
}

export default {};
/**
 * Shared domain types for the Data Viewer application.
 */

export interface TimeseriesQueryParams {
  equipmentId?: string | number | null;
  channels?: string[];
  bucketSize?: number;
  from?: string | null;
  to?: string | null;
  signal?: AbortSignal;
}

export interface BucketSeries {
  channel: string;
  values: number[];
  timestamps: number[];
}

export interface BucketedRecording {
  id: string;
  name: string;
  series: BucketSeries[];
}

export interface TelemetryRepository {
  getTimeseries(params?: TimeseriesQueryParams): Promise<BucketedRecording[]>;
  getFilterOptions?: () => Promise<FilterOptions>;
}
