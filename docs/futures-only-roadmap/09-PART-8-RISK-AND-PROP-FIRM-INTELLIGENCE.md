# Part 8 — Futures Risk and Prop-Firm Intelligence

**Goal:** Provide mathematically correct futures position sizing and a source-verified rules database for futures evaluation/funded programs.

## 1. Scope and boundaries

This module is educational risk tooling and rule research, not a broker, account evaluator, payout guarantee, legal opinion or recommendation to buy a challenge. Prop-firm rules change frequently and may differ by account product, plan, activation date, jurisdiction and platform. Every fact must have a source, version and checked timestamp.

The exact "Blue Shift 25K" account mentioned in the conversation/PDF context must remain `UNVERIFIED` until its exact firm, plan/product page and current official rulebook are identified. Do not assume it is Topstep, ProForm or another firm. A user label or search result is insufficient to publish rules.

## 2. Futures risk calculator

Inputs:
- Account/evaluation balance and currency.
- Selected exchange contract + exact expiry.
- Full-size or micro contract.
- Entry price, stop price or stop ticks.
- Target price or reward/risk.
- Tick size and current verified tick value.
- Number of contracts or desired risk budget.
- Commission/fees per side/round turn.
- Estimated spread and slippage.
- Daily loss limit and remaining loss allowance (as user-entered or firm sourced).
- Maximum trailing/static drawdown and calculation mode.
- Current account equity/balance/high-water mark where user maintains it.
- Number of open positions / correlated exposures (user inputs).

Calculations:
`risk_per_contract = abs(entry_ticks - stop_ticks) × tick_value + round_turn_cost + estimated_slippage_cost`
`contracts = floor(risk_budget / risk_per_contract)`
Use tick-safe decimal or integer arithmetic; always round size downward. If risk budget is smaller than one contract risk, return zero contracts and explain why. Show gross stop risk separately from estimated all-in risk. Currency conversion, if any, must use a sourced and timestamped FX rate and clearly show the conversion.

The PDF's simplified expression is `(Account × Risk %) / (Stop Ticks × Tick Value)`; production calculator should also include commissions, spread and slippage. Ensure tick value is per tick, not point value. Prevent negative/zero stop distance, invalid tick sizes, unknown contract versions and invalid currency.

## 3. Exposure and guardrails

- Daily loss budget and remaining capacity.
- Maximum account drawdown / trailing floor.
- Per-trade, per-session and per-day limits.
- Maximum concurrent contracts.
- Maximum correlated exposure by index/metals/energy/FX group.
- Risk from event windows and exchange close/expiry.
- Gap/limit move scenarios where data available.
- Open-position and realised/unrealised equity basis for the rule.
- Daily reset timezone and exact reset timestamp.

If a rule depends on unrealized P&L, end-of-day balance or intraday peak, encode that distinction explicitly. Do not represent all drawdown rules with one generic "max loss" number.

## 4. Prop-firm rules database

Each record is a unique firm + program + account size + platform + purchase/activation date/version. Required fields:

### Identity and status
- Firm legal/display name, official domain and support/rulebook URLs.
- Product/plan name exactly as advertised.
- Account nominal size and currency.
- Evaluation, simulated funded, express funded, live funded stage.
- Platform/data connection.
- Rules version, publication/effective date and checked-at time.
- Supported country / eligibility notes only when official firm material says so.

### Trading limits
- Profit target and target progression.
- Daily loss limit, if any.
- Max loss limit and drawdown basis.
- Intraday trailing / end-of-day trailing / static / balance-based / equity-based logic.
- Starting floor, trailing activation, lock/ratchet rule.
- Daily reset/timezone.
- Maximum contracts and micro-to-mini scaling.
- Position scaling plan.
- Consistency / best-day / minimum-day rules.
- Trading hours, overnight, weekend and holiday holding.
- News trading restrictions and event-specific restrictions.
- Copy trading, group trading, account stacking, hedging and automation restrictions.
- Prohibited instruments/markets.
- Liquidation and violation consequences.

### Payout and commercial terms
- Activation fee, subscription, reset and data fees with currency and checked date.
- Payout eligibility, minimum winning days, payout windows and caps.
- Profit split and any stage-specific difference.
- Minimum balance/reserve and drawdown effect after payout.
- Verification/KYC requirements and payment methods.
- Refund/cancellation terms.
- Rule changes and existing-account grandfathering where applicable.

Do not infer eligibility from the user's location or claim a firm accepts India unless exact official eligibility policy is sourced and current.

## 5. Rule normalization and simulator

Normalize drawdown rules into typed logic, not prose alone:
- `threshold_type`: daily_loss | max_loss | trailing_loss | consistency | position_limit.
- `calculation_basis`: realized_balance | end_of_day_balance | intraday_equity | end_of_day_equity | high_water_mark | provider_defined.
- `reset_timezone` and reset rule.
- `starting_threshold`, `trailing_amount`, `ratchet_mode`, `lock_condition`.
- `effective_from`, `effective_to`.
- `source_id`, `source_quote_or_summary`, `checked_at`, `verification_status`.

A rule simulator can replay user-entered P&L/equity path to illustrate whether the rule might be breached. It must not guarantee the firm's platform will calculate identically; show assumptions and ask user to confirm with official portal.

## 6. Comparison UI

Allow user to compare only like-for-like plans:
- Nominal account size.
- Evaluation stage.
- Platform.
- Fees (same currency and tax basis).
- Profit target.
- Daily/max drawdown.
- Drawdown method.
- Contracts/scaling.
- News/overnight restrictions.
- Payout requirements.
- Official source and last verified.
- Unverified/missing fields.

Filter by futures contracts, country eligibility, budget and account size only when these dimensions are source-supported. Display a confidence/status label (Verified from official source / Partially verified / Unverified / Changed recently). Do not use affiliate marketing ranking as factual trust ranking.

## 7. Source verification workflow

1. Start from official firm website, current rules page, FAQs and product-specific agreement.
2. Confirm exact product, account size, stage, platform and effective date.
3. Check linked rulebook and official update/changelog.
4. Verify every numerical threshold from the relevant page/document.
5. Resolve contradictions in favor of the applicable current signed terms; if uncertain, mark unresolved.
6. Record source URL and retrieval timestamp for each rule group.
7. Recheck links and rule changes on each periodic review.
8. Keep archived prior versions for accounts sold under previous rules if the firm states those terms remain applicable.
9. Label secondary reviews/community experience as supplemental, never primary proof.
10. Include a support-contact link for ambiguous or individualized account rules.

Do not scrape behind login or rely on outdated screenshots. If public rules are unavailable, show "official rules not verified" and do not publish numeric claims.

## 8. Implementation paths

Inspect/update:
- Existing `/tools/` risk calculator and `/risk/` route if created.
- Canonical contract/tick metadata from Part 3.
- Supabase source registry and any rule-source tables; additive migrations only.
- Existing journal/account pages only for user preferences, not prop firm data.
- Build scripts, JS calculation module and tests.
- Provider/data licensing documentation.

Separate public firm-rule records from private user balances/accounts. Do not request broker/prop-firm passwords or store login credentials. If user connects an official broker API in a future phase, use least-privilege read-only OAuth/tokens and explicit opt-in.

## 9. Acceptance criteria

- [ ] Tick and point units are never confused.
- [ ] Commissions, fees and slippage appear in all-in risk.
- [ ] Contract spec version controls the calculator.
- [ ] Size rounds downward; zero-contract state is explained.
- [ ] Daily reset timezone and equity/balance basis are explicit.
- [ ] Trailing drawdown simulation matches documented rule logic.
- [ ] Prop-firm identity and plan are exact, not inferred.
- [ ] Every numerical rule has current official source and checked time.
- [ ] Blue Shift 25K remains UNVERIFIED until exact source verified.
- [ ] Fees, payouts, rules and eligibility show effective dates and currency.
- [ ] User account data is private and RLS-tested.
- [ ] No guarantee, endorsement or payout promise is published.

## 10. Part-specific execution prompt

> Execute Part 8 only. Audit existing futures calculator and contract tick metadata. Implement tick-safe all-in risk sizing with fees/slippage and account guardrails. Build a versioned firm/program rules registry, but only publish numerical rules after verifying the exact official plan and current rulebook. Treat the mentioned Blue Shift 25K plan as unverified until exact official identity/URL is confirmed. Keep user balances private; do not request credentials. Add calculation tests, drawdown-rule scenario tests, source-freshness display and clear educational disclaimer. Stop after risk and prop-firm intelligence is validated.

## Standalone handoff context — use this file by itself

**Repository:** https://github.com/whizz444yt-ux/Finance-Intelligence-OS  
**Product:** Futures Intelligence OS — futures-only markets, ICT futures education, futures news/data, positioning, backtesting, risk and trader workspace.  
**Architecture to inspect and preserve:** static HTML/JavaScript/JSON; Python build at `scripts/build_site.py`; Cloudflare Worker at `cloudflare/src/index.js` with KV; Supabase Postgres/Auth/RLS; Vercel static output `dist/`; GitHub Actions and tests. This is a baseline, not proof each service/credential is currently healthy.

**When this single Part file is the only document supplied:** treat it as the complete request to execute this Part. The user should not need to repeat the repository URL, product purpose or stack. Apply these global rules:
- Execute only the Part named in this file; do not implement another Part.
- Inspect current branch, commit, relevant source, dependencies and runtime first. Actual repo/runtime overrides stale documentation.
- Preserve futures modules, ICT lesson IDs, user data, Auth/RLS, build system and legacy backups. Do not blindly delete/rewrite.
- Futures-only includes CME/ICE listed futures, including currency futures and CME Bitcoin futures. Exclude unrelated equities, generic spot crypto, generic FX/CFD, prediction markets and other non-futures product areas only after dependency audit.
- Never invent prices, volume/OI, specs, expiry, schedules, prop rules, provider capability, licences, API limits or strategy performance.
- Separate real-time, delayed, historical, weekly, cached and unavailable data; display source, frequency and timestamps.
- Keep secrets out of Git/browser; use platform secret stores. Make DB migrations additive; preserve production data. No destructive action without approval.
- Edit canonical source/builders, not generated `dist/`. Use a focused feature branch and reviewable PR, not direct destructive pushes to main.
- Run build, unit tests, structural/security validator and internal-link audit where applicable; add tests and report commands that could not run.
- Verify changed routes/API states, mobile/accessibility, provider freshness/licensing, or RLS according to the Part.
- Complete unblocked work; missing credentials/licenses remain explicitly `NOT CONFIGURED`.
- Never claim a test, deployment or completion without observed evidence.

**Execution:** Read this file fully, inspect the repository and execute only the named Part. Return changed paths, test commands/results, branch/commit/PR, blockers and acceptance checklist. Stop after this Part.
