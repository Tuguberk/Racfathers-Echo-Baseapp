import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...prediction,
      prediction_time: prediction.prediction_time.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return NextResponse.json(
      { error: "Failed to fetch prediction" },
      { status: 500 },
    );
  }
}
