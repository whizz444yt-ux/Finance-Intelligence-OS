# Part 1 — Premium UI and Information Architecture

**Goal:** Create a polished Futures Command Center and consistent navigation/design system without changing the existing static architecture unnecessarily.

## 1. Product experience

Design language: premium institutional research terminal, dark-first, clean typography, restrained color, high information density without clutter. Avoid neon overload, decorative gradients behind every card, oversized empty hero blocks, noisy animations, fake live tickers, fake green/red prices and excessive nested cards.

Required experience:
- Desktop: collapsible left sidebar, compact top bar, central workspace and optional right-side watchlist/context panel.
- Tablet: collapsible navigation and two-column responsive grids.
- Mobile: compact top bar, drawer navigation, stacked content and usable chart/table overflow.
- Light/dark theme if existing preference system supports it; dark is default.
- Keyboard navigation, visible focus, semantic headings, labels, accessible contrast and reduced-motion support.
- Consistent empty/loading/error/stale/unconfigured states.

## 2. Primary information architecture

Use these 13 futures-only areas:

1. Overview.
2. Futures Markets.
3. ICT Academy.
4. Entry Models.
5. Sessions & Calendar.
6. Futures News.
7. Volume & Open Interest.
8. COT & Positioning.
9. Contract Specs & Expiry.
10. Strategy Lab.
11. Risk & Prop Firms.
12. Journal & Watchlists.
13. Data Health & Sources.

The exact page routes can remain compatible with current routes where possible. Suggested route map:

| Area | Preferred route | Existing route compatibility |
|---|---|---|
| Overview | `/` | Replace Global Research homepage output. |
| Futures Markets | `/futures-intelligence/` | Preserve `/markets/` as catalogue/redirect if appropriate. |
| ICT Academy | `/academy/` | Preserve `/ict-futures/academy/` lesson URLs. |
| Entry Models | `/entry-models/` | Retain existing route. |
| Sessions & Calendar | `/sessions/` | Reuse current ICT session tools; add calendar if necessary. |
| Futures News | `/news/` | Futures-only classification. |
| Volume & OI | `/volume-open-interest/` | Preserve current route; label weekly COT-derived OI correctly. |
| COT & Positioning | `/research/positioning/` | Preserve current route. |
| Contract Specs & Expiry | `/contract-specs/` | New view backed by verified contract registry. |
| Strategy Lab | `/strategy-lab/` | Preserve current deterministic backtester. |
| Risk & Prop Firms | `/risk/` | Migrate from `/tools/` without breaking links. |
| Journal & Watchlists | `/account/` | Preserve Supabase workspace and Auth. |
| Data Health & Sources | `/data-health/` | Preserve source registry and provider health. |

If a matching existing route exists under a different source path, prefer it and document a redirect rather than duplicate its page.

## 3. Overview dashboard widgets

- Market watchlist for selected contract/expiry (no fabricated prices).
- Market-data feed status and clear delay/freshness class.
- Session clock with ET and the user's chosen timezone.
- Session high/low and range status only when underlying data is available.
- Upcoming economic releases with timezone and provider/source.
- Futures news headlines filtered by contract/topic.
- COT summary with report date and weekly frequency.
- Quick access to ICT concepts and entry models.
- User's watchlists, journal summary and alert history when authenticated.
- Data Health summary with unavailable providers visible.

Every widget links to its full module. User can hide/reorder personal widgets only after the basic page works and saves settings predictably.

## 4. UI components and contracts

Create reusable components or equivalent source functions:
- `AppShell`, `SidebarNavigation`, `TopBar`, `ContractSelector`.
- `DataStatusBadge`, `LastUpdated`, `SourceAttribution`.
- `MetricCard`, `DataTable`, `EmptyState`, `ErrorState`, `Skeleton`.
- `SessionClock`, `EventTimeline`, `NewsList`, `WatchlistTable`.
- `ChartPanel` wrapper whose source and delay status are always visible.

Do not introduce a component library until the existing implementation has been audited. Prefer a small, consistent design-token layer in the current CSS architecture. Keep CSS scoped and avoid global selectors that break legacy pages still served.

## 5. Design tokens

Define semantic CSS custom properties: background/surface/surface-elevated, border/subtle-border, text/secondary/muted, positive/negative/neutral/warning, focus ring, spacing scale, radius scale, typography scale, table row height and z-index layers. Colors must encode meaning consistently; never encode stale/unavailable as success.

Use tabular numerals for prices, tick values, event times and P&L. Use a compact numeric format but expose full values on hover/details where rounding could mislead.

## 6. State, loading and failure behavior

Each widget has its own data state. One failed endpoint must not blank the entire page. Show:
- Loading: skeleton with module title.
- Fresh: source and data-as-of.
- Delayed: delay label with provider's known delay.
- Historical/weekly: clear frequency label.
- Cached/stale: age and last successful fetch.
- Partial: which source failed.
- Not configured: exact credential/provider requirement, never a fake zero.
- Unavailable: safe retry behavior and last-known snapshot separately.

No automatic repeated fetch loop. Respect Worker cache TTL, backoff and provider rate limits.

## 7. Implementation paths

Primary files to inspect/update:
- `scripts/build_site.py` (shared shell, navigation and route builders).
- `assets/site-shell.css` and related existing styles.
- Page-specific JS/CSS in `assets/` and `data/`.
- `index.html` only if confirmed to be the source rather than generated output.
- `manifest.webmanifest`, `icon.svg`, `sw.js`.
- `scripts/validate.py`, `scripts/audit_internal_links.py`, `tests/test_build.py`.
- README and architecture docs.

Never hand-edit `dist/`. Avoid a wholesale framework migration. Ensure all routes receive the shared shell and their page-specific script is loaded once.

## 8. Performance, responsive and accessibility requirements

- Avoid loading all 76 lessons or all historical observations on the homepage.
- Paginate/filter long contract, resource and news lists.
- Lazy-load charts and below-the-fold modules.
- Cache static content with immutable/versioned asset strategy where safe.
- Do not put large OHLC data into the initial HTML.
- Keep layout stable while widgets load.
- Respect reduced-motion, focus order and screen-reader labels.
- Tables scroll horizontally on narrow screens or reflow to labelled cards without hiding essential columns.

## 9. Acceptance criteria

- [ ] All 13 primary areas have functioning links and unique page purpose.
- [ ] Homepage contains futures-only market/session/news/event/data-health widgets.
- [ ] Desktop, tablet and mobile layouts are usable.
- [ ] No fake live data, fake price movement or fake API success indicators.
- [ ] Shared typography, spacing, buttons, tables, chips and data-state presentation are consistent.
- [ ] Accessible focus, labels, contrast and reduced-motion behavior are verified.
- [ ] Loading/error/stale/empty/not-configured states tested for each data-backed widget.
- [ ] Existing lesson, backtest, account and journal routes still work.
- [ ] Build and link audit pass; manual screenshots are included in the Part report.

## 10. Part-specific execution prompt

> Execute Part 1 only. Inspect the current builder, route structure, CSS, JS and generated site. Implement the futures-only premium app shell and 13-area information architecture. Do not rewrite the site in a new framework. Reuse current futures modules and preserve all existing route compatibility. Build reusable UI primitives and honest data-state rendering. Test responsive layouts and accessibility as well as all routes, build and links. Do not add unverified market prices or start content/data-provider work outside what the UI needs to render correctly.

