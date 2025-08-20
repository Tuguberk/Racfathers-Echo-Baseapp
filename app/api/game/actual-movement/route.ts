import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startTime = searchParams.get("startTime");
  const intervalParam = (searchParams.get("interval") || "1h").toLowerCase();
  const mode = (searchParams.get("mode") || "backward").toLowerCase(); // backward (default) | forward
  const count = Math.max(1, parseInt(searchParams.get("count") || "3", 10));

  try {
    if (!startTime) {
      return NextResponse.json(
        { error: "startTime parameter is required" },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }

    const intervalMs =
      intervalParam === "15m" ? 15 * 60 * 1000 : 60 * 60 * 1000; // default 1h
    const startTimestamp = new Date(startTime).getTime();
    const endTimestamp = startTimestamp + intervalMs;

    // Binance klines tuple type (we only use specific indices)
    type BinanceKline = [
      number, // 0: open time (ms)
      string, // 1: open
      string, // 2: high
      string, // 3: low
      string, // 4: close
      string, // 5: volume
      number, // 6: close time (ms)
      ...unknown[],
    ];

    // Helper to build response from a kline array
    const buildResponse = (k: BinanceKline) => {
      const openPrice = parseFloat(k[1]);
      const closePrice = parseFloat(k[4]);
      const priceChange = ((closePrice - openPrice) / openPrice) * 100;
      const actualDirection = priceChange > 0 ? "UP" : "DOWN";
      return {
        startTime: new Date(k[0]).toISOString(),
        endTime: new Date(k[6]).toISOString(),
        openPrice,
        closePrice,
        priceChange: parseFloat(priceChange.toFixed(4)),
        actualDirection,
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
      };
    };

    // Fetch strategy based on mode and count
    const binanceInterval = intervalParam === "15m" ? "15m" : "1h";
    let klines: BinanceKline[] = [];
    let kline: BinanceKline | null = null;
    if (mode === "backward") {
      const rangeStart = startTimestamp - count * intervalMs;
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${binanceInterval}&startTime=${rangeStart}&endTime=${startTimestamp}&limit=${count}`,
        {
          cache: "no-store",
          next: { revalidate: 0 },
          headers: {
            "User-Agent": "echo-miniapp/1.0 (+https://vercel.com)",
            Accept: "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Binance klines request failed: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        klines = data as BinanceKline[];
        kline = klines[0];
      }
    } else {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${binanceInterval}&startTime=${startTimestamp}&endTime=${endTimestamp}&limit=${count}`,
        {
          cache: "no-store",
          next: { revalidate: 0 },
          headers: {
            "User-Agent": "echo-miniapp/1.0 (+https://vercel.com)",
            Accept: "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Binance klines request failed: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        klines = data as BinanceKline[];
        kline = klines[0];
      }
    }

    // If no data, try aligning to the nearest 15m boundary and retry
    if (!kline) {
      const alignedStart = Math.floor(startTimestamp / intervalMs) * intervalMs;
      const alignedEnd = alignedStart + intervalMs;
      const retry = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${binanceInterval}&startTime=${alignedStart}&endTime=${alignedEnd}&limit=${count}`,
        {
          cache: "no-store",
          next: { revalidate: 0 },
          headers: {
            "User-Agent": "echo-miniapp/1.0 (+https://vercel.com)",
            Accept: "application/json",
          },
        },
      );
      const retryData = await retry.json();
      if (Array.isArray(retryData) && retryData.length > 0) {
        const arr = retryData as BinanceKline[];
        klines = arr;
        kline = arr[0] as BinanceKline;
      }
    }

    // As a final attempt, query forward-only to get the next available candle(s)
    if (!kline) {
      const forward = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${binanceInterval}&startTime=${startTimestamp}&limit=${count}`,
        {
          cache: "no-store",
          next: { revalidate: 0 },
          headers: {
            "User-Agent": "echo-miniapp/1.0 (+https://vercel.com)",
            Accept: "application/json",
          },
        },
      );
      const forwardData = await forward.json();
      if (Array.isArray(forwardData) && forwardData.length > 0) {
        klines = forwardData as BinanceKline[];
        kline = klines[0];
      }
    }

    if (kline) {
      if (count <= 1) {
        return NextResponse.json(
          {
            ...buildResponse(kline),
            interval: binanceInterval,
            count,
            mode,
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
      const first = klines[0];
      const last = klines[klines.length - 1];
      const openPrice = parseFloat(first[1]);
      const closePrice = parseFloat(last[4]);
      const priceChange = ((closePrice - openPrice) / openPrice) * 100;
      const actualDirection = priceChange > 0 ? "UP" : "DOWN";
      return NextResponse.json(
        {
          startTime: new Date(first[0]).toISOString(),
          endTime: new Date(last[6]).toISOString(),
          openPrice,
          closePrice,
          priceChange: parseFloat(priceChange.toFixed(4)),
          actualDirection,
          high: Math.max(...klines.map((k) => parseFloat(k[2]))),
          low: Math.min(...klines.map((k) => parseFloat(k[3]))),
          count,
          interval: binanceInterval,
          mode,
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

    // If still nothing, fall back to mock but return 200 to avoid client errors in demo
    const mockChange = (Math.random() - 0.5) * 4; // -2% to +2%
    const mockStartTime = startTime || new Date().toISOString();
    return NextResponse.json(
      {
        startTime: mockStartTime,
        endTime: new Date(
          new Date(mockStartTime).getTime() + intervalMs,
        ).toISOString(),
        openPrice: 45000,
        closePrice: 45000 * (1 + mockChange / 100),
        priceChange: parseFloat(mockChange.toFixed(4)),
        actualDirection: mockChange > 0 ? "UP" : "DOWN",
        high: 45000 * (1 + Math.abs(mockChange) / 100),
        low: 45000 * (1 - Math.abs(mockChange) / 100),
        source: "Mock Data (no kline found)",
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
    console.error("Error fetching actual movement:", error);

    // Return mock data if the API fails
    const mockChange = (Math.random() - 0.5) * 4; // Random change between -2% and +2%
    const mockStartTime = startTime || new Date().toISOString();
    return NextResponse.json(
      {
        startTime: mockStartTime,
        endTime: new Date(
          new Date(mockStartTime).getTime() + 15 * 60 * 1000,
        ).toISOString(),
        openPrice: 45000,
        closePrice: 45000 * (1 + mockChange / 100),
        priceChange: parseFloat(mockChange.toFixed(4)),
        actualDirection: mockChange > 0 ? "UP" : "DOWN",
        high: 45000 * (1 + Math.abs(mockChange) / 100),
        low: 45000 * (1 - Math.abs(mockChange) / 100),
        source: "Mock Data",
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
