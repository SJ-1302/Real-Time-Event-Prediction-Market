# Optima Markets: AI-Driven Prediction Platform

Optima Markets is a high-fidelity, full-stack prediction market platform designed with a professional "Bloomberg Terminal" aesthetic. It allows users to trade on the outcome of real-world events using an advanced automated market maker (AMM) engine, powered by the Logarithmic Market Scoring Rule (LMSR).

**[View Full System Architecture Documentation](ARCHITECTURE.md)**

---

## 🏛️ Core Features

### 1. High-Fidelity Professional UI
*   **Bloomberg Aesthetic**: Dark-themed, high-density dashboard designed for professional market participants.
*   **Real-Time Subscriptions**: Live price and probability updates via Socket.io.
*   **Dynamic Analytics**: Comprehensive Portfolio and PnL tracking against live market movement.

### 2. Quantitative Trading Engine (LMSR)
*   **Automated Liquidity**: Implements the LMSR cost function for continuous, mathematical probability discovery.
*   **Volatile Liquidity Parameters**: Set with high-swing sensitivity ($B=100$) for rapid price action on global news.
*   **Atomic Settlement**: Secure, transaction-based share distribution with simulated network latency for realism.

### 3. AI-Autonomous Analyst Agent
*   **Trend Scanning**: Daily automated news ingestion using Google Gemini (LLM) to identify emerging global events.
*   **Intelligent Market Creation**: AI-generated market questions with suggested starting probabilities and volume estimations.
*   **Admin Approval Workflow**: Human-in-the-loop lifecycle for vetting AI-proposed events.

---

## 💻 Tech Stack

*   **Frontend**: React 18, Vite, Tailwind CSS, Motion (Framer), React Router 6.
*   **Backend**: Node.js, Express, Socket.io, Node-Cron.
*   **Database**: PostgreSQL, Prisma ORM.
*   **AI**: Google Generative AI (Gemini Flash).
*   **Authentication**: Clerk Auth (Production) / JIT Sandbox Proxy (Development).

---

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Docker (for PostgreSQL) or a local PostgreSQL instance.

### 1. Clone & Install
```bash
git clone https://github.com/SJ-1302/Real-Time-Event-Prediction-Market.git
cd Real-Time-Event-Prediction-Market
npm install
cd server && npm install
```

### 2. Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/db_name?schema=public
GEMINI_API_KEY=your_key_here
SECRET_KEY=sk_test_... # Clerk Secret Key
```

### 3. Database Initialization
```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Direct Launch
**Backend**:
```bash
cd server
npm run dev
```

**Frontend**:
```bash
npm run dev
```

---

## 📈 Trading Logic Highlights (LMSR)
Optima Markets uses a continuous scoring rule to determine prices. Every trade is normalized against the global liquidity pool $B$.
*   **Yes Probability**: $e^{\frac{q_{yes}}{B}} / (e^{\frac{q_{yes}}{B}} + e^{\frac{q_{no}}{B}})$
*   **No Probability**: $1.0 - P(yes)$

---

## 📄 License
MIT License. Built for the future of decentralized and AI-driven predictive analytics. 🚀