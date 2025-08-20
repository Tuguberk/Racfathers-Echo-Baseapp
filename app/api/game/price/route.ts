import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export async function GET() {
  try {
    // Fetch Bitcoin price from Binance Klines API
    // Using 1m interval and limit=1 to get the most recent price data
    const response = await fetch(
      "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1",
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

    // Binance Klines returns an array where each element is:
    // [timestamp, open, high, low, close, volume, close_time, ...]
    // We'll use the close price (index 4) as the current price
    const latestKline = data[0];
    const price = parseFloat(latestKline[4]); // Close price

    return NextResponse.json(
      {
        price,
        source: "Binance",
        timestamp: new Date().toISOString(),
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
    console.error("Error fetching Bitcoin price:", error);

    // Return a mock price if the API fails
    const mockPrice = 45000 + (Math.random() - 0.5) * 2000;
    return NextResponse.json(
      {
        price: Math.round(mockPrice),
        source: "Mock Data",
        timestamp: new Date().toISOString(),
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
