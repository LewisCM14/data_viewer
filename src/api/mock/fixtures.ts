/**
 * MOCK_RECORDINGS
 *
 * A small set of hard-coded bucketed recordings used by the
 * `MockTelemetryRepository` during tests and in the walking skeleton.
 * Each recording contains an `id`, a `name` and a `series` array with
 * `channel`, `values` and `timestamps` fields.
 */
export const MOCK_RECORDINGS = [
  {
    id: "rec1",
    name: "Recording 1",
    series: [{ channel: "1", values: [1, 2], timestamps: [0, 1] }],
  },
  {
    id: "rec2",
    name: "Recording 2",
    series: [{ channel: "1", values: [3, 4], timestamps: [2, 3] }],
  },
  {
    id: "rec3",
    name: "Recording 3",
    series: [{ channel: "1", values: [5, 6], timestamps: [4, 5] }],
  },
  {
    id: "rec4",
    name: "Recording 4",
    series: [{ channel: "1", values: [7, 8], timestamps: [6, 7] }],
  },
  {
    id: "rec5",
    name: "Recording 5",
    series: [{ channel: "1", values: [9, 10], timestamps: [8, 9] }],
  },
];
