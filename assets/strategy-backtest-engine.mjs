export const ENGINE_VERSION = "p4.1.0";
export const MAX_BARS = 250000;

const REQUIRED = ["timestamp", "open", "high", "low", "close", "signal"];
const TZ_RE = /(?:Z|[+-](?:0\d|1\d|2[0-3]):[0-5]\d)$/i;

function parseCsvRows(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("The selected CSV file is empty.");
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"' && field.length === 0) quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some(v => String(v).trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some(v => String(v).trim() !== "")) rows.push(row);
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one data row.");
  return rows;
}

function finiteCell(value, field, rowNumber, { optional = false, minimum = -Infinity } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw && optional) return null;
  if (!raw) throw new Error("Missing " + field + " at CSV row " + rowNumber + ".");
  const n = Number(raw);
  if (!Number.isFinite(n) || n < minimum) throw new Error("Invalid " + field + " at CSV row " + rowNumber + ".");
  return n;
}

function parseSignal(value, rowNumber) {
  const signal = String(value ?? "").trim().toUpperCase();
  if (["LONG", "BUY", "1"].includes(signal)) return 1;
  if (["SHORT", "SELL", "-1"].includes(signal)) return -1;
  if (["", "FLAT", "NONE", "HOLD", "0", "NO_SIGNAL"].includes(signal)) return 0;
  throw new Error("Unsupported signal '" + signal + "' at CSV row " + rowNumber + ". Use LONG, SHORT or FLAT.");
}

export function parseSignalCsv(text) {
  const rows = parseCsvRows(text);
  const headers = rows[0].map(v => String(v).trim().replace(/^\uFEFF/, "").toLowerCase());
  const duplicates = headers.filter((h, i) => headers.indexOf(h) !== i);
  if (duplicates.length) throw new Error("CSV has duplicate column names: " + [...new Set(duplicates)].join(", "));
  const missing = REQUIRED.filter(h => !headers.includes(h));
  if (missing.length) throw new Error("CSV is missing required columns: " + missing.join(", "));
  const ix = Object.fromEntries(headers.map((h, i) => [h, i]));
  const dataRows = rows.slice(1);
  if (dataRows.length > MAX_BARS) throw new Error("CSV exceeds the " + MAX_BARS.toLocaleString() + " bar safety limit.");
  if (dataRows.length < 30) throw new Error("At least 30 timestamped bars are required for chronological split testing.");
  const bars = [];
  let previousTime = -Infinity;
  const contracts = new Set();
  let signalCount = 0, longCount = 0, shortCount = 0, volumeCount = 0, stopOverrideCount = 0;
  for (let i = 0; i < dataRows.length; i += 1) {
    const raw = dataRows[i];
    const rowNumber = i + 2;
    if (raw.length > headers.length && raw.slice(headers.length).some(v => String(v).trim() !== "")) {
      throw new Error("CSV row " + rowNumber + " has more values than the header.");
    }
    const cell = key => raw[ix[key]] ?? "";
    const ts = String(cell("timestamp")).trim();
    if (!TZ_RE.test(ts)) throw new Error("Timestamp at CSV row " + rowNumber + " must include Z or an explicit UTC offset.");
    const epoch = Date.parse(ts);
    if (!Number.isFinite(epoch)) throw new Error("Invalid timestamp at CSV row " + rowNumber + ".");
    if (epoch <= previousTime) throw new Error("Timestamps must be strictly increasing; duplicate or out-of-order row at CSV row " + rowNumber + ".");
    previousTime = epoch;
    const open = finiteCell(cell("open"), "open", rowNumber);
    const high = finiteCell(cell("high"), "high", rowNumber);
    const low = finiteCell(cell("low"), "low", rowNumber);
    const close = finiteCell(cell("close"), "close", rowNumber);
    if (high < Math.max(open, close) || low > Math.min(open, close) || high < low) {
      throw new Error("OHLC range is inconsistent at CSV row " + rowNumber + ".");
    }
    const signal = parseSignal(cell("signal"), rowNumber);
    if (signal !== 0) signalCount += 1;
    if (signal === 1) longCount += 1;
    if (signal === -1) shortCount += 1;
    const volume = ix.volume === undefined || String(cell("volume")).trim() === ""
      ? null : finiteCell(cell("volume"), "volume", rowNumber, { minimum: 0 });
    if (volume !== null) volumeCount += 1;
    const stopTicks = ix.stop_ticks === undefined || String(cell("stop_ticks")).trim() === ""
      ? null : finiteCell(cell("stop_ticks"), "stop_ticks", rowNumber, { minimum: 1, maximum: 100000 });
    if (stopTicks !== null && !Number.isInteger(stopTicks)) throw new Error("stop_ticks must be an integer at CSV row " + rowNumber + ".");
    if (stopTicks !== null) stopOverrideCount += 1;
    const contract = ix.contract === undefined ? "" : String(cell("contract")).trim();
    if (ix.contract !== undefined && !contract) throw new Error("Missing contract code at CSV row " + rowNumber + ".");
    if (contract) contracts.add(contract);
    bars.push({
      timestamp: new Date(epoch).toISOString(), epoch,
      open, high, low, close, signal, volume, stopTicks, contract
    });
  }
  if (contracts.size > 1) {
    throw new Error("The CSV contains multiple contract codes (" + [...contracts].slice(0, 5).join(", ") + "). Use one expiry series per run. Do not silently stitch unadjusted expiries.");
  }
  return {
    bars,
    quality: {
      rows: bars.length,
      firstTimestamp: bars[0].timestamp,
      lastTimestamp: bars[bars.length - 1].timestamp,
      signalCount, longSignals: longCount, shortSignals: shortCount,
      volumeCoverage: bars.length ? volumeCount / bars.length : 0,
      stopOverrideCount,
      contract: [...contracts][0] || null,
      uniqueContracts: contracts.size
    }
  };
}

export function validateConfig(input) {
  const c = { ...input };
  const num = (key, label, min, max = Infinity) => {
    const v = Number(c[key]);
    if (!Number.isFinite(v) || v < min || v > max) throw new Error(label + " must be between " + min + " and " + max + ".");
    c[key] = v;
  };
  num("startingCapital", "Starting capital (USD)", 1, 100000000000);
  num("riskPercent", "Risk per trade (%)", 0.01, 20);
  num("tickSize", "Tick size", 0.00000001, 100000000);
  num("tickValue", "Tick value (USD)", 0.00000001, 100000000);
  num("commissionPerSide", "Commission per contract per side", 0, 100000);
  num("slippageTicks", "Slippage ticks per side", 0, 100);
  num("stopTicks", "Stop distance (ticks)", 1, 100000);
  num("targetRR", "Target reward/risk", 0.1, 20);
  num("maxBarsInTrade", "Maximum bars in a trade", 1, 100000);
  num("maxContracts", "Maximum contracts", 1, 100000);
  if (!Number.isInteger(c.stopTicks) || !Number.isInteger(c.maxBarsInTrade) || !Number.isInteger(c.maxContracts)) {
    throw new Error("Stop ticks, maximum bars and maximum contracts must be whole numbers.");
  }
  num("trainPercent", "In-sample allocation (%)", 50, 80);
  num("validationPercent", "Validation allocation (%)", 10, 30);
  if (c.trainPercent + c.validationPercent > 90) throw new Error("Out-of-sample allocation must be at least 10%.");
  c.modelId = String(c.modelId || "custom").slice(0, 80);
  c.strategyName = String(c.strategyName || "Untitled strategy").trim().slice(0, 120);
  c.marketSymbol = String(c.marketSymbol || "").trim().slice(0, 80);
  c.timeframe = String(c.timeframe || "").trim().slice(0, 30);
  c.timezone = String(c.timezone || "UTC").trim().slice(0, 80);
  try { new Intl.DateTimeFormat("en-US", { timeZone: c.timezone }).format(new Date(0)); }
  catch { throw new Error("Timezone must be a valid IANA timezone such as America/Chicago or UTC."); }
  c.signalSourceNotes = String(c.signalSourceNotes || "").trim().slice(0, 2000);
  c.seriesType = c.seriesType === "back-adjusted-continuous" ? "back-adjusted-continuous" : "single-expiry";
  c.rollNote = String(c.rollNote || "").trim().slice(0, 500);
  if (c.seriesType === "back-adjusted-continuous" && c.rollNote.length < 12) {
    throw new Error("Describe the continuous-contract adjustment and roll source before running this series type.");
  }
  c.signalConvention = "Signal is known at the source bar close; entry is attempted at the next bar open.";
  return c;
}

function round(value, decimals = 8) {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

function describeMetrics(trades, equityCurve, drawdown) {
  const n = trades.length;
  const wins = trades.filter(t => t.netPnlUsd > 1e-9);
  const losses = trades.filter(t => t.netPnlUsd < -1e-9);
  const flat = n - wins.length - losses.length;
  const grossProfit = trades.reduce((s, t) => s + Math.max(0, t.grossPnlUsd), 0);
  const grossLoss = Math.abs(trades.reduce((s, t) => s + Math.min(0, t.grossPnlUsd), 0));
  const netWinningTrades = wins.reduce((s, t) => s + t.netPnlUsd, 0);
  const netLosingTrades = Math.abs(losses.reduce((s, t) => s + t.netPnlUsd, 0));
  const net = trades.reduce((s, t) => s + t.netPnlUsd, 0);
  const commissions = trades.reduce((s, t) => s + t.commissionsUsd, 0);
  const slippage = trades.reduce((s, t) => s + t.slippageCostUsd, 0);
  const rValues = trades.map(t => t.rMultiple).filter(Number.isFinite);
  const avg = (values) => values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;
  const avgWin = avg(wins.map(t => t.netPnlUsd));
  const avgLoss = avg(losses.map(t => t.netPnlUsd));
  const expectancyR = avg(rValues);
  const values = equityCurve.map(p => p.equity);
  return {
    trades: n,
    wins: wins.length,
    losses: losses.length,
    breakeven: flat,
    winRatePct: n ? wins.length / n * 100 : null,
    grossProfitUsd: round(grossProfit, 2),
    grossLossUsd: round(grossLoss, 2),
    netPnlUsd: round(net, 2),
    commissionsUsd: round(commissions, 2),
    estimatedSlippageUsd: round(slippage, 2),
    averageWinUsd: avgWin === null ? null : round(avgWin, 2),
    averageLossUsd: avgLoss === null ? null : round(avgLoss, 2),
    expectancyUsdPerTrade: n ? round(net / n, 4) : null,
    averageR: expectancyR === null ? null : round(expectancyR, 4),
    netWinningTradesUsd: round(netWinningTrades, 2),
    netLosingTradesUsd: round(netLosingTrades, 2),
    profitFactor: netLosingTrades > 0 ? round(netWinningTrades / netLosingTrades, 4) : null,
    profitFactorState: netLosingTrades > 0 ? "finite" : (netWinningTrades > 0 ? "no-losses" : "undefined"),
    profitFactorBasis: "Net winning trades divided by absolute net losing trades after all modeled costs; gross profit/loss fields are before commissions.",
    maxDrawdownUsd: round(drawdown.maxDrawdownUsd, 2),
    maxDrawdownPct: drawdown.maxDrawdownPct === null ? null : round(drawdown.maxDrawdownPct, 4),
    maxDrawdownPeakAt: drawdown.maxDrawdownPeakAt,
    maxDrawdownTroughAt: drawdown.maxDrawdownTroughAt,
    maxDrawdownRecoveryAt: drawdown.maxDrawdownRecoveryAt,
    maxDrawdownDurationBars: drawdown.maxDrawdownDurationBars,
    maxDrawdownDurationMs: drawdown.maxDrawdownDurationMs,
    endingEquityUsd: values.length ? round(values[values.length - 1], 2) : null,
    averageRIsExpectancy: true
  };
}

export function runBacktest(bars, inputConfig, periodName = "full-sample") {
  if (!Array.isArray(bars) || bars.length < 3) throw new Error("A backtest period needs at least three bars.");
  const c = validateConfig(inputConfig);
  const dollarsPerPoint = c.tickValue / c.tickSize;
  let cash = c.startingCapital;
  let position = null;
  const trades = [];
  const equityCurve = [];
  let skippedSignals = 0, signalsWhilePositionOpen = 0, ambiguousBars = 0;
  let peakEquity = c.startingCapital, peakIndex = 0;
  let currentDrawdownStart = null, currentDrawdownPeakAt = null;
  let maxDrawdownUsd = 0, maxDrawdownPct = null;
  let maxDrawdownPeakAt = null, maxDrawdownTroughAt = null;
  let maxDurationBars = 0, maxDurationMs = 0, maxDrawdownRecoveryAt = null;

  function markToMarket(index, bar) {
    let equity = cash;
    if (position) {
      const unrealized = (bar.close - position.entryFillPrice) * position.direction * dollarsPerPoint * position.quantity;
      const estimatedExitCost = (c.commissionPerSide + c.slippageTicks * c.tickValue) * position.quantity;
      equity += unrealized - estimatedExitCost;
    }
    if (equity > peakEquity) {
      peakEquity = equity;
      peakIndex = index;
      if (currentDrawdownStart !== null) {
        const durationBars = index - currentDrawdownStart;
        const durationMs = bar.epoch - Date.parse(currentDrawdownPeakAt);
        if (maxDrawdownPeakAt === currentDrawdownPeakAt) {
          maxDurationBars = durationBars;
          maxDurationMs = durationMs;
          maxDrawdownRecoveryAt = bar.timestamp;
        }
        currentDrawdownStart = null;
        currentDrawdownPeakAt = null;
      }
    } else if (equity < peakEquity - 1e-9) {
      if (currentDrawdownStart === null) {
        currentDrawdownStart = peakIndex;
        currentDrawdownPeakAt = bars[peakIndex]?.timestamp || bar.timestamp;
      }
      const dd = peakEquity - equity;
      const ddPct = peakEquity > 0 ? dd / peakEquity * 100 : null;
      if (dd > maxDrawdownUsd) {
        maxDrawdownUsd = dd;
        maxDrawdownPct = ddPct;
        maxDrawdownPeakAt = currentDrawdownPeakAt;
        maxDrawdownTroughAt = bar.timestamp;
        maxDrawdownRecoveryAt = null;
        maxDurationBars = 0;
        maxDurationMs = 0;
      }
    }
    equityCurve.push({
      timestamp: bar.timestamp,
      equity: round(equity, 4),
      drawdownUsd: round(Math.max(0, peakEquity - equity), 4),
      drawdownPct: peakEquity > 0 ? round(Math.max(0, (peakEquity - equity) / peakEquity * 100), 6) : null
    });
  }

  function closePosition(bar, barIndex, reason, referencePrice, fillPrice, exitSlippageTicks) {
    const p = position;
    if (!p) return;
    const gross = (fillPrice - p.entryFillPrice) * p.direction * dollarsPerPoint * p.quantity;
    const exitCommission = c.commissionPerSide * p.quantity;
    const net = gross - p.entryCommission - exitCommission;
    const entrySlipCost = c.slippageTicks * c.tickValue * p.quantity;
    const exitSlipCost = Math.abs(fillPrice - referencePrice) * dollarsPerPoint * p.quantity;
    cash += gross - exitCommission;
    trades.push({
      tradeNo: trades.length + 1,
      period: periodName,
      side: p.direction === 1 ? "long" : "short",
      signalAt: p.signalBar.timestamp,
      entryAt: p.entryBar.timestamp,
      exitAt: bar.timestamp,
      entryPrice: round(p.entryFillPrice),
      stopPrice: round(p.stopPrice),
      targetPrice: round(p.targetPrice),
      exitPrice: round(fillPrice),
      quantity: p.quantity,
      stopTicks: p.stopTicks,
      targetTicks: p.targetTicks,
      grossPnlUsd: round(gross, 4),
      commissionsUsd: round(p.entryCommission + exitCommission, 4),
      slippageCostUsd: round(entrySlipCost + exitSlipCost, 4),
      netPnlUsd: round(net, 4),
      riskUsd: round(p.riskPerContractUsd * p.quantity, 4),
      rMultiple: round(net / (p.riskPerContractUsd * p.quantity), 6),
      exitReason: reason,
      barsHeld: barIndex - p.entryIndex + 1
    });
    position = null;
  }

  function checkExit(bar, barIndex) {
    if (!position) return false;
    const p = position, slip = c.slippageTicks * c.tickSize;
    const long = p.direction === 1;
    const stopAtOpen = long ? bar.open <= p.stopPrice : bar.open >= p.stopPrice;
    const targetAtOpen = long ? bar.open >= p.targetPrice : bar.open <= p.targetPrice;
    if (stopAtOpen) {
      closePosition(bar, barIndex, "stop-gap", p.stopPrice, bar.open - p.direction * slip, c.slippageTicks);
      return true;
    }
    if (targetAtOpen) {
      closePosition(bar, barIndex, "target-gap-limit", p.targetPrice, p.targetPrice, 0);
      return true;
    }
    const stopHit = long ? bar.low <= p.stopPrice : bar.high >= p.stopPrice;
    const targetHit = long ? bar.high >= p.targetPrice : bar.low <= p.targetPrice;
    if (stopHit && targetHit) {
      ambiguousBars += 1;
      closePosition(bar, barIndex, "stop-first-same-bar", p.stopPrice, p.stopPrice - p.direction * slip, c.slippageTicks);
      return true;
    }
    if (stopHit) {
      closePosition(bar, barIndex, "stop", p.stopPrice, p.stopPrice - p.direction * slip, c.slippageTicks);
      return true;
    }
    if (targetHit) {
      closePosition(bar, barIndex, "target-limit", p.targetPrice, p.targetPrice, 0);
      return true;
    }
    const barsHeld = barIndex - p.entryIndex + 1;
    if (barsHeld >= c.maxBarsInTrade) {
      closePosition(bar, barIndex, "time-exit", bar.close, bar.close - p.direction * slip, c.slippageTicks);
      return true;
    }
    return false;
  }

  markToMarket(0, bars[0]);
  for (let i = 1; i < bars.length; i += 1) {
    const bar = bars[i];
    const wasOpen = Boolean(position);
    if (wasOpen) {
      if (bars[i - 1].signal !== 0) signalsWhilePositionOpen += 1;
      checkExit(bar, i);
      if (position && i === bars.length - 1) {
        const slip = c.slippageTicks * c.tickSize;
        closePosition(bar, i, "end-of-data", bar.close, bar.close - position.direction * slip, c.slippageTicks);
      }
    } else {
      const signalBar = bars[i - 1];
      if (signalBar.signal !== 0) {
        const stopTicks = signalBar.stopTicks ?? c.stopTicks;
        const targetTicks = Math.max(1, Math.round(stopTicks * c.targetRR));
        const riskPerContractUsd = stopTicks * c.tickValue +
          (2 * c.commissionPerSide) + (2 * c.slippageTicks * c.tickValue);
        const riskBudget = Math.max(0, cash) * c.riskPercent / 100;
        const quantity = Math.min(c.maxContracts, Math.floor((riskBudget + 1e-9) / riskPerContractUsd));
        if (quantity < 1) {
          skippedSignals += 1;
        } else {
          const direction = signalBar.signal;
          const entryFillPrice = bar.open + direction * c.slippageTicks * c.tickSize;
          const entryCommission = c.commissionPerSide * quantity;
          const stopPrice = entryFillPrice - direction * stopTicks * c.tickSize;
          const targetPrice = entryFillPrice + direction * targetTicks * c.tickSize;
          cash -= entryCommission;
          position = {
            direction, quantity, entryFillPrice, entryCommission,
            stopPrice, targetPrice, stopTicks, targetTicks, riskPerContractUsd,
            signalBar, entryBar: bar, entryIndex: i
          };
          checkExit(bar, i);
          if (position && i === bars.length - 1) {
            const slip = c.slippageTicks * c.tickSize;
            closePosition(bar, i, "end-of-data", bar.close, bar.close - position.direction * slip, c.slippageTicks);
          }
        }
      }
    }
    if (!wasOpen && position && bars[i - 1].signal !== 0) {
      // A newly entered position is marked after its entry-bar execution checks.
    }
    markToMarket(i, bar);
  }
  if (currentDrawdownStart !== null) {
    const last = bars[bars.length - 1];
    const durationBars = bars.length - 1 - currentDrawdownStart;
    const durationMs = last.epoch - Date.parse(currentDrawdownPeakAt);
    if (maxDrawdownPeakAt === currentDrawdownPeakAt) {
      maxDurationBars = durationBars;
      maxDurationMs = durationMs;
    }
  }
  const metrics = describeMetrics(trades, equityCurve, {
    maxDrawdownUsd, maxDrawdownPct, maxDrawdownPeakAt,
    maxDrawdownTroughAt, maxDrawdownRecoveryAt, maxDrawdownDurationBars: maxDurationBars,
    maxDrawdownDurationMs: maxDurationMs
  });
  const warnings = [];
  if (trades.length < 30) warnings.push("Fewer than 30 closed trades: descriptive metrics are highly sample-sensitive.");
  if (trades.length === 0) warnings.push("No trades qualified in this period. Expectancy and profit factor are unavailable.");
  if (ambiguousBars > 0) warnings.push(ambiguousBars + " bar(s) touched stop and target; the engine used the conservative stop-first rule.");
  if (skippedSignals > 0) warnings.push(skippedSignals + " signal(s) were skipped because one contract exceeded the risk budget.");
  if (signalsWhilePositionOpen > 0) warnings.push(signalsWhilePositionOpen + " signal(s) occurred while a position was open and were ignored.");
  if (bars[bars.length - 1].signal !== 0) warnings.push("The final bar's signal was not executed because no next bar exists.");
  return {
    period: periodName,
    startAt: bars[0].timestamp,
    endAt: bars[bars.length - 1].timestamp,
    bars: bars.length,
    trades,
    metrics,
    equityCurve,
    skippedSignals,
    ambiguousBars,
    warnings
  };
}

export async function sha256(text) {
  if (!globalThis.crypto?.subtle) throw new Error("Secure SHA-256 is unavailable in this browser. Open the site over HTTPS and try again.");
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(v => v.toString(16).padStart(2, "0")).join("");
}

function stableStringify(value) {
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  if (value && typeof value === "object") {
    return "{" + Object.keys(value).sort().map(k => JSON.stringify(k) + ":" + stableStringify(value[k])).join(",") + "}";
  }
  return JSON.stringify(value);
}

export async function runExperiment(csvText, inputConfig, datasetName = "uploaded.csv") {
  const parsed = parseSignalCsv(csvText);
  const config = validateConfig(inputConfig);
  const bars = parsed.bars;
  const trainEnd = Math.floor(bars.length * config.trainPercent / 100);
  const validationEnd = Math.floor(bars.length * (config.trainPercent + config.validationPercent) / 100);
  if (trainEnd < 2 || validationEnd - trainEnd < 2 || bars.length - validationEnd < 2) {
    throw new Error("The selected split leaves too few bars in one period. Add more history or adjust the split percentages.");
  }
  const splitDefinitions = [
    { key: "in-sample", start: 0, end: trainEnd },
    { key: "validation", start: trainEnd, end: validationEnd },
    { key: "out-of-sample", start: validationEnd, end: bars.length }
  ];
  const splits = splitDefinitions.map(def => {
    const result = runBacktest(bars.slice(def.start, def.end), config, def.key);
    return { key: def.key, startIndex: def.start, endIndexExclusive: def.end, ...result };
  });
  const fullSample = runBacktest(bars, config, "full-sample");
  const splitTrades = splits.flatMap(s => s.trades);
  const qualityWarnings = [];
  if (parsed.quality.signalCount < 10) qualityWarnings.push("Fewer than 10 non-flat input signals were supplied.");
  if (splits[2].metrics.trades < 30) qualityWarnings.push("Out-of-sample contains fewer than 30 closed trades; do not treat it as strong evidence.");
  if (config.seriesType === "back-adjusted-continuous") qualityWarnings.push("Back-adjusted continuous prices are synthetic. Roll fills/spreads and price-level distortion are not simulated.");
  const misalignedPriceCount = bars.reduce((count, bar) => {
    const prices = [bar.open, bar.high, bar.low, bar.close];
    return count + prices.filter(price => Math.abs(price / config.tickSize - Math.round(price / config.tickSize)) > 1e-5).length;
  }, 0);
  if (misalignedPriceCount > 0) qualityWarnings.push(misalignedPriceCount + " OHLC value(s) do not align to the supplied tick size. Verify the feed precision and tick specification.");
  parsed.quality.tickMisalignedPrices = misalignedPriceCount;
  const dataHash = await sha256(csvText);
  const fingerprintInput = {
    engineVersion: ENGINE_VERSION,
    datasetSha256: dataHash,
    config,
    split: {
      trainPercent: config.trainPercent,
      validationPercent: config.validationPercent,
      outOfSamplePercent: 100 - config.trainPercent - config.validationPercent
    }
  };
  const runFingerprint = await sha256(stableStringify(fingerprintInput));
  const manifest = {
    schemaVersion: 1,
    engineVersion: ENGINE_VERSION,
    runFingerprint,
    dataset: {
      name: String(datasetName).slice(0, 180),
      sha256: dataHash,
      rows: parsed.quality.rows,
      firstTimestamp: parsed.quality.firstTimestamp,
      lastTimestamp: parsed.quality.lastTimestamp,
      signalCount: parsed.quality.signalCount,
      longSignals: parsed.quality.longSignals,
      shortSignals: parsed.quality.shortSignals,
      contract: parsed.quality.contract
    },
    method: {
      signalKnownAt: "source-bar-close",
      entry: "next-bar-open",
      positionModel: "one position at a time; no pyramiding",
      stopTarget: "fixed stop ticks and fixed reward/risk target; stop/target evaluated against bar OHLC",
      sameBarAmbiguity: "stop-first (conservative)",
      stopGap: "fill at worse bar open plus configured adverse slippage",
      targetGap: "limit fill at target price; no price improvement",
      costs: "commission per contract per side; slippage in ticks per side; slippage is embedded in execution prices",
      riskSizing: "floor(current cash risk budget / estimated one-contract stop risk); zero-size trades are skipped",
      drawdown: "bar-close mark-to-market equity, reserving estimated exit commission and slippage",
      splitPolicy: "chronological, independent capital reset per split; no positions cross split boundaries; the first bar signal is eligible within its own split and no prior-split signal is carried forward",
      optimization: "none; parameters are user-specified and the OOS segment must remain untouched until final evaluation"
    },
    config,
    split: fingerprintInput.split,
    dataQuality: parsed.quality,
    limitations: [
      "This engine tests supplied LONG/SHORT signals; it does not automatically detect ICT concepts or generate model signals.",
      "Signals must be causal and available at the source candle close. The engine cannot detect look-ahead leakage inside an externally generated signal column.",
      "Historical contract expiry/roll mapping, exchange holiday calendars, margin, liquidity/market impact and broker-specific execution are not inferred.",
      "A single contract or a documented back-adjusted continuous series is required; mixed unadjusted expiry rows are not accepted.",
      "A limit target is assumed filled when its price is touched; queue position and partial fills are not modelled.",
      "The OOS label is meaningful only if rules and parameters were frozen before inspecting that segment."
    ],
    generatedAt: new Date().toISOString()
  };
  return {
    engineVersion: ENGINE_VERSION,
    config,
    quality: parsed.quality,
    manifest,
    fullSample,
    splits,
    splitTrades,
    warnings: [...qualityWarnings, ...splits.flatMap(s => s.warnings.map(w => s.key + ": " + w))]
  };
}

export function tradesToCsv(trades) {
  const columns = [
    "tradeNo","period","side","signalAt","entryAt","exitAt","entryPrice","stopPrice","targetPrice",
    "exitPrice","quantity","stopTicks","targetTicks","grossPnlUsd","commissionsUsd","slippageCostUsd",
    "netPnlUsd","riskUsd","rMultiple","exitReason","barsHeld"
  ];
  const quote = v => {
    const s = String(v ?? "");
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [columns.join(","), ...trades.map(t => columns.map(c => quote(t[c])).join(","))].join("\r\n");
}

export function decimateEquity(curve, maxPoints = 500) {
  if (curve.length <= maxPoints) return curve;
  const step = (curve.length - 1) / (maxPoints - 1);
  const out = [];
  for (let i = 0; i < maxPoints; i += 1) out.push(curve[Math.round(i * step)]);
  return out;
}
