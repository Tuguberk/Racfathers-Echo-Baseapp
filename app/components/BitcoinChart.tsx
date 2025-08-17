"use client";

import { useEffect, useState } from "react";

interface BitcoinChartProps {
  data: Array<{ timestamp: string; price: number }>;
}

export function BitcoinChart({}: BitcoinChartProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    // Fetch current Bitcoin price for display
    const fetchPrice = async () => {
      try {
        const response = await fetch("/api/game/price");
        const priceData = await response.json();
        setCurrentPrice(priceData.price);
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-64 flex items-center justify-center bg-gray-700 rounded-lg">
      <div className="text-center">
        <div className="text-4xl font-bold text-green-400 mb-2">
          ${currentPrice?.toLocaleString() || "Loading..."}
        </div>
        <div className="text-gray-400">Current Bitcoin Price</div>
        <div className="text-sm text-gray-500 mt-4">
          Chart visualization coming soon...
        </div>
      </div>
    </div>
  );
}
