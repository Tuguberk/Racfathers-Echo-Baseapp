import { NextResponse } from "next/server";

// Ensure this runs on Node.js (not Edge) on Vercel and is always dynamic
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endTimeRaw = searchParams.get("endTime");
  const interval = (searchParams.get("interval") || "1h").toLowerCase();
  const hideLastCandles = searchParams.get("hideLastCandles") === "true";
  const hideCount = parseInt(searchParams.get("hideCount") || "3", 10);
  const limitParam = parseInt(searchParams.get("limit") || "60", 10); // default 60 candles window
  try {
    const intervalMap: Record<string, { binance: string; ms: number }> = {
      "1h": { binance: "1h", ms: 60 * 60 * 1000 },
      "15m": { binance: "15m", ms: 15 * 60 * 1000 },
    };
    const intervalInfo = intervalMap[interval] || intervalMap["1h"];

    // Parse endTime (accept ms or ISO string)
    const parsedEnd = endTimeRaw
      ? isNaN(Number(endTimeRaw))
        ? new Date(endTimeRaw).getTime()
        : Number(endTimeRaw)
      : Date.now();
    const endTime = parsedEnd;

    // Fetch Bitcoin price data from Binance
    // We always fetch the full window up to endTime and slice on server for partial view
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${intervalInfo.binance}&limit=${limitParam}&endTime=${endTime}`,
      {
        // Avoid Next.js caching at the platform level
        cache: "no-store",
        next: { revalidate: 0 },
        headers: {
          // Some providers block requests without a UA from serverless/edge
          "User-Agent": "echo-miniapp/1.0 (+https://vercel.com)",
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      // Surface the HTTP status for easier debugging on Vercel
      throw new Error(
        `Binance klines request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Transform Binance data to our format
    // Binance Klines returns: [timestamp, open, high, low, close, volume, close_time, ...]
    type BinanceKline = [
      number,
      string,
      string,
      string,
      string,
      string,
      number,
      ...unknown[],
    ];
    const klines: BinanceKline[] = Array.isArray(data)
      ? (data as BinanceKline[])
      : [];
    const chartData = klines.map((kline) => ({
      timestamp: kline[0],
      time: new Date(kline[0]).toISOString(),
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));

    let visibleData = chartData;
    if (hideLastCandles) {
      const cut = Math.max(0, chartData.length - Math.max(0, hideCount));
      visibleData = chartData.slice(0, cut);
    }

    const last = (hideLastCandles ? visibleData : chartData)[
      (hideLastCandles ? visibleData : chartData).length - 1
    ];
    const currentPrice = last ? last.close : 0;
    const nextCandleTime = last
      ? new Date(last.timestamp + intervalInfo.ms).toISOString()
      : new Date(Date.now() + intervalInfo.ms).toISOString();

    return NextResponse.json(
      {
        data: visibleData,
        currentPrice,
        nextCandleTime,
        isPartial: hideLastCandles,
        interval: intervalInfo.binance,
        hideCount: hideLastCandles ? Math.max(0, hideCount) : 0,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching chart data:", error);

    // Return mock data if the API fails
    const intervalMs = interval === "15m" ? 15 * 60 * 1000 : 60 * 60 * 1000;
    const limit = limitParam;
    const mockData = Array.from({ length: limit }, (_, i) => {
      const timestamp = Date.now() - (limit - 1 - i) * intervalMs;
      const basePrice = 45000;
      const price =
        basePrice + Math.sin(i / 10) * 2000 + (Math.random() - 0.5) * 1000;

      return {
        timestamp,
        time: new Date(timestamp).toISOString(),
        open: price,
        high: price + Math.random() * 500,
        low: price - Math.random() * 500,
        close: price + (Math.random() - 0.5) * 200,
        volume: Math.random() * 1000000,
      };
    });

    const visible = hideLastCandles
      ? mockData.slice(0, Math.max(0, limit - hideCount))
      : mockData;

    return NextResponse.json(
      {
        data: visible,
        currentPrice: visible[visible.length - 1]?.close || 45000,
        nextCandleTime: new Date(
          (visible[visible.length - 1]?.timestamp || Date.now()) + intervalMs,
        ).toISOString(),
        isPartial: hideLastCandles,
        source: "Mock Data",
        interval: interval === "15m" ? "15m" : "1h",
        hideCount: hideLastCandles ? Math.max(0, hideCount) : 0,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  }
}
