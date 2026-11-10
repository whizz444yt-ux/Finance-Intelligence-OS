# Part 3 — Futures Contract Intelligence

**Goal:** Make every supported futures contract an accurate, expiry-aware, source-traceable instrument profile and enable safe cross-contract comparison.

## 1. Instrument universe

Use the PDF's 15 families; distinguish family count from individual full-size/micro symbols.

| Tier | Family | Primary symbol examples | Compare/context |
|---|---|---|---|
| T1 | Nasdaq index | NQ / MNQ | ES, YM |
| T1 | S&P 500 index | ES / MES | NQ, YM |
| T1 | Gold | GC / MGC | SI, DX, rates |
| T1 | Euro FX | 6E / M6E | 6B, DX |
| T1 | British Pound | 6B / M6B | 6E, DX |
| T2 | Dow index | YM / MYM | NQ, ES |
| T2 | Russell 2000 | RTY / M2K | ES, rates |
| T2 | US Dollar Index | DX | 6E, 6B, metals |
| T2 | 10-Year Treasury Note | ZN | rates, DX |
| T3 | WTI Crude Oil | CL / MCL | 6C, EIA |
| T3 | Japanese Yen | 6J | DX, rates |
| T3 | Australian Dollar | 6A | China/macro context |
| T3 | Canadian Dollar | 6C | CL, Canada data |
| T3 | Silver | SI / SIL | GC |
| T3 | CME Bitcoin | BTC / MBT | NQ, ETF/crypto context |

The PDF uses a 15-family matrix. Verify the exact exchange product code, active listing, micro status and current contract month with CME/ICE before publication. Do not silently assume a symbol's micro product is currently listed or liquid.

## 2. Per-contract profile information architecture

Each profile has dedicated tabs/sections:

1. Overview: instrument purpose, exchange, tier label and contract family.
2. Contract specification: contract unit/multiplier, quote convention, tick size, tick value, point value, minimum fluctuation and settlement type.
3. Tradable symbols: root, full-size, micro, spread/continuous chart aliases and exchange market-data identifiers.
4. Hours: regular trading schedule, session breaks, holidays and emergency notices, all exchange-local plus ET/IST display conversions.
5. Expiry: listed contract months, last trade date, first notice date where relevant, final settlement date, cash/physical settlement, delivery/position limits and roll methodology.
6. Liquidity: volume/OI by expiry, spread/market depth only when an authorized feed provides it.
7. ICT workflow: bias timeframes, setup timeframes, execution timeframes, session windows and named models with evidence label.
8. Key references: PDH/PDL, PWH/PWL, session extremes, open anchors, HTF arrays only when computed from identified data.
9. Related markets/SMT: allowed pair, same-expiry check, comparable swing-time rule, inverse relationship where applicable and event divergence warning.
10. News/events: contract-specific macro, inventory, central-bank and exchange event tags.
11. Risk: tick-value calculator, micros, example stop-size scenarios, not broker margin unless sourced live.
12. Data health: provider, entitlement, delay, last update, historical depth, license restrictions and missing fields.
13. Research/evidence: model evidence, source links and last verification date.

## 3. Canonical contract registry

Create a single normalized dataset in the existing data layer; use a JSON/CSV source for static verified exchange metadata and Supabase only if the current schema needs dynamic observations. Do not duplicate specs in 15 independent HTML files.

Suggested schema:
```json
{
 "instrument_id":"cme:nq",
 "family_id":"nasdaq-100",
 "exchange":"CME",
 "product_name":"E-mini Nasdaq-100",
 "root_symbol":"NQ",
 "micro_symbol":"MNQ",
 "tier":"T1",
 "contract_unit":null,
 "quote_currency":"USD",
 "quote_unit":"index-points",
 "tick_size":null,
 "tick_value":null,
 "point_value":null,
 "minimum_fluctuation":null,
 "settlement_type":null,
 "trading_hours_source":null,
 "exchange_timezone":"America/Chicago",
 "listed_months":[],
 "last_trade_rule":null,
 "first_notice_rule":null,
 "roll_rule":"volume/open-interest based; exact active contract is explicit",
 "spec_status":"unverified",
 "source_url":[],
 "verified_at":null,
 "effective_from":null,
 "effective_to":null
}
```

Store values as decimal-safe strings or integer ticks/cents where possible; don't rely on binary floating-point for money. Include currency and unit in every value. Historical versions must be retained so a spec change does not rewrite past trade calculations.

## 4. Source verification process

Primary sources:
- CME product/contract specification pages and exchange notices for CME/CBOT/COMEX/NYMEX products.
- ICE official contract specifications for DX and any ICE products.
- Exchange holiday, trading hours, expiry and delivery calendars.
- Broker-specific margin schedule only for margin information, with broker and retrieval timestamp.

For every imported/unverified record:
1. Match exact contract root and exchange.
2. Confirm multiplier and quote convention.
3. Verify minimum tick and tick value from current spec.
4. Confirm micro relationship rather than infer by a simple multiplier.
5. Verify trading hours and maintenance break.
6. Verify settlement and delivery risk.
7. Verify current expiry/last trade/first notice dates from the actual contract listing.
8. Record source URL, retrieval date, effective date and reviewer.
9. Cross-check the numeric values with a second official exchange representation where possible.
10. Mark `verified` only after all required fields pass.

The playbook itself warns that selected FX tick values can vary by source and that margin changes by broker/week. The repository README says its 15 imported contract specification rows are unverified. Keep them visibly unverified until checked; do not quietly reuse PDF values as a current official specification.

## 5. Expiry and roll model

- Store each listed expiry separately; do not model every future as one permanent symbol.
- Keep `root_symbol`, `contract_month`, `expiry_code`, `exchange_instrument_id` and `continuous_series_id` distinct.
- Roll date must come from current volume/open-interest crossover or a documented exchange/vendor roll calendar, not only a memorized date.
- Store old/new contract volume, OI and roll decision timestamp.
- SMT comparisons must use the same expiry where the market pair is expiry-sensitive.
- On roll week, flag mixed-expiry comparisons as invalid for automated SMT.
- Do not interpret a back-adjustment gap or roll transition as a natural FVG, gap, sweep or displacement.
- Explain whether historical charts are unadjusted, back-adjusted, ratio-adjusted or vendor continuous series.

## 6. Comparison engine

Allow users to select two/three compatible instruments and compare:
- Return/price change over matching intervals, if data access is authorized.
- Same session high/low and range.
- Synchronized timestamped swings.
- Relative volume and OI only when same frequency, contract scope and provider basis match.
- SMT candidates with detection rules visible.
- News and event exposure.
- Contract/expiry alignment and correlation caveats.

A comparison result is not automatically a trading signal. For every SMT candidate show: instrument A expiry, instrument B expiry, session, swing timestamps, level tested, which instrument swept, comparison rule, macro/news conflict and status (candidate/confirmed by selected rule/invalidated). Never compare continuous contract A with a mismatched active expiry B without warning.

## 7. ICT session/model fit

The PDF's T1/T2/T3 and session heatmap are a practitioner workflow synthesis, not a statistically tested market ranking. Store them as `playbook_profile` with source/evidence label, separate from measured market statistics. A later statistical heatmap must come from historical data, explicit volume/volatility/trade-count methodology and sample dates.

## 8. Data/route/build integration

Inspect and update:
- `ict-futures/markets/*.html` existing contract pages.
- `data/` contract specs and market profiles.
- Existing market catalogue and `/markets/` route.
- Futures Desk contract selector and provider symbol map.
- `scripts/build_site.py` and any profile page generation function.
- `cloudflare/src/index.js` provider symbol mapping only where needed.
- Supabase contract/reference schemas and migrations if a genuine schema gap exists.
- `tests/` contract registry and risk calculator tests.
- Data Health and docs.

Consolidate to a canonical registry. Do not hardcode a different tick value in a widget, calculator and contract profile.

## 9. Acceptance criteria

- [ ] All 15 families have a profile and an explicit verification state.
- [ ] Full-size/micro aliases are correctly mapped and independently verified.
- [ ] Contract units, quote convention, tick size, tick value and settlement are sourced.
- [ ] Expiry and first-notice risk are correct for the selected listed contract.
- [ ] Roll policy and continuous-series adjustment are visible.
- [ ] Profile sessions/models carry PDF convention and evidence warnings.
- [ ] SMT pairs enforce matching expiry and synchronized swings.
- [ ] No live margin is fabricated or presented as static universal data.
- [ ] Risk calculator uses the exact selected contract version.
- [ ] All profile links, tables, mobile layouts and data-health states pass.

## 10. Part-specific execution prompt

> Execute Part 3 only. Audit all 15 existing family pages and every unverified contract specification record. Build one canonical contract registry and reconcile all pages, selectors, symbol maps and risk-calculator inputs to it. Verify every published specification from current official CME/ICE material and record effective date/source. If you cannot verify a field, leave it null/UNVERIFIED and explain. Implement expiry-aware mapping, roll metadata and same-expiry SMT guards. Do not claim all 15 are verified merely because a record exists. Add numeric/rounding tests and contract page checks. Stop after contract intelligence and comparison support; do not implement live data adapters here.
