"use client";

import { useState, useEffect } from "react";

interface GameResult {
  userChoice: "UP" | "DOWN";
  echoChoice: "UP" | "DOWN";
  actualDirection: "UP" | "DOWN";
  actualChange: number;
  userWins: boolean;
  echoWins: boolean;
}

interface ResultDisplayProps {
  result: GameResult;
  round: number;
  userScore: number;
  echoScore: number;
  onNextRound: () => void;
  isLastRound: boolean;
}

export function ResultDisplay({
  result,
  round,
  userScore,
  echoScore,
  onNextRound,
  isLastRound,
}: ResultDisplayProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (result.userWins) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [result.userWins]);

  const getResultEmoji = () => {
    if (result.userWins && result.echoWins) return "🤝"; // Both correct
    if (result.userWins) return "🎉"; // User wins
    if (result.echoWins) return "🤖"; // Echo wins
    return "😅"; // Both wrong
  };

  const getResultMessage = () => {
    if (result.userWins && result.echoWins) {
      return "Respect! Both the Family and Echo called it right!";
    }
    if (result.userWins) {
      return "🦝 Family Pride! You outsmarted the machine!";
    }
    if (result.echoWins) {
      return "The machine got lucky this time. Stay strong, Family!";
    }
    return "Nobody saw that coming! Even the best can miss sometimes.";
  };

  const formatChange = (change?: number) => {
    const value = Number.isFinite(change as number) ? (change as number) : 0;
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="relative bg-gradient-to-br from-amber-900/30 to-yellow-800/30 rounded-lg p-6 border border-amber-600/40">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-bounce text-6xl absolute top-4 left-4">
            🎉
          </div>
          <div className="animate-bounce text-6xl absolute top-4 right-4 animation-delay-200">
            🎊
          </div>
          <div className="animate-pulse text-4xl absolute bottom-4 left-1/2 transform -translate-x-1/2">
            ⭐
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{getResultEmoji()}</div>
        <h2 className="text-2xl font-bold text-amber-200 mb-2">
          Round {round} Results
        </h2>
        <p className="text-amber-300/90 text-lg">{getResultMessage()}</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="text-amber-200 font-semibold mb-3 text-center">
            📊 What Actually Happened
          </h3>
          <div className="text-center">
            <div
              className={`text-3xl font-bold mb-2 ${
                result.actualDirection === "UP"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {result.actualDirection === "UP" ? "📈 ROSE" : "📉 FELL"}
            </div>
            <div
              className={`text-xl ${
                result.actualChange >= 0 ? "text-green-300" : "text-red-300"
              }`}
            >
              {formatChange(result.actualChange)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 ${
              result.userWins
                ? "bg-green-900/30 border-green-500/50"
                : "bg-gray-800/50 border-gray-600/50"
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-200 mb-2">
                🦝 Your Choice
              </div>
              <div
                className={`text-xl font-bold ${
                  result.userChoice === "UP" ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.userChoice === "UP" ? "📈 RISE" : "📉 FALL"}
              </div>
              <div className="text-sm mt-1">
                {result.userWins ? "✅ Correct!" : "❌ Wrong"}
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 ${
              result.echoWins
                ? "bg-purple-900/30 border-purple-500/50"
                : "bg-gray-800/50 border-gray-600/50"
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-200 mb-2">
                🤖 Echo&apos;s Choice
              </div>
              <div
                className={`text-xl font-bold ${
                  result.echoChoice === "UP" ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.echoChoice === "UP" ? "📈 RISE" : "📉 FALL"}
              </div>
              <div className="text-sm mt-1">
                {result.echoWins ? "✅ Correct!" : "❌ Wrong"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/40 rounded-lg p-4 mb-6">
        <h3 className="text-amber-200 font-semibold mb-3 text-center">
          🏆 Family Scoreboard
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{userScore}</div>
            <div className="text-amber-300">🦝 Family</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {echoScore}
            </div>
            <div className="text-amber-300">🤖 Echo</div>
          </div>
        </div>
      </div>

      <button
        onClick={onNextRound}
        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 px-6 py-4 rounded-lg font-bold text-xl text-black transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        {isLastRound
          ? "🏁 See Final Results"
          : `▶️ Next Round (${round + 1}/5)`}
      </button>

      <div className="mt-4 text-center text-amber-300/60 text-sm">
        &quot;Every round teaches us something. Keep your eyes sharp,
        Family.&quot;
      </div>
    </div>
  );
}
