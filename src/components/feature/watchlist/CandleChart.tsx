import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { cn } from "cn";
import { memo, useEffect, useRef, useState } from "react";
import { selectQuoteBySymbol } from "../../../features/prices/pricesSlice";
import { useAppSelector } from "../../../hooks";
import type { Candle } from "../../../types";

interface CandleChartProps {
  symbol: string;
}

// the chart draws on a canvas, so it can't read our CSS variables; pick colours per theme
const themeColors = () =>
  document.documentElement.classList.contains("dark")
    ? { text: "#e5e7eb", grid: "#27272a" }
    : { text: "#27272a", grid: "#e5e7eb" };

// lightweight-charts shows UTC by default; show the viewer's local time (SGT) instead
const formatTime = (time: Time) =>
  new Date((time as number) * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const toBar = (c: Candle): CandlestickData<UTCTimestamp> => ({
  ...c,
  time: c.time as UTCTimestamp,
});

const CandleChart = memo(({ symbol }: CandleChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastCandleRef = useRef<Candle | null>(null);
  const [hasData, setHasData] = useState(false);

  const quote = useAppSelector((state) => selectQuoteBySymbol(state, symbol));

  // 1. create the chart once; remove it on unmount (StrictMode mounts twice in dev)
  useEffect(() => {
    if (!containerRef.current) return;
    const { text, grid } = themeColors();
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: text },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      timeScale: { timeVisible: true, secondsVisible: false, tickMarkFormatter: formatTime },
      localization: { timeFormatter: formatTime },
    });
    seriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: false,
    });
    chartRef.current = chart;

    // follow the dark/light toggle, which only flips a class on <html>
    const observer = new MutationObserver(() => {
      const colors = themeColors();
      chart.applyOptions({
        layout: { textColor: colors.text },
        grid: { vertLines: { color: colors.grid }, horzLines: { color: colors.grid } },
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // 2. load history from the server whenever the symbol changes
  useEffect(() => {
    const controller = new AbortController();
    lastCandleRef.current = null;
    seriesRef.current?.setData([]);
    setHasData(false);

    fetch(`/api/candles?symbol=${encodeURIComponent(symbol)}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Candle[]) => {
        seriesRef.current?.setData(data.map(toBar));
        chartRef.current?.timeScale().fitContent();
        lastCandleRef.current = data[data.length - 1] ?? null;
        setHasData(data.length > 0);
      })
      .catch(() => {}); // aborted or offline: chart stays empty

    return () => controller.abort();
  }, [symbol]);

  // 3. live: fold each new price into the current minute's candle, imperatively (no re-render of the chart)
  useEffect(() => {
    if (!quote || !seriesRef.current) return;
    const time = Math.floor(quote.ts / 60_000) * 60;
    const last = lastCandleRef.current;

    if (last && time < last.time) return; // older than what we have; ignore
    const candle: Candle =
      last?.time === time
        ? {
            ...last,
            high: Math.max(last.high, quote.price),
            low: Math.min(last.low, quote.price),
            close: quote.price,
          }
        : { time, open: quote.price, high: quote.price, low: quote.price, close: quote.price };

    lastCandleRef.current = candle;
    seriesRef.current.update(toBar(candle));
    setHasData(true);
  }, [quote]);

  return (
    <div className="mt-6">
      <div className="mb-2 text-sm text-muted-foreground">{symbol} · 1m candles</div>
      <div className="relative h-64 w-full">
        <div ref={containerRef} className={cn("h-full w-full", !hasData && "invisible")} />
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No trades yet (US stocks trade 21:30–04:00 SGT)
          </div>
        )}
      </div>
    </div>
  );
});

export default CandleChart;
