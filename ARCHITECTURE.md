# System Architecture: Optima Markets

Optima Markets is a distributed prediction market platform composed of a React-based frontend and a Node.js/Express backend, joined via real-time WebSocket communication and a PostgreSQL persistence layer.

---

## 🏗️ High-Level Design
The system follows a classic **client-server architecture** with specialized modules for market making (LMSR) and autonomous research (LLM Agent).

### 1. Frontend Layer (React & Vite)
*   **Architecture**: Component-based architecture using functional React components and custom hooks for business logic.
*   **State Management**: Localized state management using React Hooks (`useState`, `useMemo`, `useCallback`) ensuring high-performance re-rendering for real-time tickers.
*   **Networking**: Hybrid approach using REST for transactional data (trades, portfolio) and Socket.io for live market probability streaming.
*   **Design System**: Optimized for high-density information display using a "Bloomberg Terminal" aesthetic, leveraging Tailwind CSS for structural layout and Framer Motion for micro-interactions.

### 2. Backend Layer (Node.js & Express)
*   **Routing**: Modular Express router architecture separating `market`, `admin`, `trade`, and `portfolio` domains.
*   **Middlewares**: 
    *   **Authentication**: Multi-tier verification allowing both Clerk JWT validation and a bypassed sandbox mode for local development.
    *   **Transactions**: All trading logic is wrapped in **Prisma Atomic Transactions** (`$transaction`) to ensure data integrity and prevent race conditions during heavy volume.
*   **Database Layer**: PostgreSQL managed via Prisma ORM for type-safe schema migrations and performance optimization.

---

## 📈 Quantitative Trading Engine (LMSR)
The platform utilizes the **Logarithmic Market Scoring Rule (LMSR)** to provide continuous liquidity without requiring an order book.

### Probability Discovery
The price of a share (outcome probability) is calculated by comparing the relative quantities of "Yes" and "No" shares currently held in the event's global liquidity pool:
$$P(yes) = \frac{e^{q_{yes}/B}}{e^{q_{yes}/B} + e^{q_{no}/B}}$$
*Where $B$ is the liquidity parameter controlling price sensitivity.*

### Transaction Fulfillment
When a user places a trade, the system calculates the change in the total cost function. The user pays (or receives) the difference between the post-trade and pre-trade global cost basis:
$$Cost = B \cdot \ln(e^{newQ_{yes}/B} + e^{newQ_{no}/B}) - B \cdot \ln(e^{oldQ_{yes}/B} + e^{oldQ_{no}/B})$$

---

## 🤖 AI Autonomous Analyst
The platform features a native research agent integrated via Google Gemini (LLM).

*   **Generation Pipeline**: A daily `node-cron` daemon triggers a research sweep across global tech, finance, and political trends.
*   **Event Lifecycle**:
    1.  **AI Research**: Agent identifies verifiable outcomes and generates structured event data.
    2.  **Pending Status**: Events are persisted to the database as `PENDING`.
    3.  **Admin Review**: Administrators approve or reject AI-generated markets via the Admin Portal.
    4.  **Market Activation**: Approved markets go `ACTIVE`, initializing their LMSR liquidity pools.

---

## 🗄️ Database Schema
*   **User**: Stores balances, roles, and identity metadata.
*   **Event**: Tracks the core market data (question, status, pool depths, volume, and AI metadata).
*   **Trade**: Logs every individual buy/sell transaction, cost basis, and share count.
*   **Portfolio**: Aggregates live PnL by evaluating user trade history against real-time event probabilities.

---

## 🛠️ Infrastructure & Security
*   **Docker**: Encapsulates the PostgreSQL database environment for consistent cross-machine deployment.
*   **Simulated Latency**: A mandatory 1-second settlement delay is implemented at the API layer to mirror professional network clearing environments.
*   **Real-Time Sync**: Socket.io "rooms" partition data flow so clients only receive updates for the markets they are currently viewing.
