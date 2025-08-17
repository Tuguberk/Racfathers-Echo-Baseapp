/*
  Warnings:

  - The primary key for the `predictions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `game_guesses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_rounds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `price_cache` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."game_guesses" DROP CONSTRAINT "game_guesses_round_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_rounds" DROP CONSTRAINT "game_rounds_echo_prediction_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_rounds" DROP CONSTRAINT "game_rounds_session_id_fkey";

-- AlterTable
ALTER TABLE "public"."predictions" DROP CONSTRAINT "predictions_pkey",
ALTER COLUMN "prediction_time" SET DATA TYPE TIMESTAMPTZ(6),
ADD CONSTRAINT "predictions_pkey" PRIMARY KEY ("prediction_time");

-- DropTable
DROP TABLE "public"."game_guesses";

-- DropTable
DROP TABLE "public"."game_rounds";

-- DropTable
DROP TABLE "public"."game_sessions";

-- DropTable
DROP TABLE "public"."price_cache";
