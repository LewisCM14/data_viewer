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
}
