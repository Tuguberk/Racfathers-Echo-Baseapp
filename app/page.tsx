"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";

import { useState, useEffect, useCallback } from "react";
import { BitcoinChart } from "./components/BitcoinChart";
import { GuessInput } from "./components/GuessInput";
import { ResultDisplay } from "./components/ResultDisplay";
import { FinalResults } from "./components/FinalResults";

interface Prediction {
  prediction_time: string;
  next_open_price_change: number;
  direction: string;
  direction_strength: number;
  total_strength: number;
}

interface GameRoundData {
  prediction: Prediction;
  nextCandleTime: string;
  currentPrice: number;
}

interface GameResult {
  userChoice: "UP" | "DOWN";
  echoChoice: "UP" | "DOWN";
  actualDirection: "UP" | "DOWN";
  actualChange: number;
  userWins: boolean;
  echoWins: boolean;
}

type GamePhase = "loading" | "prediction" | "waiting" | "result" | "final";

interface GameState {
  phase: GamePhase;
  round: number;
  userScore: number;
  echoScore: number;
  currentRound: GameRoundData | null;
  currentResult: GameResult | null;
  userChoice: "UP" | "DOWN" | null;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    phase: "loading",
    round: 1,
    userScore: 0,
    echoScore: 0,
    currentRound: null,
    currentResult: null,
    userChoice: null,
  });

  const [loading, setLoading] = useState(false);

  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
      sdk.actions.ready();
    }
  }, [isFrameReady, setFrameReady]);

  // Fetch a random prediction for the current round
  const startNewRound = async () => {
    setLoading(true);
    setGameState((prev) => ({
      ...prev,
      phase: "loading",
      currentResult: null,
      userChoice: null,
    }));

    try {
      const response = await fetch("/api/game/prediction", {
        cache: "no-store",
      });
      const prediction = await response.json();

      setGameState((prev) => ({
        ...prev,
        currentRound: {
          prediction,
          nextCandleTime: prediction.prediction_time,
          currentPrice: 0,
        },
        phase: "prediction",
      }));
    } catch (error) {
      console.error("Error fetching prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle chart ready callback
  const handleChartReady = useCallback(
    (nextCandleTime: string, currentPrice: number) => {
      setGameState((prev) => ({
        ...prev,
        currentRound: prev.currentRound
          ? {
              ...prev.currentRound,
              nextCandleTime,
              currentPrice,
            }
          : prev.currentRound,
      }));
    },
    [],
  );

  // Handle user guess submission
  const handleGuessSubmit = (userChoice: "UP" | "DOWN") => {
    if (!gameState.currentRound) return;

    setGameState((prev) => ({
      ...prev,
      userChoice,
      phase: "waiting",
    }));

    // Simulate waiting for the next candle (in real app, this would be 1 hour)
    setTimeout(() => {
      fetchActualMovement(userChoice);
    }, 2000); // 2 seconds for demo
  };

  // Fetch the actual price movement
  const fetchActualMovement = async (userChoice: "UP" | "DOWN") => {
    if (!gameState.currentRound) return;

    try {
      // Use the prediction time as the start anchor and 1h interval for actual movement
      const startTime = gameState.currentRound.prediction.prediction_time;
      const response = await fetch(
        `/api/game/actual-movement?startTime=${encodeURIComponent(startTime)}&interval=1h&mode=forward&count=1`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error(`actual-movement ${response.status}`);
      }
      const actualData = await response.json();

      const echoChoice = gameState.currentRound.prediction.direction as
        | "UP"
        | "DOWN";
      const actualDirection = actualData.actualDirection as "UP" | "DOWN";

      const userWins = userChoice === actualDirection;
      const echoWins = echoChoice === actualDirection;

      const result: GameResult = {
        userChoice,
        echoChoice,
        actualDirection,
        actualChange:
          typeof actualData.priceChange === "number"
            ? actualData.priceChange
            : 0,
        userWins,
        echoWins,
      };

      setGameState((prev) => ({
        ...prev,
        currentResult: result,
        userScore: prev.userScore + (userWins ? 1 : 0),
        echoScore: prev.echoScore + (echoWins ? 1 : 0),
        phase: "result",
      }));
    } catch (error) {
      console.error("Error fetching actual movement:", error);
      // For demo, create a random result
      const actualDirection = Math.random() > 0.5 ? "UP" : "DOWN";
      const actualChange = (Math.random() - 0.5) * 4;
      const echoChoice = gameState.currentRound.prediction.direction as
        | "UP"
        | "DOWN";

      const userWins = userChoice === actualDirection;
      const echoWins = echoChoice === actualDirection;

      const result: GameResult = {
        userChoice,
        echoChoice,
        actualDirection,
        actualChange,
        userWins,
        echoWins,
      };

      setGameState((prev) => ({
        ...prev,
        currentResult: result,
        userScore: prev.userScore + (userWins ? 1 : 0),
        echoScore: prev.echoScore + (echoWins ? 1 : 0),
        phase: "result",
      }));
    }
  };

  // Handle next round
  const handleNextRound = () => {
    if (gameState.round >= 5) {
      setGameState((prev) => ({ ...prev, phase: "final" }));
    } else {
      setGameState((prev) => ({
        ...prev,
        round: prev.round + 1,
        phase: "loading",
        currentRound: null,
        currentResult: null,
        userChoice: null,
      }));
      startNewRound();
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      phase: "loading",
      round: 1,
      userScore: 0,
      echoScore: 0,
      currentRound: null,
      currentResult: null,
      userChoice: null,
    });
    startNewRound();
  };

  // Initialize game
  useEffect(() => {
    startNewRound();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-amber-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-800/50 to-yellow-600/50 border-b border-amber-600/30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-amber-200 mb-2">
              🦝 Bitcoin Echo Predict Game 🔮
            </h1>
            <p className="text-amber-300/90 text-lg">
              &quot;In this family, we predict together, we win together&quot;
            </p>
            <div className="mt-4 flex justify-center items-center space-x-6">
              <div className="bg-black/30 px-4 py-2 rounded-lg">
                <span className="text-amber-200 font-semibold">Round: </span>
                <span className="text-white">{gameState.round}/5</span>
              </div>
              <div className="bg-green-900/30 px-4 py-2 rounded-lg">
                <span className="text-green-200 font-semibold">
                  🦝 Family:{" "}
                </span>
                <span className="text-white">{gameState.userScore}</span>
              </div>
              <div className="bg-purple-900/30 px-4 py-2 rounded-lg">
                <span className="text-purple-200 font-semibold">🤖 Echo: </span>
                <span className="text-white">{gameState.echoScore}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {gameState.phase === "final" ? (
          <FinalResults
            userScore={gameState.userScore}
            echoScore={gameState.echoScore}
            onPlayAgain={resetGame}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Panel */}
            <div>
              <BitcoinChart
                gameRound={gameState.round}
                onChartReady={handleChartReady}
                showPartialData={gameState.phase === "prediction"}
                anchorEndTime={
                  gameState.currentRound?.prediction.prediction_time
                }
                interval="1h"
                hideCount={3}
              />
            </div>

            {/* Game Panel */}
            <div>
              {gameState.phase === "loading" || loading ? (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 border border-amber-600/30">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-6"></div>
                    <h3 className="text-2xl font-bold text-amber-200 mb-2">
                      Preparing Round {gameState.round}
                    </h3>
                    <p className="text-amber-300/80">
                      The Don is consulting the charts...
                    </p>
                  </div>
                </div>
              ) : gameState.phase === "prediction" && gameState.currentRound ? (
                <GuessInput
                  onGuessSubmit={handleGuessSubmit}
                  echoDirection={
                    gameState.currentRound.prediction.direction as "UP" | "DOWN"
                  }
                  echoConfidence={
                    gameState.currentRound.prediction.total_strength
                  }
                />
              ) : gameState.phase === "waiting" ? (
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-8 border border-blue-600/30">
                  <div className="text-center">
                    <div className="text-6xl mb-4">⏰</div>
                    <h3 className="text-2xl font-bold text-blue-200 mb-4">
                      Waiting for the Market
                    </h3>
                    <p className="text-blue-300/80 mb-4">
                      Your choice:{" "}
                      <span
                        className={`font-bold ${
                          gameState.userChoice === "UP"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {gameState.userChoice === "UP" ? "📈 RISE" : "📉 FALL"}
                      </span>
                    </p>
                    <div className="flex justify-center">
                      <div className="animate-pulse bg-blue-500/20 rounded-lg px-4 py-2">
                        Getting real market data...
                      </div>
                    </div>
                  </div>
                </div>
              ) : gameState.phase === "result" && gameState.currentResult ? (
                <ResultDisplay
                  result={gameState.currentResult}
                  round={gameState.round}
                  userScore={gameState.userScore}
                  echoScore={gameState.echoScore}
                  onNextRound={handleNextRound}
                  isLastRound={gameState.round >= 5}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-amber-600/30 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-amber-300/60 text-sm">
            🦝 &quot;Family business is about trust, loyalty, and knowing when
            to hold &apos;em or fold &apos;em.&quot;
          </p>
        </div>
      </footer>
    </div>
  );
}
