-- CreateTable
CREATE TABLE "public"."Token" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "totalSupply" TEXT,
    "decimals" INTEGER,
    "priceUsd" DOUBLE PRECISION,
    "marketCapUsd" DOUBLE PRECISION,
    "volume24hUsd" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coingeckoId" TEXT,
    "createdAtBlock" INTEGER,
    "description" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "github" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "marketCapRank" INTEGER,
    "twitter" TEXT,
    "website" TEXT,
    "burnedTokensPercent" DOUBLE PRECISION,
    "canBlacklist" BOOLEAN NOT NULL DEFAULT false,
    "canMint" BOOLEAN NOT NULL DEFAULT false,
    "canPause" BOOLEAN NOT NULL DEFAULT false,
    "contractCreator" TEXT,
    "contractSourceCode" TEXT,
    "creationTxHash" TEXT,
    "creatorHoldingPercent" DOUBLE PRECISION,
    "dexListings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "githubForks" INTEGER,
    "githubStars" INTEGER,
    "hasEmergencyStop" BOOLEAN NOT NULL DEFAULT false,
    "hasOwner" BOOLEAN NOT NULL DEFAULT false,
    "holderHistory" JSONB,
    "isProxy" BOOLEAN NOT NULL DEFAULT false,
    "lastCommitDate" TIMESTAMP(3),
    "lastRiskAssessment" TIMESTAMP(3),
    "liquidityLocked" BOOLEAN NOT NULL DEFAULT false,
    "liquidityLockedUntil" TIMESTAMP(3),
    "liquidityUsd" DOUBLE PRECISION,
    "ownerAddress" TEXT,
    "priceChange1h" DOUBLE PRECISION,
    "priceChange24h" DOUBLE PRECISION,
    "priceChange7d" DOUBLE PRECISION,
    "priceHistory" JSONB,
    "redditSubscribers" INTEGER,
    "riskFactors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rugpullRiskScore" DOUBLE PRECISION,
    "telegramMembers" INTEGER,
    "top10HoldersPercent" DOUBLE PRECISION,
    "top50HoldersPercent" DOUBLE PRECISION,
    "totalHolders" INTEGER,
    "tradingVolume1h" DOUBLE PRECISION,
    "twitterFollowers" INTEGER,
    "volumeHistory" JSONB,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."riddle" (
    "id" SERIAL NOT NULL,
    "createDate" TIMESTAMP(6),
    "type" VARCHAR(50),
    "question" TEXT,
    "isFirst" BOOLEAN,
    "isAsked" BOOLEAN,
    "answerTime" TIMESTAMP(6),

    CONSTRAINT "riddle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."riddle_answer" (
    "id" SERIAL NOT NULL,
    "createDate" TIMESTAMP(6),
    "riddleId" INTEGER NOT NULL,
    "answer" TEXT,

    CONSTRAINT "riddle_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."btc_klines" (
    "open_time" TIMESTAMPTZ(6) NOT NULL,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "close" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "close_time" TIMESTAMPTZ(6),
    "quote_asset_volume" DOUBLE PRECISION,
    "number_of_trades" INTEGER,
    "taker_buy_base_asset_volume" DOUBLE PRECISION,
    "taker_buy_quote_asset_volume" DOUBLE PRECISION,

    CONSTRAINT "btc_klines_pkey" PRIMARY KEY ("open_time")
);

-- CreateTable
CREATE TABLE "public"."pulse_predictions" (
    "id" SERIAL NOT NULL,
    "token_address" VARCHAR,
    "token_name" VARCHAR,
    "prediction" INTEGER,
    "probability" DOUBLE PRECISION,
    "features" JSON,
    "created_at" TIMESTAMP(6),
    "model_version" DOUBLE PRECISION,

    CONSTRAINT "pulse_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pulse_users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(64),
    "email" VARCHAR(120),
    "password_hash" VARCHAR(512),
    "is_admin" BOOLEAN,
    "isActive" BOOLEAN,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "pulse_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rug_sherlock_analysis" (
    "id" SERIAL NOT NULL,
    "token_address" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "network" TEXT,
    "token_name" TEXT,
    "last_price" DECIMAL,
    "volume" DECIMAL,
    "price_change_percentage_30d" TEXT,
    "max_drawdown_30d" TEXT,
    "recovery_rate_30d" TEXT,
    "holder_count" INTEGER,
    "coin_id" TEXT,
    "volatility_30d" TEXT,
    "top_5_holders" JSONB,
    "raw_data" JSONB,

    CONSTRAINT "rug_sherlock_analysis_pkey" PRIMARY KEY ("id","timestamp")
);

-- CreateTable
CREATE TABLE "public"."predictions" (
    "prediction_time" TIMESTAMPTZ(3) NOT NULL,
    "time_window" VARCHAR(20) NOT NULL,
    "next_time_window" VARCHAR(20) NOT NULL,
    "next_open_price_change" DOUBLE PRECISION NOT NULL,
    "direction_strength" DOUBLE PRECISION NOT NULL,
    "total_strength" DOUBLE PRECISION NOT NULL,
    "direction" VARCHAR(10) NOT NULL,
    "additional_info" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("prediction_time")
);

-- CreateTable
CREATE TABLE "public"."game_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "seed" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "total_rounds" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_rounds" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "round_index" INTEGER NOT NULL,
    "target_window_key" TEXT NOT NULL,
    "echo_prediction_id" TIMESTAMPTZ(3) NOT NULL,
    "echo_guess" DOUBLE PRECISION,
    "true_close" DOUBLE PRECISION,
    "user_locked" BOOLEAN NOT NULL DEFAULT false,
    "scored" BOOLEAN NOT NULL DEFAULT false,
    "who_won" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_guesses" (
    "id" TEXT NOT NULL,
    "round_id" TEXT NOT NULL,
    "point_guess" DOUBLE PRECISION,
    "band_min" DOUBLE PRECISION,
    "band_max" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_guesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_cache" (
    "target_window_key" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_cache_pkey" PRIMARY KEY ("target_window_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_key" ON "public"."Token"("address");

-- CreateIndex
CREATE INDEX "ix_pulse_predictions_token_address" ON "public"."pulse_predictions"("token_address");

-- CreateIndex
CREATE UNIQUE INDEX "ix_pulse_users_username" ON "public"."pulse_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ix_pulse_users_email" ON "public"."pulse_users"("email");

-- CreateIndex
CREATE INDEX "idx_rug_sherlock_token_address" ON "public"."rug_sherlock_analysis"("token_address");

-- CreateIndex
CREATE INDEX "rug_sherlock_analysis_timestamp_idx" ON "public"."rug_sherlock_analysis"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "game_rounds_session_id_round_index_idx" ON "public"."game_rounds"("session_id", "round_index");

-- CreateIndex
CREATE UNIQUE INDEX "game_guesses_round_id_key" ON "public"."game_guesses"("round_id");

-- CreateIndex
CREATE INDEX "price_cache_cached_at_idx" ON "public"."price_cache"("cached_at");

-- AddForeignKey
ALTER TABLE "public"."riddle_answer" ADD CONSTRAINT "riddle_answer_riddleId_fkey" FOREIGN KEY ("riddleId") REFERENCES "public"."riddle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."game_rounds" ADD CONSTRAINT "game_rounds_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_rounds" ADD CONSTRAINT "game_rounds_echo_prediction_id_fkey" FOREIGN KEY ("echo_prediction_id") REFERENCES "public"."predictions"("prediction_time") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_guesses" ADD CONSTRAINT "game_guesses_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
