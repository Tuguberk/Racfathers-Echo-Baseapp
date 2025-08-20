import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";
import { prisma } from "@/lib/prisma";

function normalizeDirection(
  dir: string | null | undefined,
  fallbackChange?: number,
): "UP" | "DOWN" {
  const s = (dir || "").toString().trim().toUpperCase();
  if (
    s === "UP" ||
    s === "RISE" ||
    s === "RISING" ||
    s === "BULL" ||
    s === "BULLISH" ||
    s === "INCREASE"
  ) {
    return "UP";
  }
  if (
    s === "DOWN" ||
    s === "FALL" ||
    s === "FALLING" ||
    s === "BEAR" ||
    s === "BEARISH" ||
    s === "DECREASE"
  ) {
    return "DOWN";
  }
  if (typeof fallbackChange === "number") {
    return fallbackChange >= 0 ? "UP" : "DOWN";
  }
  // Default to DOWN if unknown
  return "DOWN";
}

export async function GET() {
  try {
    // Get a random prediction from the database
    const count = await prisma.predictions.count();
    const skip = Math.floor(Math.random() * count);

    const prediction = await prisma.predictions.findFirst({
      skip,
      select: {
        prediction_time: true,
        next_open_price_change: true,
        direction: true,
        direction_strength: true,
        total_strength: true,
      },
    });

    if (!prediction) {
      return NextResponse.json(
        { error: "No predictions found" },
        {
          status: 404,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );
    }

    return NextResponse.json(
      {
        ...prediction,
        direction: normalizeDirection(
          prediction.direction,
          prediction.next_open_price_change,
        ),
        prediction_time: prediction.prediction_time.toISOString(),
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
    console.error("Error fetching prediction:", error);
    return NextResponse.json(
      { error: "Failed to fetch prediction" },
      {
        status: 500,
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
