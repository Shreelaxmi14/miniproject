import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticate, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get student's calendar (saved events + registered events)
router.get('/calendar', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const saved = db.getSavedEvents(user._id);
    const registrations = db.getRegistrations(undefined, user._id);
    const registeredEventIds = new Set(registrations.map(r => r.event_id));

    const registeredEvents = db.getEvents().filter(e => registeredEventIds.has(e._id));

    // Combine unique events
    const eventMap = new Map<string, any>();
    saved.forEach(e => {
      eventMap.set(e._id, { ...e, isSaved: true, isRegistered: registeredEventIds.has(e._id) });
    });
    registeredEvents.forEach(e => {
      if (eventMap.has(e._id)) {
        eventMap.get(e._id).isRegistered = true;
      } else {
        eventMap.set(e._id, { ...e, isSaved: false, isRegistered: true });
      }
    });

    const calendarItems = Array.from(eventMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return res.json({ calendarItems });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch calendar.' });
  }
});

// Get student's notifications with unread count
router.get('/notifications', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const notifs = db.getNotifications(user._id);
    const unreadCount = notifs.filter(n => !n.read).length;

    return res.json({ notifications: notifs, unreadCount });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// Mark student's notifications as read
router.post('/notifications/read-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    db.markNotificationsRead(user._id);
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to mark notifications.' });
  }
});

// Get student's registrations
router.get('/my-registrations', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const registrations = db.getRegistrations(undefined, user._id);
    const registeredEventIds = new Set(registrations.map(r => r.event_id));
    const events = db.getEvents().filter(e => registeredEventIds.has(e._id));

    return res.json({ registrations, events });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
});

export default router;
