# Data Viewer — Implementation Plan

## How to Use This Document

Each stage is an isolated unit of work delivered by an agent. The agent stops at the stage boundary and does not proceed further. A human reviews the acceptance criteria and approves before authorising the next stage.

The GraphQL API is unavailable throughout. All telemetry data is supplied by a `MockTelemetryRepository`. No real HTTP calls are made at any point.

---

## Guiding Principles

### Walking Skeleton

Stage 0 wires every architectural layer (theme → store → API → chart) together as stubs and proves the app renders end-to-end. Every subsequent stage replaces a stub with a real implementation. The app must remain runnable and all tests must pass at the end of every stage — no stage leaves the codebase in a broken state.

### Test-Driven Development

Every file follows the red → green → refactor cycle:

1. Write the failing test that describes the intended behaviour
2. Write the minimum implementation to make it pass
3. Refactor without breaking tests

No implementation file is created before its test file. The TDD order listed in each stage is the sequence in which tests are written, not just the sequence of files to create.

---

## Conventions

### Package Manager

`npm` throughout.

### Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production bundle |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Single Vitest run (CI) |
| `npm run test:coverage` | Coverage report (must be 100%) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `biome check .` |
| `npm run format` | `biome format --write .` |

### Project Structure

```
data_viewer/
├── src/
│   ├── api/
│   │   ├── TelemetryRepository.ts          # interface + types only
│   │   ├── apollo/
│   │   │   ├── client.ts                   # ApolloClient instance
│   │   │   ├── links/
│   │   │   │   ├── retryLink.ts
│   │   │   │   ├── timeoutLink.ts
│   │   │   │   └── errorLink.ts
│   │   │   ├── ApolloTelemetryRepository.ts
│   │   │   └── queries.ts                  # GQL documents
│   │   └── mock/
│   │       ├── MockTelemetryRepository.ts
│   │       └── fixtures.ts                 # hardcoded BucketedRecording[]
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   ├── templates/
│   │   └── pages/
│   ├── hooks/
│   │   ├── useGetGraphData.ts
│   │   ├── useFilters.ts
│   │   └── useIFrameBridge.ts
│   ├── store/
│   │   ├── index.ts                        # createStore + Provider
│   │   ├── slices/
│   │   │   ├── filterSlice.ts
│   │   │   ├── notificationSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── middleware/
│   │       ├── urlSyncMiddleware.ts
│   │       └── persistMiddleware.ts
│   ├── theme/
│   │   ├── AppThemeProvider.tsx
│   │   └── tokens.ts
│   ├── utils/
│   │   ├── getPlotData.ts
│   │   ├── getLayout.ts
│   │   └── normaliseChannel.ts
│   └── types/
│       └── index.ts                        # shared domain types
├── test/                                   # vitest setup files
├── docs/
├── .env.example
├── biome.json
├── tsconfig.json
└── vite.config.ts
```

### Test File Location

Test files live alongside the implementation file they cover:

```
src/api/mock/MockTelemetryRepository.ts
src/api/mock/MockTelemetryRepository.test.ts
```

### Environment Variables

```bash
# .env.example
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_MAX_DATA_POINTS=800000
```

### Coverage Thresholds

Enforced in `vitest.config.ts` from Stage 0 onward:

```ts
coverage: {
    thresholds: { lines: 100, branches: 100, functions: 100 }
},
pool: "threads",
isolate: true,
```

---

## Documentation Requirements

To keep the codebase maintainable and to support automatic API documentation generation, follow these rules:

- **JSDoc for exports**: Every exported function, class, React component, hook and Zustand slice MUST include a JSDoc comment block describing purpose, parameters, and return values where applicable.
- **TDD + docs**: During the red → green → refactor cycle add or update JSDoc as part of the implementation step so documentation stays in sync with behaviour.
- **Generation**: Add `TypeDoc` as a dev dependency and provide a `npm run docs:generate` script (Stage 2/3) to produce HTML API docs from the JSDoc comments.
- **CI enforcement**: Add a CI job that runs `typedoc` (or a custom script) and fails on generation errors; additionally include a lint check (Biome or custom) to flag exported symbols without JSDoc.

These lightweight practices ensure documentation remains part of the development workflow rather than an afterthought.

## Stage 0 — Walking Skeleton

**Goal**: A runnable, testable app where every architectural layer exists as a minimal stub wired together end-to-end. No real logic. Proves the full stack compiles, renders, and can be tested.

### Deliverables

- Vite 6 + React 19 + TypeScript strict project scaffolded with `npm create vite`
- `tsconfig.json` with `"strict": true`
- `biome.json` configured (no implicit any, no unused imports, consistent import order, no console.log)
- Vitest with `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
- Coverage thresholds set to 100% in `vitest.config.ts`
- `.env.example` with `VITE_MAX_DATA_POINTS=800000`
- `AppThemeProvider` wrapping the app (MUI 9, `ThemeProvider` + `CssBaseline`)
- `tokens.ts` exporting a minimal `appTheme` object with `primary.main` and `background.default`
- Three Zustand slice files each exporting only the initial state shape (no actions yet)
- `PageLayout` template rendering four landmark regions: `<header>`, `<aside>` (20%), `<main>` (80%), `<footer>`
- `NotificationSnackbar` stub: renders MUI `Snackbar` open/closed from `notificationSlice.open`
- `Plot` atom stub: renders `<div data-testid="plot" />`
- `fixtures.ts` exporting `MOCK_RECORDINGS`: five hardcoded `BucketedRecording` items for channel `"1"`
- `MockTelemetryRepository` implementing the `TelemetryRepository` interface, returning `MOCK_RECORDINGS`
- `useGetGraphData` stub hook: calls `MockTelemetryRepository.getTimeseries()` and writes result to a local state variable (store integration in Stage 1)
- `PlotContainer` molecule stub: calls `useGetGraphData`, renders `<Plot data-testid="plot" />`
- `DataViewerPage` page: renders `AppThemeProvider` → `PageLayout` → `PlotContainer`
- `main.tsx` mounting `DataViewerPage`

### TDD Order

> Write each test, watch it fail, implement, watch it pass, then move to the next.

1. `AppThemeProvider.test.tsx` — **Completed** — renders children without throwing; children can read theme via `useTheme`
2. `store/slices/filterSlice.test.ts` — initial state has the expected shape (`equipmentId: null`, `digitalChannels: []`, `analogueChannels: []`, `dateRange: null`, `sampleRate: 1`, `channelColours: {}`)
3. `store/slices/notificationSlice.test.ts` — initial state `{ message: "", severity: "info", open: false }`
4. `store/slices/uiSlice.test.ts` — initial state `{ favourites: [], isSidebarOpen: true }`
5. `components/templates/PageLayout.test.tsx` — renders a `<header>`, `<aside>`, `<main>`, and `<footer>`
6. `components/organisms/NotificationSnackbar.test.tsx` — renders MUI Snackbar closed when `open: false`; renders open when `open: true`
7. `api/mock/MockTelemetryRepository.test.ts` — `getTimeseries()` returns `MOCK_RECORDINGS`; the returned array is non-empty
8. `hooks/useGetGraphData.test.ts` — calling the hook returns `{ data: MOCK_RECORDINGS, loading: false, error: null }`
9. `components/molecules/PlotContainer.test.tsx` — renders `<div data-testid="plot" />` when data is available
10. `components/pages/DataViewerPage.test.tsx` — mounts without throwing; contains `data-testid="plot"`

### Acceptance Criteria

- [ ] `npm run dev` serves the app without errors; the page renders four visible regions and a plot stub
- [ ] `npm run test:coverage` exits 0; coverage report shows 100% on all created files
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0

---

## Stage 1 — Zustand Store & Middleware

**Goal**: Replace the empty slice stubs with fully implemented slices, actions, and selectors. Implement URL sync and localStorage persist middleware.

**Dependencies**: Stage 0 complete and approved.

### Deliverables

- `filterSlice` actions: `setEquipment`, `addDigitalChannel`, `removeDigitalChannel`, `addAnalogueChannel`, `removeAnalogueChannel`, `setDateRange`, `setSampleRate`, `setChannelColour`, `resetFilters`
- `notificationSlice` actions: `showNotification({ message, severity })`, `dismissNotification`
    - `uiSlice` actions: `toggleSidebar`
- `useFilters` hook: typed selector/dispatch wrapper over `filterSlice`
- `urlSyncMiddleware` — on every `filterSlice` change, serialises state to `URLSearchParams` via `window.history.replaceState`; on store init, reads current URL and hydrates `filterSlice`
 - `persistMiddleware` — persists permitted UI state to localStorage if required
- `usePersistentState` hook: reads current `filterSlice` from store and returns a URL-safe string; accepts a URL string and dispatches hydration

### TDD Order

1. `filterSlice.test.ts` — `setEquipment` sets `equipmentId`
2. `filterSlice.test.ts` — `addDigitalChannel` appends to `digitalChannels`; adding the same channel twice is idempotent
3. `filterSlice.test.ts` — `removeDigitalChannel` removes by channel ID
4. `filterSlice.test.ts` — same tests for `addAnalogueChannel` / `removeAnalogueChannel`
5. `filterSlice.test.ts` — `setDateRange` sets both `from` and `to`
6. `filterSlice.test.ts` — `setSampleRate` sets `sampleRate`
7. `filterSlice.test.ts` — `setChannelColour` sets `channelColours[channelId]`
8. `filterSlice.test.ts` — `resetFilters` returns state to initial
9. `notificationSlice.test.ts` — `showNotification` sets `message`, `severity`, `open: true`
10. `notificationSlice.test.ts` — `dismissNotification` sets `open: false`
11. `uiSlice.test.ts` — `toggleSidebar` flips `isSidebarOpen`
13. `hooks/useFilters.test.ts` — hook exposes slice state and actions with correct types
14. `store/middleware/urlSyncMiddleware.test.ts` — after `setEquipment(5)`, `window.location.search` contains `equipmentId=5`
15. `store/middleware/urlSyncMiddleware.test.ts` — initialising the store with `?equipmentId=5` in the URL sets `filterSlice.equipmentId` to `5`
16. `store/middleware/urlSyncMiddleware.test.ts` — full round-trip: serialise → parse → all fields match original
17. `store/middleware/persistMiddleware.test.ts` — ensure that favourites are serialisable via `urlSyncMiddleware` (bookmarks), and that no localStorage round-trip for favourites exists
19. `hooks/usePersistentState.test.ts` — returns a URL string containing current filter state

### Acceptance Criteria

- [ ] All slice actions are tested with at least one positive and one boundary case each
- [ ] URL round-trip test passes for all `filterSlice` fields
    - [ ] URL round-trip test for filter state passes
- [ ] `npm run test:coverage` exits 0 at 100%
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0

---

## Stage 2 — API Layer (Mocked)

**Goal**: Implement the full `TelemetryRepository` interface, the `ApolloTelemetryRepository`, and the complete Apollo link chain. Implement `useGetGraphData` with the `MAX_DATA_POINTS` guard. No real HTTP calls are made — the Apollo implementation is tested against `MockedProvider`.

**Dependencies**: Stage 1 complete and approved.

### Deliverables

- `TelemetryRepository.ts` — `TimeseriesQueryParams`, `BucketedRecording`, `TelemetryRepository` interface
 - `TelemetryRepository.ts` — `TimeseriesQueryParams`, `BucketedRecording`, `TelemetryRepository` interface
 - `TelemetryRepository.getFilterOptions()` — new repository method (or adapter) to fetch the equipment catalogue and channel lists used to populate the filter panel on application load
- `api/apollo/queries.ts` — `GET_BUCKETED_TELEMETRY` GQL document
- `api/apollo/links/retryLink.ts` — `RetryLink` max 3 attempts, exponential backoff `2ⁿ × 100 ms + jitter`
- `api/apollo/links/timeoutLink.ts` — `ApolloLink` that sets an `AbortController` per operation and rejects after `VITE_QUERY_TIMEOUT_MS` (default 30 000)
- `api/apollo/links/errorLink.ts` — `onError` link writing to `notificationSlice` on network and GraphQL errors
- `api/apollo/client.ts` — `ApolloClient` instance composed `RetryLink → TimeoutLink → ErrorLink → HttpLink`; `HttpLink` receives the `AbortController` signal
- `api/apollo/ApolloTelemetryRepository.ts` — `TelemetryRepository` implementation using the Apollo client
- `utils/normaliseChannel.ts` — `normaliseChannel(item)` returns `item.channel ?? item.chanel ?? "unknown"`
- `MockTelemetryRepository` — expanded from Stage 0 with `simulateError`, `simulateTimeout`, `simulateSlowResponse` control flags for testing
- `hooks/useGetGraphData.ts` — fully implemented: reads `filterSlice`, calls repository, enforces `MAX_DATA_POINTS` pre-flight and post-response, cancels previous request on re-invocation, writes data to store
- `VITE_MAX_DATA_POINTS` read via `import.meta.env`, defaulting to `800000`

### Contract Test Suite

Both `MockTelemetryRepository` and `ApolloTelemetryRepository` must pass the same shared contract test file at `src/api/__tests__/TelemetryRepository.contract.test.ts`. The contract suite is written once and run against each concrete class.

### TDD Order

1. `TelemetryRepository.contract.test.ts` — `getTimeseries()` returns an array; each item has `channel`, `value`, `timestamp`; run against `MockTelemetryRepository` first (makes it pass immediately), then wire `ApolloTelemetryRepository` later in this stage
1.a `TelemetryRepository.getFilterOptions.test.ts` — `getFilterOptions()` returns equipment list and channel catalog (`equipments: [{id,name}]`, `digitalChannels: string[]`, `analogueChannels: string[]`)
2. `utils/normaliseChannel.test.ts` — `channel` field present → returns it; only `chanel` present → returns it; neither → returns `"unknown"`
3. `api/apollo/links/retryLink.test.ts` — retries up to 3 times on network error; does not retry on 4xx; delay between attempt 1→2 < delay between attempt 2→3 (backoff)
4. `api/apollo/links/timeoutLink.test.ts` — operation completing within timeout resolves; operation exceeding timeout rejects with `TimeoutError`
5. `api/apollo/links/errorLink.test.ts` — network error dispatches `showNotification` to store; GraphQL error in `errors[]` dispatches `showNotification`
6. `api/apollo/links/errorLink.test.ts` — notification `severity` is `"error"` for all error types
7. `api/apollo/client.test.ts` — `ApolloClient` is configured with `InMemoryCache`; link chain contains all four links in order
8. `api/apollo/ApolloTelemetryRepository.test.ts` — run `TelemetryRepository.contract.test.ts` against `ApolloTelemetryRepository` using `MockedProvider`
9. `api/apollo/ApolloTelemetryRepository.test.ts` — passing variables `{ equipmentId: 5, channels: ["1"], bucketSize: 10 }` sends the correct GQL variables to the mock
10. `hooks/useGetGraphData.test.ts` — when `estimatedPoints > MAX_DATA_POINTS`, the repository is not called and `showNotification` is dispatched
11. `hooks/useGetGraphData.test.ts` — when the response contains more than `MAX_DATA_POINTS` records, data is discarded and `showNotification` is dispatched
12. `hooks/useGetGraphData.test.ts` — calling the hook a second time before the first resolves cancels the first request (verified by `MockTelemetryRepository.callCount`)
13. `hooks/useGetGraphData.test.ts` — on successful response within the limit, `filterSlice` (or local state) is updated with the recordings
14. `hooks/useGetGraphData.test.ts` — when `MockTelemetryRepository.simulateError = true`, hook sets `error` and dispatches a notification

### Acceptance Criteria

- [ ] `TelemetryRepository.contract.test.ts` passes for both `MockTelemetryRepository` and `ApolloTelemetryRepository`
- [ ] Each link (`retryLink`, `timeoutLink`, `errorLink`) has isolated unit tests
- [ ] MAX_DATA_POINTS guard tested for pre-flight block, post-response discard, and env default fallback
- [ ] Cancellation test verifies the previous request is aborted, not merely superseded
- [ ] `npm run test:coverage` exits 0 at 100%
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0

---

## Stage 3 — Filter Panel Atoms & Molecules

**Goal**: Build and fully test every atom and molecule in the filter panel. Components are driven by props and callbacks — no store integration yet. All validation rules are enforced at the molecule level.

**Dependencies**: Stage 1 (store types for `FilterSlice`), Stage 2 (data types).

### Deliverables

**Atoms** (each wraps its MUI base with typed props and a `data-testid`):

- `SelectField` — labelled `Select`
- `Checkbox` — labelled `Checkbox` with `disabled` support
- `ColorSwatch` — `Box` with `backgroundColor: color` inline style
- `DatePicker` — MUI `DatePicker` emitting ISO date strings
- `Slider` — MUI `Slider` with `marks` prop

**Molecules**:

- `EquipmentSelect` — wraps `SelectField`; `required` indicator when value is `null`; passes selected equipment ID to `onChange`
 - `EquipmentSelect` — wraps `SelectField`; `required` indicator when value is `null`; passes selected equipment ID to `onChange`. In the integrated app this component receives its options from the `useLoadOptions` hook (or props wired by `FilterPanel`).
- `ChannelSelect` — receives `channels: Channel[]`, `selected: string[]`, `onToggle`, `colours: Record<string, string>`, `disabled: boolean`; renders one `Checkbox` + `ColorSwatch` row per channel; `disabled` prop disables all checkboxes; individual checkbox disabled when channel not in `selected` AND combined selected count is already 8
- `DateRangePicker` — two `DatePicker` atoms; validates `from ≤ to`; emits `onError` when invalid
- `SampleRateSlider` — `Slider` with `marks={[1,2,5,10,15,30].map(v => ({ value: v, label: String(v) }))}`; `step={null}` to snap to marks only
- `useLoadOptions` hook — fetches the equipment list and channel catalog from `TelemetryRepository.getFilterOptions()` on application start and returns `{ loading, error, options, retry }`. `FilterPanel` will call this hook on mount and propagate options into `EquipmentSelect` and `ChannelSelect`.

### Validation Rules (tested at molecule level)

| Rule | Where enforced |
|---|---|
| Equipment required | `EquipmentSelect` — `required` visual indicator |
| Min 1 channel | `ChannelSelect` — last selected checkbox is not rendered as disabled when it is the only selection |
| Max 8 combined | `ChannelSelect` — checkboxes for unselected channels become disabled when `selected.length === 8` |
| Date range ordering | `DateRangePicker` — calls `onError("from must be before to")` when `from > to` |
| Sample rate marks only | `SampleRateSlider` — `step={null}` |

### TDD Order

*Atoms*

1. `SelectField.test.tsx` — renders `<label>` with correct text; renders passed options; calls `onChange` with the selected value
2. `Checkbox.test.tsx` — renders checked when `checked=true`; calls `onChange` on click; does not call `onChange` when `disabled=true`
3. `ColorSwatch.test.tsx` — container has `backgroundColor` matching the passed `color` hex string
4. `DatePicker.test.tsx` — renders an input; calls `onChange` with an ISO string when a date is typed
5. `Slider.test.tsx` — renders with `aria-valuenow` equal to initial `value`; calls `onChange` with the new value on change

*Molecules*

6. `EquipmentSelect.test.tsx` — renders a `required` indicator (`*` or `aria-required`) when `value` is `null`; calls `onChange` with equipment ID when option selected; no indicator when a value is present
7. `ChannelSelect.test.tsx` (digital group) — renders one row per channel; each row has a `Checkbox` and `ColorSwatch`; clicking an unchecked checkbox calls `onToggle(channelId)`
8. `ChannelSelect.test.tsx` — when `selected.length === 8`, all unselected checkboxes have `disabled=true`
9. `ChannelSelect.test.tsx` — when a channel is the only selected one, its checkbox is not disabled (min-1 rule)
10. `ChannelSelect.test.tsx` (analogue group) — same three tests as digital, with `type="analogue"` prop
11. `DateRangePicker.test.tsx` — renders two date inputs labelled "From" and "To"; when `from < to`, `onError` is not called; when `from > to`, `onError` is called with an error message
12. `SampleRateSlider.test.tsx` — slider marks equal `[1, 2, 5, 10, 15, 30]`; `step` prop is `null`; `onChange` is called with a mark value when the thumb is moved
13. `useLoadOptions.test.ts` — when `getFilterOptions` resolves, options are returned; when it rejects, `error` is set and `retry` triggers another call

### Acceptance Criteria

- [ ] All validation boundary cases have explicit tests (cap at exactly 8, cap at exactly 0, `from === to`, `from > to`)
- [ ] All atoms pass an `aria-label` or `aria-labelledby` accessibility assertion
- [ ] Components render in isolation without a Zustand `Provider` (pure prop-driven)
- [ ] `npm run test:coverage` exits 0 at 100%
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0

---

## Stage 4 — Plot Pipeline & Graph Canvas

**Goal**: Implement `getPlotData`, `getLayout`, the real `Plot` atom, `PlotContainer`, and `GraphCanvas`. Wire the pipeline from mock recordings to a rendered Plotly chart.

**Dependencies**: Stages 1–3 complete and approved.

### Deliverables

- `utils/getPlotData.ts` — `getPlotData(recordings: BucketedRecording[], colours: Record<string, string>): Plotly.Data[]`
- `utils/getLayout.ts` — `getLayout(state: FilterSlice): Partial<Plotly.Layout>`
- `Plot` atom (replaces Stage 0 stub) — thin wrapper around `react-plotly.js` `<Plotly>` component with `data`, `layout`, `config`, `style` props; `data-testid="plot-canvas"`
- `PlotContainer` molecule (replaces Stage 0 stub) — calls `useGetGraphData`, passes results through `getPlotData` / `getLayout`, renders `<Plot />`; shows `CircularProgress` when `loading`; shows a "Select channels to view data" placeholder when no channels are selected
- `GraphCanvas` organism — renders `PlotContainer` inside an 80%-width flex container; `data-testid="graph-canvas"`

### TDD Order

1. `utils/getPlotData.test.ts` — returns one `Plotly.Data` trace per unique channel in recordings
2. `utils/getPlotData.test.ts` — each trace's `marker.color` equals the colour for that channel from the colours map
3. `utils/getPlotData.test.ts` — `x` array of each trace equals timestamps for that channel; `y` array equals values
4. `utils/getPlotData.test.ts` — returns `[]` for an empty recordings array
5. `utils/getPlotData.test.ts` — channels absent from the colours map receive a fallback colour (e.g. `"#cccccc"`)
6. `utils/getLayout.test.ts` — `xaxis.title.text` is `"Timestamp"`; `yaxis.title.text` is `"Value"`
7. `utils/getLayout.test.ts` — when `filterSlice.dateRange` is set, `xaxis.range` equals `[from, to]`
8. `utils/getLayout.test.ts` — when `filterSlice.dateRange` is `null`, `xaxis.range` is `undefined`
9. `components/atoms/Plot.test.tsx` — renders `data-testid="plot-canvas"`; passes `data` and `layout` props to the underlying `react-plotly.js` component (mock `react-plotly.js` using `vi.mock`)
10. `components/molecules/PlotContainer.test.tsx` — renders `CircularProgress` when `loading` state is true
11. `components/molecules/PlotContainer.test.tsx` — renders placeholder text when `digitalChannels` and `analogueChannels` are both empty
12. `components/molecules/PlotContainer.test.tsx` — renders `data-testid="plot-canvas"` when data is present
13. `components/molecules/PlotContainer.test.tsx` — trace count in `data` prop matches the number of unique channels in mock recordings
14. `components/organisms/GraphCanvas.test.tsx` — renders `data-testid="graph-canvas"` containing `PlotContainer`

### Acceptance Criteria

- [ ] `npm run dev`: chart renders with the 5 mock recordings from `fixtures.ts` as a single trace for channel `"1"`
- [ ] Loading spinner is visible while `MockTelemetryRepository` is in a slow-response state
- [ ] Placeholder message is visible when all channels are deselected
- [ ] `npm run test:coverage` exits 0 at 100%
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0

---

## Stage 5 — Organisms, Layout Integration & Filter-to-Chart Pipeline

**Goal**: Wire all molecules into organisms connected to the Zustand store. The interactive filter → mock API → chart pipeline must work end-to-end in the browser.

**Dependencies**: Stages 1–4 complete and approved.

### Deliverables

- `FilterPanel` organism — reads `filterSlice` via `useFilters`; renders `EquipmentSelect`, `ChannelSelect` (digital), `ChannelSelect` (analogue), `DateRangePicker`, `SampleRateSlider`; dispatches store actions on change
 - `FilterPanel` organism — reads `filterSlice` via `useFilters`; renders `EquipmentSelect`, `ChannelSelect` (digital), `ChannelSelect` (analogue), `DateRangePicker`, `SampleRateSlider`; dispatches store actions on change. It must also call `useLoadOptions` on mount to populate `EquipmentSelect` and `ChannelSelect` options.
 - `Plot` action/button — `FilterPanel` exposes a `Plot` (or `Go`) button. The button is disabled until required fields are satisfied (single equipment, ≥1 and ≤8 combined channels, date range, sample rate — default 1 Hz). Pressing `Plot` invokes `useGetGraphData` (or a `plot()` method) which uses the Apollo cancel/AbortController link to cancel any in-flight query before starting the new one; the UI shows a loading state while the query runs.
- `AppHeader` organism — renders app title; contains a "Favourites" icon button (wired in Stage 6); `data-testid="app-header"`
- `AppFooter` organism — renders static footer text; `data-testid="app-footer"`
- `NotificationSnackbar` organism (replaces Stage 0 stub) — reads `notificationSlice`; `anchorOrigin={{ vertical: "bottom", horizontal: "right" }}`; auto-hides after 6 000 ms; close button dispatches `dismissNotification`
- `PageLayout` template (replaces Stage 0 stub) — `<header>` 100% width, `<aside>` 20% / `<main>` 80% flex row, `<footer>` 100% width; `<NotificationSnackbar>` rendered outside the flex row
- `DataViewerPage` (replaces Stage 0 stub) — composes `AppThemeProvider`, Zustand `Provider`, `PageLayout` with all organisms

### TDD Order

1. `organisms/FilterPanel.test.tsx` — renders all four filter molecule regions
2. `organisms/FilterPanel.test.tsx` — selecting an equipment option dispatches `setEquipment` to the store
3. `organisms/FilterPanel.test.tsx` — toggling a digital channel dispatches `addDigitalChannel` or `removeDigitalChannel`
4. `organisms/FilterPanel.test.tsx` — toggling an analogue channel dispatches the analogue equivalents
5. `organisms/FilterPanel.test.tsx` — changing the date range dispatches `setDateRange`; when `from > to`, dispatches `showNotification` instead
6. `organisms/FilterPanel.test.tsx` — changing the sample rate dispatches `setSampleRate`
7. `organisms/FilterPanel.test.tsx` — when combined `digitalChannels + analogueChannels` length equals 8, all unselected channel checkboxes are disabled
7.a `organisms/FilterPanel.plot.test.tsx` — `Plot` button is disabled until required fields are present; when pressed it calls the plotting hook; pressing again cancels the prior request (verified by `MockTelemetryRepository.callCount`) and starts a new one; spinner shown when plotting
8. `organisms/AppHeader.test.tsx` — renders `data-testid="app-header"` with the app title text
9. `organisms/AppFooter.test.tsx` — renders `data-testid="app-footer"`
10. `organisms/NotificationSnackbar.test.tsx` — renders closed when `open: false`; renders open with correct message when `showNotification` is dispatched
11. `organisms/NotificationSnackbar.test.tsx` — clicking the close button dispatches `dismissNotification`
12. `organisms/NotificationSnackbar.test.tsx` — `anchorOrigin` is `{ vertical: "bottom", horizontal: "right" }`
13. `templates/PageLayout.test.tsx` — `aside` width is 20%; `main` width is 80% (computed style or className assertion)
14. `templates/PageLayout.test.tsx` — `NotificationSnackbar` is rendered outside the aside/main flex row

### Integration Test

15. `pages/DataViewerPage.integration.test.tsx` — mount `DataViewerPage`; simulate selecting equipment; simulate toggling one digital channel; assert `data-testid="plot-canvas"` renders with one trace

### Acceptance Criteria

- [ ] In the browser: selecting equipment and one channel triggers a mock query and renders a chart
- [ ] Changing sample rate triggers a new mock query (observable via `MockTelemetryRepository.callCount`)
- [ ] Snackbar appears and auto-dismisses correctly
- [ ] MAX_DATA_POINTS breach triggers a Snackbar warning and no chart render
- [ ] `npm run test:coverage` exits 0 at 100%
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0

---

## Stage 6 — URL Sharing & iFrame Bridge

**Goal**: Implement and test the cross-cutting features: shareable URLs and the `postMessage` iFrame bridge. Favourites/bookmarks are handled by the user's browser via the URL.

**Dependencies**: Stage 5 complete and approved.

### Deliverables

- `usePersistentState` fully connected to the URL sync middleware (Stage 1 wired the middleware; this stage connects UI to it)
- `hooks/useIFrameBridge.ts` — registers a `window` `"message"` event listener; handles `SET_FILTERS` by validating payload shape then dispatching `filterSlice` actions; sends `postMessage({ type: "FILTERS_APPLIED" })` to `event.source`; cleans up listener on unmount; ignores messages with unknown `type`; ignores messages with invalid `payload`
- `DataViewerPage` updated — mounts `useIFrameBridge`

### TDD Order

1. `hooks/useIFrameBridge.test.ts` — dispatching a `MessageEvent` of `{ type: "SET_FILTERS", payload: validSnapshot }` updates `filterSlice`
2. `hooks/useIFrameBridge.test.ts` — after dispatch, `postMessage` is called on `event.source` with `{ type: "FILTERS_APPLIED" }`
3. `hooks/useIFrameBridge.test.ts` — `MessageEvent` with `type: "UNKNOWN"` does not update the store
4. `hooks/useIFrameBridge.test.ts` — `MessageEvent` with a malformed `payload` (missing required fields) does not update the store and does not throw
5. `hooks/useIFrameBridge.test.ts` — unmounting the hook removes the event listener (assert `window.removeEventListener` was called)

*URL round-trip (integration)*

6. `store/middleware/urlSyncMiddleware.test.ts` — full round-trip: set complex filter state → read `window.location.search` → create new store, pass search string → resulting state equals original (all fields)
7. `store/middleware/persistMiddleware.test.ts` — ensure no localStorage round-trip for favourites exists; instead, URL round-trip restores the same configuration when opened in a new tab

### Acceptance Criteria

- [ ] Copying the URL from the browser and opening it in a new tab restores the exact plot configuration
- [ ] Copying or bookmarking the URL and opening it in a new tab restores the same chart configuration
- [ ] iFrame bridge test passes using a `MessageEvent` mock; `postMessage` acknowledgement is verified
- [ ] `npm run test:coverage` exits 0 at 100%
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0

---

## Stage 7 — Quality Hardening & Prototype Sign-Off

**Goal**: Enforce all quality gates, add end-to-end integration tests for the critical error paths, and produce the final prototype sign-off checklist.

**Dependencies**: Stage 6 complete and approved.

### Deliverables

- `vitest.config.ts` coverage thresholds enforced (100% lines/branches/functions) — any existing missed branch identified and covered
- graphql-codegen wired; generated types in `src/types/generated.ts` verified to match `TelemetryRepository` interface shapes
- End-to-end integration test suite at `src/__tests__/e2e/`

### Integration Test Suite

| Test | Scenario |
|---|---|
| `happyPath.test.tsx` | Select equipment + 2 channels + date range + sample rate → chart renders 2 traces |
| `errorPath.test.tsx` | `MockTelemetryRepository.simulateError = true` → Snackbar appears with error message |
| `dataPointLimit.test.tsx` | Filter combination that would produce > `MAX_DATA_POINTS` → query blocked + Snackbar warning |
| `retryExhausted.test.tsx` | `simulateError = true` with retry limit reached → Snackbar "max retries" message |
| `timeout.test.tsx` | `simulateTimeout = true` → Snackbar timeout message |
| `urlRoundTrip.test.tsx` | Full filter state → URL string → new store → same chart renders |
| `favouriteRoundTrip.test.tsx` | Save favourite → reset filters → restore favourite → same chart renders |

### TDD Order

1. `e2e/happyPath.test.tsx`
2. `e2e/errorPath.test.tsx`
3. `e2e/dataPointLimit.test.tsx`
4. `e2e/retryExhausted.test.tsx`
5. `e2e/timeout.test.tsx`
6. `e2e/urlRoundTrip.test.tsx`
7. `e2e/favouriteRoundTrip.test.tsx`
8. Audit coverage report; identify any uncovered branches; write targeted tests
9. Wire graphql-codegen; verify generated types compile against `TelemetryRepository` interface
10. Confirm `npm run build` produces a clean production bundle

### Sign-Off Checklist

- [ ] `npm run test:coverage` — exits 0; report shows 100% lines, branches, functions
- [ ] `npm run typecheck` — exits 0
- [ ] `npm run lint` — exits 0
- [ ] `npm run build` — exits 0; dist bundle produced
- [ ] Architecture Gate — Level 1 data flow diagram matches actual code structure
- [ ] Behaviour Gate — all filter constraint acceptance tests pass (channel cap, required equipment, date ordering, sample rate marks)
- [ ] Quality Gate — all CI commands above pass in a clean environment
- [ ] Embed Gate — iFrame bridge integration test passes; `postMessage` handshake verified
- [ ] Prototype visual review — browser walkthrough confirms: chart renders with mock data, Snackbar triggers on all error paths, URL sharing restores state, favourites persist across reload, iFrame bridge updates chart from parent message
- [ ] Baseline metrics captured from the current production system for cost-benefit comparison (plot load success rate, median render latency, defect count)
