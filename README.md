# Real-Time Event Prediction Market

A real-time event prediction trading platform that enables users to trade on outcomes of global events. The platform features an LLM-based market creation pipeline that detects trending topics and generates new event markets automatically, along with a dynamic pricing engine (LMSR) driven by market sentiment and incoming trade data. Users can track positions, analyze portfolio performance, and trade through a high-density professional dashboard.

---

## Features

### Dynamic Pricing Engine (LMSR)
| Function | Description | Formula |
|----------|-------------|---------|
| **Price Discovery** | Continuous probability via pool ratios | `P(yes) = e^(qYes/B) / (e^(qYes/B) + e^(qNo/B))` |
| **Cost Calculation** | Integral of marginal cost over trade size | `Cost = B·ln(e^(newY/B) + e^(newN/B)) - B·ln(e^(oldY/B) + e^(oldN/B))` |
| **Pool Initialization** | Sets starting liquidity from target probability | `qYes = B·ln(p / (1-p))`, shifted to keep pools positive |
| **Liquidity Parameter** | Controls price sensitivity | `B = 100` (high volatility — prices swing fast) |

### LLM Market Generation Pipeline
- Daily automated scanning of global trends (finance, politics, crypto, tech, sports) via Google Gemini
- Generates structured binary (YES/NO) questions with suggested starting probabilities and volume estimates
- All generated events land in `PENDING` status for human review before going live
- Admin approval initializes LMSR pools and transitions the event to `ACTIVE`
- Reduces manual event creation time by ~90%

### Real-Time WebSocket Layer
- Socket.io server with room-based subscriptions per market
- Clients subscribe only to markets they're actively viewing
- Price updates broadcast on every trade settlement
- Connection state management with auto-reconnect

### Portfolio & Position Tracking
- Live PnL calculation: aggregates all trades per event, evaluates against current probability
- Position-level breakdown: shares held, average entry price, current mark, unrealized PnL
- Cash + equity net worth tracking
- Time-series portfolio history

### Admin Portal
- Three-tab interface: Pending Events, Active Events, User Management
- Approve/reject AI-generated events with one click
- Search and filter across platform users
- Event lifecycle management (`PENDING → ACTIVE → PAUSED → RESOLVED`)

---

## Architecture

### System Overview

```mermaid
graph TB
    subgraph Frontend ["Frontend (React + Vite)"]
        UI[Components] --> Hooks
        Hooks --> API[API Service Layer]
        Hooks --> WS[WebSocket Client]
    end

    subgraph Backend ["Backend (Node.js + Express)"]
        API --> Router[Express Router]
        WS --> SocketIO[Socket.io Server]
        Router --> AuthMW[Auth Middleware]
        AuthMW --> Controllers
        Controllers --> LMSR[LMSR Engine]
        Controllers --> Prisma[Prisma ORM]
    end

    subgraph Data ["Persistence"]
        Prisma --> PG[(PostgreSQL)]
    end

    subgraph Automation ["Autonomous Agent"]
        Cron[node-cron] -->|Daily 00:00 UTC| LLM[Gemini LLM]
        LLM -->|PENDING events| Prisma
    end
```

### Trade Execution Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Express
    participant LMSR
    participant PostgreSQL

    User->>Frontend: Click BUY 10 shares YES
    Frontend->>Express: POST /api/trade
    Express->>Express: Auth middleware (verify user)
    Express->>Express: 1-second settlement delay
    Express->>LMSR: calculateCost(poolYes, poolNo, BUY, YES, 10)
    LMSR-->>Express: cost = $4.72
    Express->>PostgreSQL: BEGIN TRANSACTION
    PostgreSQL-->>Express: User balance check ✓
    Express->>PostgreSQL: INSERT trade record
    Express->>PostgreSQL: UPDATE user balance (-$4.72)
    Express->>PostgreSQL: UPDATE event pools (poolYes += 10)
    Express->>PostgreSQL: UPDATE event probability (recalculated)
    Express->>PostgreSQL: COMMIT
    Express-->>Frontend: { success: true, trade: {...} }
    Frontend->>User: Trade confirmed, UI updated
```

### Event Lifecycle (LLM Pipeline)

```mermaid
stateDiagram-v2
    [*] --> PENDING: Gemini generates event
    PENDING --> ACTIVE: Admin approves
    PENDING --> REJECTED: Admin rejects
    ACTIVE --> PAUSED: Admin pauses trading
    PAUSED --> ACTIVE: Admin resumes trading
    ACTIVE --> CLOSED: Expiration date reached
    CLOSED --> RESOLVED: Admin sets outcome (YES/NO)
    RESOLVED --> [*]: Shares settled at $1 or $0
    REJECTED --> [*]
```

### Database Schema

```mermaid
erDiagram
    User ||--o{ Trade : places
    User ||--o| Portfolio : has
    Event ||--o{ Trade : contains

    User {
        uuid id PK
        string clerkId UK
        string email UK
        float availableFunds
        enum role
    }

    Event {
        uuid id PK
        string question
        string[] categories
        enum status
        float probability
        float totalVolume
        float poolYes
        float poolNo
        datetime expirationDate
        string submittedBy
    }

    Trade {
        uuid id PK
        uuid userId FK
        uuid eventId FK
        enum type
        enum position
        float shares
        float price
        float totalCost
    }

    Portfolio {
        uuid id PK
        uuid userId FK
        float totalValue
        float totalPnL
    }
```

---

## Project Structure

```
Real-Time-Event-Prediction-Market/
│
├── src/                              # React Frontend
│   ├── components/
│   │   ├── market/
│   │   │   ├── PredictionCard.tsx     # Individual market card with live ticker
│   │   │   └── MarketDetailModal.tsx  # Full trade interface modal
│   │   ├── portfolio/
│   │   │   └── PortfolioView.tsx      # PnL dashboard and position tracker
│   │   ├── adminportal/
│   │   │   ├── AdminPortalView.tsx    # Tab container (pending/active/users)
│   │   │   ├── PendingEventsSection.tsx
│   │   │   ├── ActiveEventsSection.tsx
│   │   │   └── UsersSection.tsx
│   │   └── layout/
│   │       └── header/               # Navigation and balance display
│   ├── hooks/
│   │   ├── useMarkets.ts             # Fetches and filters active markets
│   │   ├── usePortfolio.ts           # Live portfolio state
│   │   ├── useTrade.ts               # Trade form logic and execution
│   │   └── useWebSocket.ts           # Socket.io connection management
│   ├── services/
│   │   └── api.ts                    # REST client (market, trade, portfolio, admin)
│   └── types/                        # Strict TypeScript interfaces
│       ├── market.ts
│       ├── trade.ts
│       ├── portfolio.ts
│       ├── admin.ts
│       └── user.ts
│
├── server/                           # Express Backend
│   ├── src/
│   │   ├── index.ts                  # Express + Socket.io + Cron setup
│   │   ├── routes/
│   │   │   ├── market.routes.ts      # GET /api/markets — active events
│   │   │   ├── trade.routes.ts       # POST /api/trade — LMSR execution
│   │   │   ├── portfolio.routes.ts   # GET /api/portfolio — live PnL
│   │   │   └── admin.routes.ts       # Event approval/rejection endpoints
│   │   ├── services/
│   │   │   ├── lmsr.service.ts       # LMSR math: probability, cost, pool init
│   │   │   └── llm.service.ts        # Gemini-powered event generator
│   │   └── middleware/
│   │       └── auth.middleware.ts     # JWT verification + JIT user creation
│   ├── prisma/
│   │   └── schema.prisma             # PostgreSQL schema (4 models, 4 enums)
│   └── docker-compose.yml            # Local PostgreSQL container
│
└── README.md
```

---

## Data Flow

```
Request Lifecycle:

  Browser (React)
      │
      ├── REST: fetch('/api/markets')  ──→  Express Router  ──→  Prisma  ──→  PostgreSQL
      │                                                                           │
      │                                                                     ← JSON response
      │
      └── WS: socket.emit('subscribe_market', id)  ──→  Socket.io Room  ──→  Price broadcasts
                                                                                   │
                                                              ← { marketId, probability, volume }


Trade Settlement:

  POST /api/trade { eventId, type: BUY, position: YES, shares: 10 }
      │
      ├── 1. Auth middleware: verify user, load balance
      ├── 2. Simulated 1-second network settlement delay
      ├── 3. Prisma $transaction begins (atomic lock)
      │      ├── Load event pools (poolYes, poolNo)
      │      ├── LMSR: calculateCost(pools, BUY, YES, 10)  →  cost basis
      │      ├── Verify user.availableFunds >= cost
      │      ├── INSERT Trade record
      │      ├── UPDATE User balance (decrement)
      │      ├── UPDATE Event pools (poolYes += 10)
      │      └── UPDATE Event probability (recalculated via getYesProbability)
      └── 4. Return settled trade object
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL) or a running PostgreSQL instance

### 1. Clone
```bash
git clone https://github.com/SJ-1302/Real-Time-Event-Prediction-Market.git
cd Real-Time-Event-Prediction-Market
```

### 2. Install Dependencies
```bash
npm install
cd server && npm install
```

### 3. Configure Environment
Create `server/.env`:
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://admin:password@localhost:5432/prediction_market?schema=public
GEMINI_API_KEY=your_key_here
```

### 4. Start Database
```bash
cd server
docker compose up -d          # starts PostgreSQL container
npx prisma generate           # generates type-safe client
npx prisma db push            # pushes schema to database
```

### 5. Run
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
npm run dev
```

Dashboard opens at `http://localhost:3000`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/markets` | All active markets, sorted by volume |
| `GET` | `/api/markets/:id` | Single market detail |
| `POST` | `/api/trade` | Execute a trade (BUY/SELL, YES/NO) |
| `GET` | `/api/portfolio` | User's live positions and PnL |
| `GET` | `/api/admin/pending` | All pending AI-generated events |
| `POST` | `/api/admin/approve/:id` | Approve event → ACTIVE |
| `POST` | `/api/admin/reject/:id` | Reject event → REJECTED |

---

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React 18, Vite | Component rendering, hooks-based state |
| Styling | Tailwind CSS, Framer Motion | Dark theme UI, micro-animations |
| Backend | Node.js, Express | REST API, middleware, cron scheduler |
| Real-time | Socket.io | WebSocket price streaming |
| Database | PostgreSQL, Prisma ORM | Relational persistence, atomic transactions |
| AI | Google Gemini SDK | Automated event generation |
| Auth | Clerk (prod) / JIT proxy (dev) | JWT verification, user provisioning |
| Infra | Docker Compose | Local database containerization |

---

## Design Decisions

1. **LMSR over Order Book** — Traditional order books require matching buyers and sellers. LMSR provides guaranteed liquidity: any user can trade at any time, and the price adjusts mathematically based on pool state. No waiting for counterparties.

2. **Atomic Transactions** — Every trade is wrapped in `prisma.$transaction()`. If any step fails (insufficient balance, pool conflict), the entire operation rolls back. This prevents partial state corruption during concurrent trading.

3. **1-Second Settlement Delay** — A deliberate `await delay(1000)` before trade execution simulates real-world clearing latency. This prevents UI from feeling "too instant" and gives users a realistic sense of order processing.

4. **JIT User Creation** — In development, the auth middleware creates a new user with $10,000 on first request. No signup needed for local testing — just start trading.

5. **LLM as Event Source** — Instead of manual event creation, a daily cron job feeds global news context to Gemini and asks for structured prediction market questions. The output goes through admin review before reaching users, keeping quality high while cutting creation effort.

6. **Pool-Based Probability** — The probability displayed on each market card isn't a fixed number — it's computed live from `poolYes` and `poolNo` using the LMSR formula. Every trade shifts the pools, which shifts the probability, which shifts the price for the next trade.

---