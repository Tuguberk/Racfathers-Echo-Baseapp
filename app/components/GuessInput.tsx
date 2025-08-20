"use client";

import { useState } from "react";

interface GuessInputProps {
  onGuessSubmit: (direction: "UP" | "DOWN") => void;
  disabled?: boolean;
  echoDirection?: "UP" | "DOWN";
  echoConfidence?: number;
}

export function GuessInput({
  onGuessSubmit,
  disabled = false,
  echoDirection,
  echoConfidence,
}: GuessInputProps) {
  const [selectedDirection, setSelectedDirection] = useState<
    "UP" | "DOWN" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (direction: "UP" | "DOWN") => {
    if (isSubmitting || disabled) return;

    setIsSubmitting(true);
    setSelectedDirection(direction);
    onGuessSubmit(direction);

    // Reset after a short delay to show the selection
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-amber-600/30">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-amber-200 mb-2">
          🎯 Make Your Move, Family
        </h3>
        <p className="text-amber-300/80 text-sm">
          Will Bitcoin rise or fall in the next 1 hour?
        </p>
      </div>

      {echoDirection && (
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-600/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-purple-200">🤖</span>
            <span className="text-purple-200 font-semibold">
              Echo&apos;s Prediction:
            </span>
          </div>
          <div className="text-center">
            <span
              className={`text-2xl font-bold ${echoDirection === "UP" ? "text-green-400" : "text-red-400"}`}
            >
              {echoDirection === "UP" ? "📈 RISE" : "📉 FALL"}
            </span>
            {echoConfidence && (
              <div className="text-purple-300 text-sm mt-1">
                Confidence: {echoConfidence.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSubmit("UP")}
          disabled={disabled || isSubmitting}
          className={`
            relative p-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105
            ${selectedDirection === "UP" ? "bg-green-600 scale-105" : "bg-green-500/20 hover:bg-green-500/40"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:shadow-green-500/25"}
            border-2 border-green-500/50 text-green-100
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-3xl">📈</span>
            <span>RISE</span>
            <span className="text-sm opacity-75">Bitcoin goes UP</span>
          </div>
          {selectedDirection === "UP" && (
            <div className="absolute inset-0 bg-green-400/20 rounded-lg animate-pulse"></div>
          )}
        </button>

        <button
          onClick={() => handleSubmit("DOWN")}
          disabled={disabled || isSubmitting}
          className={`
            relative p-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105
            ${selectedDirection === "DOWN" ? "bg-red-600 scale-105" : "bg-red-500/20 hover:bg-red-500/40"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:shadow-red-500/25"}
            border-2 border-red-500/50 text-red-100
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <span className="text-3xl">📉</span>
            <span>FALL</span>
            <span className="text-sm opacity-75">Bitcoin goes DOWN</span>
          </div>
          {selectedDirection === "DOWN" && (
            <div className="absolute inset-0 bg-red-400/20 rounded-lg animate-pulse"></div>
          )}
        </button>
      </div>

      {isSubmitting && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-amber-300">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400"></div>
            <span>Processing your choice...</span>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-amber-300/60 text-xs">
        &quot;In this family, everyone&apos;s got an opinion. What&apos;s
        yours?&quot;
      </div>
    </div>
  );
}
