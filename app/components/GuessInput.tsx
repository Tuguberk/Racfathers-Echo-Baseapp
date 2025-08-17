"use client";

import { useState } from "react";

interface GuessInputProps {
  onGuessSubmit: (guess: number) => void;
  disabled?: boolean;
}

export function GuessInput({
  onGuessSubmit,
  disabled = false,
}: GuessInputProps) {
  const [guess, setGuess] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || disabled) return;

    const numericGuess = parseFloat(guess);
    if (isNaN(numericGuess)) {
      alert("Please enter a valid number");
      return;
    }

    setIsSubmitting(true);
    onGuessSubmit(numericGuess);
    setGuess("");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <h3 className="font-semibold mb-4">Make Your Prediction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Predicted Price Change (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="e.g., 2.5 or -1.8"
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled || isSubmitting}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Enter a positive number for price increase, negative for decrease
          </p>
        </div>

        <button
          type="submit"
          disabled={disabled || isSubmitting || !guess.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit Guess"}
        </button>
      </form>
    </div>
  );
}
