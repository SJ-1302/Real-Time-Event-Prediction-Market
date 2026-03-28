import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, requireAuth } from '../middleware/auth.middleware';
import { calculateCost, getYesProbability } from '../services/lmsr.service';

const router = Router();

// Define generic delay utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * POST /api/trade
 * Executes a simulated order against the LMSR protocol with a 1-second simulated network latency.
 */
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { eventId, type, position, shares } = req.body;
    const user = req.user;

    if (!eventId || !type || !position || !shares) {
      return res.status(400).json({ error: 'Missing required trading parameters' });
    }

    // 1. Simulate Network Ledger Settlement Delay (User requirement)
    console.log(`[Trade] Processing ${type} ${shares} shares of ${position} for Event ${eventId}...`);
    await delay(1000); 

    // 2. Wrap trade execution in a Prisma Transaction (Atomic Lock)
    const result = await prisma.$transaction(async (tx) => {
      // Lock the event for concurrent LMSR changes
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event || event.status !== 'ACTIVE') {
        throw new Error("Event is not active or does not exist.");
      }

      // 3. Calculate Dynamic Cost per LMSR
      const costBasis = calculateCost(
        event.poolYes,
        event.poolNo,
        type.toLowerCase() as 'buy' | 'sell',
        position.toLowerCase() as 'yes' | 'no',
        shares
      );

      // 4. Validate Funds
      if (type === 'BUY' && user.availableFunds < costBasis) {
        throw new Error("Insufficient funds to execute trade.");
      }

      // 5. Create Trade Document
      const trade = await tx.trade.create({
        data: {
          userId: user.id,
          eventId: event.id,
          type: type as any,
          position: position as any,
          shares: shares,
          price: costBasis / shares, // Avg execution string
          totalCost: costBasis
        }
      });

      // 6. Update User's Cash Balance
      let fundDelta = type === 'BUY' ? -costBasis : costBasis;
      await tx.user.update({
        where: { id: user.id },
        data: { availableFunds: { increment: fundDelta } }
      });

      // 7. Update Event Liquidity Pools (AMM depth moves)
      let newYesPool = event.poolYes;
      let newNoPool = event.poolNo;
      const shareDelta = type === 'BUY' ? shares : -shares;

      if (position === 'YES') newYesPool += shareDelta;
      else newNoPool += shareDelta;

      const newProbability = getYesProbability(newYesPool, newNoPool) * 100;

      await tx.event.update({
        where: { id: event.id },
        data: {
          poolYes: newYesPool,
          poolNo: newNoPool,
          probability: newProbability,
          totalVolume: { increment: costBasis }
        }
      });

      return trade;
    });

    console.log(`[Trade] Settled successfully in simulated T+1s ledger.`);
    return res.json({ success: true, trade: result });
  } catch (error: any) {
    console.error(`[Trade] Error: `, error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
