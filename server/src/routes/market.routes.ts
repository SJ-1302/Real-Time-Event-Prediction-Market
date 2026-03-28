import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/markets  (Returns all ACTIVE events, sorted by Volume)
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        totalVolume: 'desc'
      }
    });

    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/markets/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id }
    });
    
    if (!event) return res.status(404).json({ error: 'Market not found' });
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
