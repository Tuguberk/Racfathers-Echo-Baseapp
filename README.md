# MiniKit Template

# Echo vs You - Bitcoin Prediction Game

A web-based game where users compete against an AI model (Echo) to predict Bitcoin closing prices over 10 rounds using historical 3-hour price windows.

## Features

- **10-Round Game**: Each session consists of 10 independent prediction rounds
- **Historical Bitcoin Data**: Uses real 3-hour BTC price segments with timestamps hidden
- **Sequential Reveal**: User guesses first, then Echo's prediction is revealed, finally the true close
- **Two Guess Types**: Point predictions or price bands
- **Deterministic Scoring**: Transparent, reproducible scoring system
- **Responsive Design**: Built with Next.js, React, and Tailwind CSS
- **Interactive Charts**: Price visualization using Recharts

## Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts
- **Cache**: Price data caching with expiration
- **Price Data**: Binance Klines API (free, no API key required)

## Setup Instructions

### 1. Prerequisites

- Node.js 20.17.0 or later
- PostgreSQL database
- No API key required (uses free Binance API)

### 2. Installation

```bash
# Clone and install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 3. Environment Configuration

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pulse_echo_game?schema=public"

# Price Data API (Binance - free, no API key required)
PRICE_API_BASE_URL="https://api.binance.com/api/v3/klines"

# OnchainKit (existing)
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=echo-miniapp
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
```

### 4. Database Setup

```bash
# Run migrations to create tables
npx prisma migrate dev --name initial

# Optional: Seed with sample Echo predictions
# (You'll need to populate the predictions table with your Echo data)
```

### 5. Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
# Game interface at http://localhost:3000/play
```

## Database Schema

### Core Tables

- **`predictions`**: Echo's historical predictions with additional_info containing numeric predictions
- **`game_sessions`**: Game sessions with deterministic seeding
- **`game_rounds`**: Individual rounds with Echo predictions and true closes
- **`game_guesses`**: User guesses (point or band)
- **`price_cache`**: Cached OHLC data to reduce API calls

### Key Fields

- **`predictions.additional_info`**: Should contain Echo's numeric prediction as:
  - `{ "next_close_pred": 65000 }` or
  - `{ "next_close_band": { "min": 64000, "max": 66000 } }` or
  - `{ "prediction": { "close": 65000 } }`

## Game Flow

1. **Session Creation**: Samples 10 non-overlapping historical windows with valid Echo predictions
2. **Round Play**:
   - Display 3-hour chart without timestamps
   - User submits guess (point or band)
   - Reveal Echo's prediction
   - Fetch true close and score round
3. **Scoring**: Closest prediction wins (0 error for bands containing true value)
4. **Session Complete**: Show final score and offer replay

## API Endpoints

- `POST /api/sessions` - Create new game session
- `GET /api/sessions/{id}` - Get session details
- `GET /api/sessions/{id}/rounds` - Get session rounds
- `GET /api/rounds/{id}` - Get round details with chart data
- `POST /api/rounds/{id}/guess` - Submit user guess
- `POST /api/rounds/{id}/score` - Score round and reveal results

## Configuration

### Price Data Adapter

The system now uses Binance Klines API for Bitcoin price data. You can implement your own adapter:

```typescript
interface PriceDataAdapter {
  getOhlcForWindow(targetWindowKey: string): Promise<OHLCData>;
}
```

Default implementation uses Binance API with fallback to mock data. Benefits of Binance API:

- **Free**: No API key required
- **Reliable**: High uptime and performance
- **Accurate**: Real-time and historical Bitcoin/USDT data
- **Rate Limits**: Generous limits for development use

### Game Parameters

- **Round Count**: Configurable (default: 10)
- **Cache Expiry**: 24 hours for price data
- **Exclusion Period**: 7 days (excludes recent predictions to prevent recognition)
- **Price Bounds**: $1,000 - $1,000,000 validation range

## Architecture Highlights

- **Deterministic Sampling**: Session seed ensures reproducible round selection
- **Progressive Disclosure**: Round state prevents premature data access
- **Price Data Caching**: Reduces external API calls and improves performance
- **Type Safety**: Full TypeScript implementation with strict typing
- **Error Handling**: Comprehensive error handling and user feedback

## Future Extensions

- **Multiplayer**: 1v1 duels with shared windows
- **Leagues**: Seasonal rankings and ELO ratings
- **Advanced Scoring**: Band vs point strategy balancing
- **Historical Analysis**: User performance analytics

## Contributing

1. Ensure all TypeScript types are properly defined
2. Add tests for new scoring functions
3. Update API documentation for new endpoints
4. Follow the existing error handling patterns

## License

MIT License - See LICENSE file for details

## Docker

Quick start with Docker:

1. Copy env example

- cp .env.example .env
- Adjust values if needed

2. Build and start

- docker compose up --build

3. Access app

- http://localhost:3000

Notes

- The compose file starts a Postgres 16 instance and the Next.js app.
- Prisma migrations are applied on container start (migrate deploy).
- To seed data, exec into the web container and run: npm run db:seed
