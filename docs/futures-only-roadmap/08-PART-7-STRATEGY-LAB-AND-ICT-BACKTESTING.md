# Part 7 — Strategy Lab and Reproducible ICT Futures Backtesting

**Goal:** Evolve the existing deterministic OHLC + user-signal backtester into an auditable futures-specific test environment with documented ICT detector rules, realistic costs and untouched out-of-sample evaluation.

## 1. Existing implementation baseline

The repository README states that the Strategy Lab currently accepts timestamped OHLC rows and causal LONG/SHORT/FLAT signals; entry is next-bar open after source-bar-close signal; it supports one position at a time, fixed stop and reward/risk target, whole-contract sizing, commission/slippage, conservative stop-first ambiguity, gap handling, time/end-of-data exit, chronological IS/validation/OOS splits, SHA-256 dataset fingerprints and downloadable JSON/CSV artifacts. It does not claim to auto-detect all ICT models or provide built-in verified historical market data.

Before editing, inspect the actual current source, tests and README because documentation and deployed behavior can drift. Preserve deterministic behavior and historical result compatibility or version the engine.

## 2. Model catalogue vs executable detector

The 10 starting model candidates are:
1. Liquidity Sweep + MSS.
2. Silver Bullet.
3. ICT 2022 Model.
4. Judas Swing + MSS.
5. Power of Three / AMD.
6. Unicorn.
7. FVG Continuation.
8. IFVG.
9. FVG + OTE.
10. SMT-assisted setup.

A catalogue description is not an executable detector. For each model create a rule card that identifies:
- Model ID, version, canonical/alternate names and evidence label.
- Required inputs and minimum bar history.
- Instrument families and exact expiry requirements.
- Bias timeframe, setup timeframe, entry timeframe.
- Session/window rule and IANA timezone.
- Liquidity level definition and detection lookback.
- Sweep/raid definition: wick-through threshold, close-back rule, equal-high tolerance.
- Swing point algorithm and pivot confirmation delay.
- MSS/BOS condition and whether body close is required.
- Displacement formula (body/range, ATR multiple, swing break, FVG presence).
- FVG/IFVG/OB/Breaker construction and wick/body measurement.
- OTE anchor selection and retracement band.
- SMT pair, same expiry, synchronized timestamps and inverse mapping.
- Entry order type, trigger time and fill assumption.
- Stop rule, target rule, time stop, partials and invalidation.
- News/event exclusion or separate news regime.
- No-trade conditions.
- Rule ambiguities and alternate configurations.
- Unit tests and synthetic examples for every condition.

Expose configurable variants explicitly; do not quietly change a model to fit the chart.

## 3. Detector engineering and causal integrity

- Indicators and detector signals may use only data available at decision time.
- A swing pivot that requires future bars must not be available until the confirmation bars close.
- Bar-close signal executes no earlier than next eligible bar by default.
- No look-ahead in FVG, swing, session-high/low, news and SMT calculations.
- No repainting: record signal creation time, confirmation time and source-bar timestamps.
- Include warm-up periods and null states.
- Detect data gaps, duplicate bars, out-of-order timestamps, session breaks and contract-roll boundaries.
- Use exact contract/expiry and timezone metadata.
- A synthetic/continuous chart must include roll adjustment method and must not create fake FVGs at roll transitions.
- If only OHLC is available, don't simulate tick-level path precision. Use conservative same-bar stop/target ambiguity.

## 4. Standard signal event schema

```json
{
 "signal_id":"sha256-or-stable-key",
 "model_id":"silver-bullet",
 "model_version":"1.0.0",
 "instrument_id":"cme:nq",
 "contract_month":"YYYY-MM",
 "timeframe":"1m",
 "signal_at":"UTC timestamp",
 "confirmed_at":"UTC timestamp",
 "session_id":"ny-am-silver-bullet",
 "direction":"LONG",
 "bias_context":{},
 "liquidity_level":{},
 "sweep":{},
 "structure_shift":{},
 "displacement":{},
 "entry_zone":{},
 "entry_rule":{},
 "stop_rule":{},
 "target_rule":{},
 "invalidation":[],
 "news_context":[],
 "data_source_id":"provider:dataset",
 "data_fingerprint":"sha256",
 "causal_validation":"passed"
}
```

## 5. Backtest execution engine

Required behavior:
- One or more documented position modes (one-at-a-time first; multi-position only in a separately tested mode).
- Exact tick-size rounding for entry/stop/target.
- Whole contract sizing and max contract cap.
- Micro and mini contract-specific tick value and commissions.
- Bid/ask or conservative spread model when available.
- Slippage model by order type, volatility, session and event risk if supported by data; clearly mark estimate versus observed.
- Stop gap-through adverse fill.
- Limit order fills only when trade/quote data justifies it; OHLC touch fill is an explicit optimistic/ambiguous assumption.
- Conservative stop-first rule when stop and target both occur inside a bar and order path is unknown.
- Partial fill, queue position and market impact limitations.
- Fees, exchange, clearing, NFA and routing charges where applicable; user can edit the cost schedule and record source/date.
- Time-based exits, daily session cutoffs, exchange maintenance and expiry close/roll policy.
- Margin/buying power is separate from risk sizing and may be broker-specific.
- No trade crosses a contract expiry without explicit roll logic.

## 6. Evaluation and research process

Use chronological segments:
- Training/in-sample (IS).
- Validation.
- Untouched out-of-sample (OOS), sealed until parameters and rules are frozen.

Track:
- Total trades and trade frequency.
- Net/gross P&L.
- Net expectancy per trade and per R.
- Average win/loss and payoff ratio.
- Win rate with sample size and confidence interval where appropriate.
- Profit factor.
- Max drawdown in dollars and percent, duration and recovery.
- Consecutive wins/losses.
- MAE/MFE only if intratrade data supports it.
- Net average R, commissions, slippage and rejected/ambiguous fills.
- Performance by instrument, exact expiry, session, weekday, event regime, long/short and model variant.
- IS vs validation vs OOS degradation.
- Sensitivity and parameter stability.
- Benchmark against simple baselines and random/shifted timestamps where methodology is valid.
- Survivorship, selection and multiple-testing caveats.

30 trades is an initial exploratory sample per PDF, not proof. A model cannot be labelled robust/best solely from 30 wins/losses. Publish minimum sample policy, test period, data quality, costs and OOS result prominently. Avoid cherry-picked dates and parameter sweeps over an unreported number of variants.

## 7. Data ingestion and supported input

CSV/OHLC input requirements:
- UTC timestamp with offset/Z.
- Exact contract and expiry.
- timeframe and bar interval.
- open/high/low/close.
- optional volume only when sourced and units specified.
- signal or detector outputs where applicable.
- optional bid/ask/spread/commission/slippage/market status.
- duplicate and missing-bar policy.
- source/provider, dataset ID, download date, data range and roll policy.

Verify strictly increasing timestamp, OHLC validity, trading calendar alignment, instrument tick-size rounding, no unknown expiry, no data gaps beyond declared threshold and no future data columns. Add file size/row limits to protect browser memory.

## 8. Reproducibility

Each run manifest should include:
- engine version and code commit.
- model detector ID/version/config.
- data provider, dataset ID, exact symbols/expiry and SHA-256.
- data range, timezone, roll/adjustment method.
- commission, spread, slippage, fill and stop/target execution assumptions.
- position sizing/account parameters.
- event filters and session definitions.
- IS/validation/OOS boundaries.
- generated timestamp.
- result hashes and trade ledger link.

Identical data + code version + configuration must create identical output. Store the full run manifest with the user result; raw large data need not be copied to Supabase unless licensed and intended.

## 9. UI

- Model catalogue: educational description, evidence label, executable detector status.
- Rule builder / configuration with saved version.
- Dataset upload and preflight diagnostics.
- Test launch with cost/slippage assumptions.
- Results summary and equity curve.
- Drawdown and underwater chart.
- Monthly/session/instrument breakdown.
- Trade ledger and replay links.
- IS/validation/OOS side-by-side result.
- Experiment comparison by fingerprint.
- Export run manifest, trades and charts.
- Warning panel for no licensed history, inadequate sample or data ambiguity.

Never make a promotional "Top ICT model" leaderboard from anecdotal win rates. If ranking is added, define objective and risk-adjusted criteria and require OOS and multiple-test safeguards.

## 10. Implementation paths

Inspect/update:
- Existing strategy/backtest engine module and `tests/test_strategy_backtest.mjs`.
- `/strategy-lab/` page source and assets.
- Existing Supabase `strategy_backtests` and `strategy_backtest_trades` migrations/tables.
- Contract registry from Part 3.
- Session/calendar definitions from Part 4.
- Market data adapter from Part 5/6.
- Build, validator, documentation and release notes.

Do not create duplicate run/trade tables if existing tables satisfy the model; migrate additively. Verify RLS ownership and dataset size limits.

## 11. Acceptance criteria

- [ ] Every automated model has a written machine-testable specification and version.
- [ ] Detectors are causal and non-repainting; swing confirmation latency is handled.
- [ ] Exact contract expiry/tick-size/cost metadata feeds execution.
- [ ] OHLC fill ambiguity and slippage are conservative/documented.
- [ ] Historical roll boundaries and event sessions handled.
- [ ] IS/validation/OOS chronological splits are reproducible and OOS remains untouched.
- [ ] Metrics, assumptions, dataset hashes and full trade ledger export.
- [ ] Determinism test: same inputs and config yield identical result.
- [ ] Unit tests cover edge cases (gaps, DST, same-bar SL/TP, gap-through, expiry, partial data).
- [ ] No results or performance labels are invented.
- [ ] Existing user backtest history is preserved and RLS-tested.

## 12. Part-specific execution prompt

> Execute Part 7 only. Inspect the current strategy engine and tests before making assumptions. Preserve the existing deterministic OHLC/user-signal workflow. Define each ICT detector in explicit, causal, versioned rules before coding it. Build synthetic fixtures proving no lookahead/repainting, then use authorized historical data and exact expiry metadata. Include commissions, slippage, spread/fill ambiguity, tick rounding and conservative stops. Implement chronological IS/validation/OOS, fingerprinted manifests, full ledgers and all metrics. Never claim model profitability without reproducible results. Stop after Strategy Lab is independently validated; do not implement prop-firm data pages in this Part.
