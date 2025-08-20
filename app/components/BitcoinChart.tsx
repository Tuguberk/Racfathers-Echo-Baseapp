"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ChartDataPoint {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BitcoinChartProps {
  gameRound?: number;
  onChartReady?: (nextCandleTime: string, currentPrice: number) => void;
  showPartialData?: boolean;
  anchorEndTime?: string | number; // prediction_time to sync chart
  interval?: "1h" | "15m";
  hideCount?: number; // how many candles to hide from the end
}

export function BitcoinChart({
  gameRound = 1,
  onChartReady,
  showPartialData = false,
  anchorEndTime,
  interval = "1h",
  hideCount = 3,
}: BitcoinChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [nextCandleTime, setNextCandleTime] = useState<string>("");

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("interval", interval);
        params.append("limit", "60");
        // Resolve end time: always include the next hidden candles window so that we can reveal later
        if (anchorEndTime) {
          const intervalMs =
            interval === "15m" ? 15 * 60 * 1000 : 60 * 60 * 1000;
          const base =
            typeof anchorEndTime === "string"
              ? new Date(anchorEndTime).getTime()
              : anchorEndTime;
          const endTimeMs = base + hideCount * intervalMs;
          params.append("endTime", String(endTimeMs));
        }
        if (showPartialData) params.append("hideLastCandles", "true");
        if (showPartialData) params.append("hideCount", String(hideCount));

        const query = params.toString();
        const url = query
          ? `/api/game/chart-data?${query}`
          : "/api/game/chart-data";
        const response = await fetch(url, { cache: "no-store" });
        const data = await response.json();

        setChartData(data.data || []);
        setCurrentPrice(data.currentPrice);
        setNextCandleTime(data.nextCandleTime);

        if (onChartReady) {
          onChartReady(data.nextCandleTime, data.currentPrice);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [
    gameRound,
    showPartialData,
    onChartReady,
    anchorEndTime,
    interval,
    hideCount,
  ]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTooltipTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gradient-to-br from-amber-900/20 to-yellow-800/20 rounded-lg border border-amber-700/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">The Don&apos;s charts are loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-900/20 to-yellow-800/20 rounded-lg p-4 border border-amber-700/30">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-amber-200 mb-1">
            🦝 Family Charts - {interval.toUpperCase()} Intervals
          </h3>
          <p className="text-amber-300/80 text-sm">
            {showPartialData
              ? "Past data (last hour hidden)"
              : "Live market data"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            {formatPrice(currentPrice || 0)}
          </div>
          <div className="text-amber-300/60 text-sm">Current BTC</div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#d97706"
              opacity={0.2}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#f59e0b"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 200", "dataMax + 200"]}
              tickFormatter={(value) =>
                `$${Math.round(value).toLocaleString()}`
              }
              stroke="#f59e0b"
              fontSize={12}
            />
            <Tooltip
              labelFormatter={(timestamp) =>
                formatTooltipTime(Number(timestamp))
              }
              formatter={(value: number, name: string) => [
                formatPrice(value),
                name === "close" ? "Price" : name,
              ]}
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                border: "1px solid #d97706",
                borderRadius: "8px",
                color: "#f59e0b",
              }}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                stroke: "#22c55e",
                strokeWidth: 2,
                fill: "#16a34a",
              }}
            />
            {showPartialData && (
              <ReferenceLine
                x={chartData[chartData.length - 1]?.timestamp}
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showPartialData && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <p className="text-red-200 text-sm flex items-center">
            <span className="mr-2">⚠️</span>
            <span>
              The last {hideCount} candles are hidden. Predict what happens next
              at{" "}
              <span className="font-mono font-bold">
                {new Date(nextCandleTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
