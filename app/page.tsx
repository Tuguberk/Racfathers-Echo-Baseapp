"use client";

import { useState, useEffect } from "react";
import { BitcoinChart } from "./components/BitcoinChart";
import { GuessInput } from "./components/GuessInput";

interface Prediction {
  prediction_time: string;
  next_open_price_change: number;
  direction: string;
  direction_strength: number;
  total_strength: number;
}

interface GameState {
  currentPrediction: Prediction | null;
  currentPrice: number | null;
  userGuess: number | null;
  result: "win" | "lose" | "pending" | null;
  score: number;
  round: number;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentPrediction: null,
    currentPrice: null,
    userGuess: null,
    result: null,
    score: 0,
    round: 1,
  });

  const [loading, setLoading] = useState(false);

  // Fetch a random prediction
  const fetchRandomPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/game/prediction");
      const prediction = await response.json();
      setGameState((prev) => ({
        ...prev,
        currentPrediction: prediction,
        userGuess: null,
        result: null,
      }));
    } catch (error) {
      console.error("Error fetching prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current Bitcoin price
  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch("/api/game/price");
      const data = await response.json();
      setGameState((prev) => ({
        ...prev,
        currentPrice: data.price,
      }));
    } catch (error) {
      console.error("Error fetching Bitcoin price:", error);
    }
  };

  // Handle user guess submission
  const handleGuessSubmit = (guess: number) => {
    if (!gameState.currentPrediction) return;

    const echoGuess = gameState.currentPrediction.next_open_price_change;
    const actualChange = 0; // This would be the actual price change in a real implementation

    // Simple win/lose logic - closer to actual change wins
    const userDistance = Math.abs(guess - actualChange);
    const echoDistance = Math.abs(echoGuess - actualChange);

    const userWins = userDistance < echoDistance;

    setGameState((prev) => ({
      ...prev,
      userGuess: guess,
      result: userWins ? "win" : "lose",
      score: userWins ? prev.score + 1 : prev.score,
    }));
  };

  // Start new round
  const nextRound = () => {
    setGameState((prev) => ({
      ...prev,
      round: prev.round + 1,
    }));
    fetchRandomPrediction();
  };

  // Initialize game
  useEffect(() => {
    fetchRandomPrediction();
    fetchBitcoinPrice();

    // Refresh price every 30 seconds
    const priceInterval = setInterval(fetchBitcoinPrice, 30000);

    return () => clearInterval(priceInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Bitcoin Pulse Game</h1>
          <p className="text-gray-400">
            Predict Bitcoin price changes better than our AI Echo!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Round {gameState.round}
              </h2>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  Score: {gameState.score}
                </div>
                <div className="text-sm text-gray-400">
                  Current BTC: ${gameState.currentPrice?.toLocaleString()}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="mt-4">Loading prediction...</p>
              </div>
            ) : gameState.currentPrediction ? (
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Echos Prediction</h3>
                  <p className="text-lg">
                    Direction:{" "}
                    <span
                      className={`font-bold ${gameState.currentPrediction.direction === "UP" ? "text-green-400" : "text-red-400"}`}
                    >
                      {gameState.currentPrediction.direction}
                    </span>
                  </p>
                  <p>
                    Price Change:{" "}
                    {gameState.currentPrediction.next_open_price_change.toFixed(
                      2,
                    )}
                    %
                  </p>
                  <p className="text-sm text-gray-400">
                    Confidence:{" "}
                    {(
                      gameState.currentPrediction.direction_strength * 100
                    ).toFixed(1)}
                    %
                  </p>
                </div>

                {gameState.result === null && (
                  <GuessInput onGuessSubmit={handleGuessSubmit} />
                )}

                {gameState.result && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Round Result</h3>
                    <p className="text-lg mb-2">
                      You{" "}
                      {gameState.result === "win" ? (
                        <span className="text-green-400 font-bold">WON!</span>
                      ) : (
                        <span className="text-red-400 font-bold">LOST!</span>
                      )}
                    </p>
                    <p>Your guess: {gameState.userGuess}%</p>
                    <p>
                      Echos guess:{" "}
                      {gameState.currentPrediction.next_open_price_change.toFixed(
                        2,
                      )}
                      %
                    </p>

                    <button
                      onClick={nextRound}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Next Round
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p>Failed to load prediction. Please try again.</p>
                <button
                  onClick={fetchRandomPrediction}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Chart Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Bitcoin Price Chart</h2>
            <BitcoinChart data={[]} />
          </div>
        </div>
      </div>
    </div>
  );
}
