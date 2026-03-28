import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

// We extend Express Request to include our User context
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware: Bypass Auth
 * As requested, this bypasses the strict @clerk/express JWT verification.
 * Instead, it reads a 'x-user-id' header or defaults to a mock JIT user for local testing.
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clerkId = req.headers['x-user-id'] as string || 'test_user_123';

    // JIT: Find or create the user in Prisma
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
       console.log(`[Auth Proxy] JIT Creating new User record for: ${clerkId}`);
       user = await prisma.user.create({
         data: {
           clerkId,
           email: `${clerkId}@mock.com`,
           role: 'USER',
           availableFunds: 10000.0 // Mock $10k starting funds
         }
       });
       
       // Create initial empty portfolio mapping
       await prisma.portfolio.create({
         data: {
           userId: user.id
         }
       });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Proxy] Failed to establish JIT context: ', err);
    res.status(500).json({ error: 'Internal Auth Error' });
  }
};
