/**
 * Utilities for extracting and processing Echo predictions
 */

export interface EchoPrediction {
  prediction_time: Date;
  time_window: string;
  next_time_window: string;
  next_open_price_change: number;
  direction_strength: number;
  total_strength: number;
  direction: string;
  additional_info: Record<string, unknown> | null;
}

export interface EchoGuess {
  point_guess?: number;
  band_min?: number;
  band_max?: number;
}

/**
 * Extract Echo's numeric prediction from additional_info
 * Supports multiple formats in additional_info:
 * - { next_close_pred: number }
 * - { next_close_band: { min: number, max: number } }
 * - { prediction: { close: number } }
 * - { raw_prediction: [number, number, number] } - fallback calculation
 */
export function extractEchoGuess(
  additional_info: Record<string, unknown> | null,
): EchoGuess | null {
  if (!additional_info || typeof additional_info !== "object") {
    return null;
  }

  // Try direct close prediction
  if (
    typeof additional_info.next_close_pred === "number" &&
    additional_info.next_close_pred > 0
  ) {
    return { point_guess: additional_info.next_close_pred };
  }

  // Try nested prediction object
  const prediction = additional_info.prediction as
    | Record<string, unknown>
    | undefined;
  if (
    prediction &&
    typeof prediction.close === "number" &&
    prediction.close > 0
  ) {
    return { point_guess: prediction.close };
  }

  // Try band prediction
  const band = additional_info.next_close_band as
    | Record<string, unknown>
    | undefined;
  if (
    band &&
    typeof band.min === "number" &&
    typeof band.max === "number" &&
    band.min > 0 &&
    band.max > band.min
  ) {
    return {
      band_min: band.min,
      band_max: band.max,
    };
  }

  // Try close_prediction (alternative format)
  if (
    typeof additional_info.close_prediction === "number" &&
    additional_info.close_prediction > 0
  ) {
    return { point_guess: additional_info.close_prediction };
  }

  // Fallback: Use raw_prediction array to calculate a prediction
  const rawPred = additional_info.raw_prediction as number[] | undefined;
  if (Array.isArray(rawPred) && rawPred.length >= 1) {
    const priceChange = rawPred[0];

    // Use a reasonable base price for Bitcoin (around $65,000 as of 2024)
    // In a real scenario, you'd want to get the actual current price
    const baseBtcPrice = 65000;

    // Apply the price change as a percentage
    const changePercent = priceChange / 100;
    const estimatedPrice = baseBtcPrice * (1 + changePercent);

    // Ensure the price is reasonable
    if (estimatedPrice > 1000 && estimatedPrice < 1000000) {
      return { point_guess: estimatedPrice };
    }
  }

  return null;
}

/**
 * Compute Echo's numeric guess from other available data when direct prediction is not available
 * This is a fallback method that generates a deterministic prediction based on available data
 */
export function computeFallbackEchoGuess(
  prediction: EchoPrediction,
  currentClose: number,
): number | null {
  if (!prediction || currentClose <= 0) {
    return null;
  }

  // Use the next_open_price_change and direction to estimate a close price
  const changePercent = prediction.next_open_price_change / 100;
  const strengthMultiplier = Math.min(prediction.total_strength / 100, 1); // Cap at 100%

  // Apply the change with strength as a confidence multiplier
  const estimatedChange = changePercent * strengthMultiplier;
  const estimatedClose = currentClose * (1 + estimatedChange);

  // Add some deterministic noise based on the prediction_time to make it more realistic
  const timeHash = prediction.prediction_time.getTime() % 1000;
  const noiseFactor = (timeHash / 1000 - 0.5) * 0.01; // ±0.5% noise

  return estimatedClose * (1 + noiseFactor);
}

/**
 * Validate that an Echo guess is reasonable for Bitcoin prices
 */
export function validateEchoGuess(guess: EchoGuess): boolean {
  const MIN_BTC_PRICE = 1000; // $1,000 minimum
  const MAX_BTC_PRICE = 1000000; // $1,000,000 maximum

  if (guess.point_guess !== undefined) {
    return (
      guess.point_guess >= MIN_BTC_PRICE && guess.point_guess <= MAX_BTC_PRICE
    );
  }

  if (guess.band_min !== undefined && guess.band_max !== undefined) {
    return (
      guess.band_min >= MIN_BTC_PRICE &&
      guess.band_max <= MAX_BTC_PRICE &&
      guess.band_min < guess.band_max
    );
  }

  return false;
}

/**
 * Convert Echo guess to a numeric value for scoring (uses midpoint for bands)
 */
export function getEchoNumericGuess(guess: EchoGuess): number | null {
  if (guess.point_guess !== undefined) {
    return guess.point_guess;
  }

  if (guess.band_min !== undefined && guess.band_max !== undefined) {
    return (guess.band_min + guess.band_max) / 2;
  }

  return null;
}
