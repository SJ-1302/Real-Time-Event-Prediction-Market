import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import { generateTrendingEvents } from './services/llm.service';

import marketRoutes from './routes/market.routes';
import adminRoutes from './routes/admin.routes';
import tradeRoutes from './routes/trade.routes';
import portfolioRoutes from './routes/portfolio.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

export const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/markets', marketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);

io.on('connection', (socket) => {
  socket.on('subscribe_market', (marketId) => {
    socket.join(`market_${marketId}`);
  });
});

cron.schedule('0 0 * * *', async () => {
  await generateTrendingEvents();
});

server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
