import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.ts';

const router = Router();

// Middleware: all routes here require admin role
router.use(authenticate, requireRole(['admin']));

// Get college-wide analytics
router.get('/analytics', (_req: AuthRequest, res: Response) => {
  try {
    const analytics = db.getAnalytics();
    return res.json(analytics);
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
});

// List all users
router.get('/users', (_req: AuthRequest, res: Response) => {
  try {
    const users = db.getUsers().map(u => {
      const { password_hash: _, ...safeUser } = u;
      return safeUser;
    });
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// Toggle user active status
router.post('/users/:id/toggle-status', (req: AuthRequest, res: Response) => {
  try {
    const targetUser = db.getUserById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (targetUser.role === 'admin' && targetUser._id === req.user?._id) {
      return res.status(400).json({ error: 'Cannot deactivate your own administrator account.' });
    }

    const updated = db.updateUser(targetUser._id, { active: !targetUser.active });
    return res.json({
      message: `User ${updated?.active ? 'activated' : 'deactivated'} successfully.`,
      user: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to toggle user status.' });
  }
});

// Moderate / Approve event
router.post('/events/:id/moderate', (req: AuthRequest, res: Response) => {
  try {
    const { approved } = req.body;
    const updated = db.updateEvent(req.params.id, { approved: Boolean(approved) });
    if (!updated) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    return res.json({ message: 'Event status updated.', event: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to moderate event.' });
  }
});

// Get all feedback across college
router.get('/feedback', (_req: AuthRequest, res: Response) => {
  try {
    const feedbacks = db.getFeedbacks();
    return res.json(feedbacks);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

export default router;
