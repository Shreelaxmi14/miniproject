import { Router, Response } from 'express';
import QRCode from 'qrcode';
import { db } from '../db.ts';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.ts';
import { recommendEvents } from '../ai_engine.ts';

const router = Router();

// Public highlights for landing page
router.get('/public-highlights', (_req, res) => {
  try {
    const highlights = db.getPublicHighlights();
    return res.json(highlights);
  } catch (err: any) {
    console.error('Error fetching highlights:', err);
    return res.status(500).json({ error: 'Failed to retrieve highlights.' });
  }
});

// Get events list with filters (multi-department, category, status, search, sorting)
router.get('/', (req, res) => {
  try {
    const { departments, category, status, search, sortBy, organizerId } = req.query;

    const deptArray = departments
      ? (typeof departments === 'string' ? departments.split(',') : (departments as string[]))
          .map(d => d.trim())
          .filter(Boolean)
      : undefined;

    let events = db.getEvents({
      departments: deptArray,
      category: category as string,
      status: status as string,
      search: search as string,
      organizerId: organizerId as string
    });

    // Sorting logic
    if (sortBy === 'trending') {
      events.sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0));
    } else if (sortBy === 'rating') {
      events.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    } else {
      // Default: date ascending
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return res.json(events);
  } catch (err: any) {
    console.error('Error fetching events:', err);
    return res.status(500).json({ error: 'Failed to retrieve events.' });
  }
});

// AI Personalized Recommendations for logged-in student
router.get('/recommended', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const allEvents = db.getEvents();

    const recommendations = recommendEvents(
      allEvents,
      user.interests || [],
      user.department || '',
      user.year
    );

    return res.json({
      recommendations,
      studentProfile: {
        department: user.department,
        interests: user.interests,
        year: user.year
      }
    });
  } catch (err: any) {
    console.error('Error generating recommendations:', err);
    return res.status(500).json({ error: 'Failed to compute recommendations.' });
  }
});

// Get single event by ID
router.get('/:id', (req, res) => {
  try {
    const event = db.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const feedbacks = db.getFeedbacks(event._id);
    return res.json({ event, feedbacks });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// Create Event (Organizer or Admin)
router.post('/', authenticate, requireRole(['organizer', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      title,
      description,
      category,
      department,
      date,
      time,
      venue,
      mode,
      poster_url,
      google_form_link,
      payment_link,
      registration_deadline,
      status
    } = req.body;

    if (!title || !description || !category || !date || !time || !venue) {
      return res.status(400).json({ error: 'Missing required event fields.' });
    }

    const newEvent = db.createEvent({
      title,
      description,
      category,
      department: department || user.department,
      date,
      time,
      venue,
      mode: mode || 'offline',
      organizer_id: user._id,
      organizer_name: `${user.name} (${user.department} Lead)`,
      poster_url: poster_url || '/src/assets/images/hackathon_poster_1792854205640.jpg',
      google_form_link: google_form_link || 'https://forms.google.com',
      payment_link: payment_link || '',
      registration_deadline: registration_deadline || date,
      status: status || 'open',
      photos: []
    });

    return res.status(201).json({
      message: 'Event created and students notified matching event categories!',
      event: newEvent
    });
  } catch (err: any) {
    console.error('Error creating event:', err);
    return res.status(500).json({ error: 'Failed to create event.' });
  }
});

// Update Event (Organizer can update own event, Admin can update any)
router.put('/:id', authenticate, requireRole(['organizer', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const existing = db.getEventById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (user.role !== 'admin' && existing.organizer_id !== user._id) {
      return res.status(403).json({ error: 'You are only authorized to edit events created by you.' });
    }

    const updated = db.updateEvent(req.params.id, req.body);
    return res.json({ message: 'Event updated successfully.', event: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update event.' });
  }
});

// Delete Event (Organizer own or Admin)
router.delete('/:id', authenticate, requireRole(['organizer', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const existing = db.getEventById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (user.role !== 'admin' && existing.organizer_id !== user._id) {
      return res.status(403).json({ error: 'You are only authorized to delete your own events.' });
    }

    db.deleteEvent(req.params.id);
    return res.json({ message: 'Event deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// Upload/Add 1-2 event photos after event ends (appears on public carousel)
router.post('/:id/photos', authenticate, requireRole(['organizer', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const { photos } = req.body;
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ error: 'Please provide array of photo URLs.' });
    }

    const updated = db.addEventPhotos(req.params.id, photos);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    return res.json({
      message: 'Recap photos added! They will now appear on the public homepage carousel.',
      event: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to upload event photos.' });
  }
});

// Student Event Registration
router.post('/:id/register', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const result = db.createRegistration(user, req.params.id);

    if (!result.success) {
      return res.status(400).json({ error: result.message, registration: result.registration });
    }

    return res.status(201).json({
      message: 'Registration confirmed successfully!',
      registration: result.registration
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to register for event.' });
  }
});

// Get registered students for an event (Organizer/Admin)
router.get('/:id/registrations', authenticate, requireRole(['organizer', 'admin']), (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const ev = db.getEventById(req.params.id);
    if (!ev) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (user.role !== 'admin' && ev.organizer_id !== user._id) {
      return res.status(403).json({ error: 'Unauthorized to view registrations for this event.' });
    }

    const regs = db.getRegistrations(req.params.id);
    return res.json({ event: ev, registrations: regs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
});

// Submit Feedback & Rating (Student)
router.post('/:id/feedback', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating (1-5) and comment are required.' });
    }

    const fb = db.createFeedback(user, req.params.id, Number(rating), comment);
    return res.status(201).json({
      message: 'Feedback submitted! AI sentiment analysis complete.',
      feedback: fb
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// Get Feedbacks for event
router.get('/:id/feedback', (req, res) => {
  try {
    const fbs = db.getFeedbacks(req.params.id);
    return res.json(fbs);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

// Bookmark / Save to Calendar Toggle (Student)
router.post('/:id/save', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const result = db.toggleSaveEvent(user._id, req.params.id);
    return res.json({
      message: result.saved ? 'Event saved to your calendar!' : 'Event removed from calendar.',
      saved: result.saved
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to toggle event save.' });
  }
});

// Generate QR Code for Event Registration Link
router.get('/:id/qrcode', async (req, res) => {
  try {
    const ev = db.getEventById(req.params.id);
    if (!ev) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const linkToEncode = ev.google_form_link || `https://campusmilan.edu/events/${ev._id}`;
    
    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(linkToEncode, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#312e81', // Deep indigo
        light: '#ffffff'
      }
    });

    return res.json({
      eventId: ev._id,
      title: ev.title,
      link: linkToEncode,
      qrDataUrl
    });
  } catch (err: any) {
    console.error('QR code generation error:', err);
    return res.status(500).json({ error: 'Failed to generate QR code.' });
  }
});

export default router;
