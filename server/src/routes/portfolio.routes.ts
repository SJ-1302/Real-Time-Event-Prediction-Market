import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/portfolio
 * Dynamically evaluates user Trade positions against the current Active Event probabilities
 * to calculate real-time net worth and PnL.
 */
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Fetch user's core portfolio object & aggregate active trades
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id }
    });

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        event: true // Attach the LIVE event probability data
      }
    });

    // 2. Map and aggregate trades into live Position entries
    let totalInvestedValue = 0;
    let currentLiveValue = 0;

    const positionsMap: Record<string, any> = {};

    trades.forEach(trade => {
      // In a robust LMSR system, you sum shares per event and side
      // Then multiply net shares by current Price (Probability)
      if (!positionsMap[trade.eventId]) {
        positionsMap[trade.eventId] = {
           id: trade.id,
           eventId: trade.eventId,
           eventName: trade.event.question,
           type: trade.position,
           shares: 0,
           avgPx: 0,
           currentPx: trade.position === 'YES' ? (trade.event.probability / 100) : ((100 - trade.event.probability) / 100),
           totalCost: 0
        };
      }

      const p = positionsMap[trade.eventId];
      
      if (trade.type === 'BUY') {
         p.shares += trade.shares;
         p.totalCost += trade.totalCost;
      } else {
         p.shares -= trade.shares;
         p.totalCost -= trade.totalCost;
      }
      p.avgPx = p.shares > 0 ? (p.totalCost / p.shares) : 0;
    });

    // Deduce live active positions holding > 0 shares
    const activePositions = Object.values(positionsMap).filter(p => p.shares > 0).map(p => {
       const currentValue = p.shares * p.currentPx;
       const pnl = currentValue - p.totalCost;
       
       totalInvestedValue += p.totalCost;
       currentLiveValue += currentValue;

       return {
         ...p,
         currentValue,
         pnl,
         pnlPercent: p.totalCost > 0 ? (pnl / p.totalCost) * 100 : 0
       };
    });

    // 3. Assemble Frontend-compliant PortfolioObject
    const portfolioResponse = {
      totalValue: user.availableFunds + currentLiveValue, // Cash + Equities
      totalPnL: currentLiveValue - totalInvestedValue, // Live positions performance
      availableFunds: user.availableFunds,
      positions: activePositions,
      history: [
        { date: '2024-01-01', value: 10000 },
        { date: new Date().toISOString().split('T')[0], value: user.availableFunds + currentLiveValue }
      ]
    };

    res.json(portfolioResponse);

  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
