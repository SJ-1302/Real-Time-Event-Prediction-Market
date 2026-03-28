# Optima Markets: Real-Time Event Prediction Platform

Built a high-fidelity prediction market platform for trading on real-time global events, implementing an advanced **Logarithmic Market Scoring Rule (LMSR)** engine to enable continuous automated liquidity and probability discovery for retail and institutional participants.

## Features

### LMSR Quantitative Trading Engine
- **Continuous Liquidity**: Mathematical AMM ensuring orders can always be filled without an order book.
- **Dynamic Probability Discovery**: Real-time price adjustments based on global pool depth ($B$ factor).
- **Atomic Trade Settlement**: Single-transaction buy/sell executions with simulated network latency.

### AI Autonomous Analyst Agent
- **Trend Ingestion**: Daily scanning of finance, politics, and tech news via **Google Gemini (LLM)**.
- **Autonomous Market Creation**: Generates verifiable binary questions with suggested starting probabilities.
- **Admin Governance**: Lifecycle management for vetting, approving, or rejecting AI-proposed markets.

### Interactive Dashboard (3 Unified Views)
1. **Market Explorer** — Live event cards with Bloomberg-style aesthetics and real-time tickers.
2. **Portfolio Analytics** — Live PnL tracking, balance management, and trade history.
3. **Admin Portal** — Full-stack management of the event pipeline and platform user base.

---

## 🏗️ Architecture

### System Data Flow
```mermaid
graph TD
    subgraph Frontend
    RC[React Components] --> hooks[Custom Hooks: useMarkets/usePortfolio]
    hooks --> API[API Service: fetch/Socket.io]
    end

    subgraph Backend
    API --> Express[Express Server]
    Express --> Auth[Auth Middleware]
    Auth --> Routes[Route Controllers]
    Routes --> LMSR[LMSR Math Logic]
    end

    subgraph Persistence
    LMSR --> Prisma[Prisma ORM]
    Prisma --> PG[(PostgreSQL)]
    end

    subgraph Automation
    Cron[Node-Cron Scheduler] --> Gemini[Gemini AI Agent]
    Gemini --> Routes
    end
```

### Directory Structure
```
Real-Time-Event-Prediction-Market/
├── server/                    # Express Backend
│   ├── src/
│   │   ├── routes/            # Market, Trade, Admin, Portfolio
│   │   ├── services/          # LMSR Engine, LLM Agent
│   │   └── middleware/        # Auth Interceptors
│   └── prisma/                # DB Schema & Migrations
├── src/                       # React Frontend
│   ├── components/            # Bloomberg-style UI modules
│   ├── hooks/                 # Data Fetching & WebSockets
│   ├── services/              # API Client Logic
│   └── types/                 # Strict TypeScript Definitions
└── README.md                  # This file
```

---

## 📈 Quantitative Engine: LMSR Math

### Probability Calculation
The system calculates the real-time probability of a "YES" outcome by evaluating the relative volume of shares in each pool:

$$P(yes) = \frac{e^{poolYes / B}}{e^{poolYes / B} + e^{poolNo / B}}$$

| Variable | Description | Value |
|-------|-------------|---------|
| **Pool (Yes/No)** | Current total shares held in the pool | Dynamic |
| **B parameter** | Liquidity depth/sensitivity | **100.0 (High Volatility)** |

### Cost Function
The cost for a user to buy $N$ shares is the difference in the global cost function before and after the trade:

$$Cost = B \cdot \ln(e^{newYes / B} + e^{newNo / B}) - B \cdot \ln(e^{oldYes / B} + e^{oldNo / B})$$

---

## 🚀 Quick Start

### 1. Configure Environment
Create `server/.env` with your credentials:
```env
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
GEMINI_API_KEY=your_key
```

### 2. Initialize Backend
```bash
cd server
npm install
npx prisma generate
npm run dev
```

### 3. Launch Frontend
```bash
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, Vite, Framer Motion |
| **Styling** | Vanilla CSS + Tailwind |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL, Prisma |
| **Real-time** | Socket.io |
| **AI Agent** | Google Gemini SDK |

---

## Key Design Decisions

1. **Bloomberg Terminal Aesthetics**: High-density information display using a dark, premium color palette and condensed typography for a professional feel.
2. **Deterministic Pricing**: Abandoning traditional order books for an LMSR-based AMM to ensure instant liquidity regardless of trade size.
3. **Simulated Settlement**: Mandatory 1-second delay implemented on the backend to simulate realistic clearinghouse settlement times.
4. **Just-In-Time User Creation**: Sandbox auth middleware that seeds a $10,000 test account automatically for local evaluation.
5. **AI-First Generation**: An autonomous cron loop that identified trending global news and populates the market list without manual intervention.

---