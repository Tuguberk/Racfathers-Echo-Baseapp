"use client";

import { useState, useEffect } from "react";

interface FinalResultsProps {
  userScore: number;
  echoScore: number;
  onPlayAgain: () => void;
}

export function FinalResults({
  userScore,
  echoScore,
  onPlayAgain,
}: FinalResultsProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);

  const userWins = userScore > echoScore;
  const isDraw = userScore === echoScore;

  const getTitle = () => {
    if (isDraw) return "🤝 Honor Among Equals";
    if (userWins) return "👑 Family Champion!";
    return "🤖 The Machine Prevails";
  };

  const getMessage = () => {
    if (isDraw) {
      return "A draw between the Family and the machine. Respect earned on both sides.";
    }
    if (userWins) {
      return "Outstanding! You&apos;ve proven that human instinct beats artificial intelligence. The Don would be proud.";
    }
    return "The machine got the better of us this time, but a true raccoon never gives up. Come back stronger, Family.";
  };

  const getEmoji = () => {
    if (isDraw) return "🤝";
    if (userWins) return "🏆";
    return "🤖";
  };

  const getRank = () => {
    if (userScore === 5) return "🦝 Godfather of Predictions";
    if (userScore === 4) return "🎩 Underboss";
    if (userScore === 3) return "💼 Capo";
    if (userScore === 2) return "🔫 Soldier";
    if (userScore === 1) return "👶 Associate";
    return "🤷 Civilian";
  };

  return (
    <div
      className={`bg-gradient-to-br from-amber-900/40 to-yellow-800/40 rounded-lg p-8 border border-amber-600/50 transition-all duration-1000 ${
        showAnimation ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      <div className="text-center mb-8">
        <div className="text-8xl mb-4 animate-bounce">{getEmoji()}</div>
        <h1 className="text-4xl font-bold text-amber-200 mb-4">{getTitle()}</h1>
        <p className="text-amber-300/90 text-lg max-w-md mx-auto">
          {getMessage()}
        </p>
      </div>

      <div className="bg-black/40 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-amber-200 mb-4 text-center">
          🏆 Final Score
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div
            className={`text-center p-4 rounded-lg border-2 ${
              userWins
                ? "bg-green-900/30 border-green-500/50"
                : isDraw
                  ? "bg-yellow-900/30 border-yellow-500/50"
                  : "bg-gray-800/50 border-gray-600/50"
            }`}
          >
            <div className="text-4xl font-bold text-green-400 mb-2">
              {userScore}
            </div>
            <div className="text-amber-300 font-semibold">🦝 Family</div>
            <div className="text-sm text-amber-300/70 mt-1">{getRank()}</div>
          </div>
          <div
            className={`text-center p-4 rounded-lg border-2 ${
              echoScore > userScore
                ? "bg-purple-900/30 border-purple-500/50"
                : isDraw
                  ? "bg-yellow-900/30 border-yellow-500/50"
                  : "bg-gray-800/50 border-gray-600/50"
            }`}
          >
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {echoScore}
            </div>
            <div className="text-amber-300 font-semibold">🤖 Echo AI</div>
            <div className="text-sm text-amber-300/70 mt-1">
              Machine Learning
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-lg p-4 mb-6">
        <h3 className="text-amber-200 font-semibold mb-2 text-center">
          📜 Family Code
        </h3>
        <div className="text-center text-amber-300/80 italic">
          {userWins &&
            `"You showed true family spirit. The market may be unpredictable, but your instincts are sharp."`}
          {isDraw &&
            `"An even match. Both the family wisdom and machine logic have their place."`}
          {!userWins &&
            !isDraw &&
            `"The machine won this round, but remember - we raccoons are survivors. Learn, adapt, and come back stronger."`}
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onPlayAgain}
          className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 px-6 py-4 rounded-lg font-bold text-xl text-black transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          🎮 Challenge the Machine Again
        </button>

        <div className="text-center">
          <div className="text-amber-300/60 text-sm mb-2">
            Share your rank with the Family:
          </div>
          <div className="text-amber-200 font-mono bg-black/30 rounded-lg p-2 text-sm">
            I scored {userScore}/5 as {getRank().split(" ").slice(1).join(" ")}{" "}
            in Bitcoin Echo! 🦝
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-amber-300/60 text-xs">
        &quot;In this family, we stick together through bull markets and bear
        markets.&quot;
      </div>
    </div>
  );
}
