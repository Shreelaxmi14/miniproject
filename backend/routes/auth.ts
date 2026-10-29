import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { authenticate, AuthRequest, generateToken } from '../middleware/auth.ts';

const router = Router();

// Register new student or organizer
router.post('/register', async (req, res) => {
  try {
    const { name, email, usn, password, department, year, interests, role } = req.body;

    if (!name || !email || !usn || !password || !department) {
      return res.status(400).json({ error: 'All fields (Name, Email, USN, Password, Department) are required.' });
    }

    if (db.getUserByEmail(email)) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    if (db.getUserByUSN(usn)) {
      return res.status(400).json({ error: 'An account with this USN already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const assignedRole = role === 'organizer' ? 'organizer' : 'student';

    const newUser = db.createUser({
      name,
      email: email.toLowerCase().trim(),
      usn: usn.toUpperCase().trim(),
      password_hash,
      department,
      year: Number(year) || 1,
      interests: Array.isArray(interests) ? interests : [],
      role: assignedRole,
      active: true
    });

    const token = generateToken(newUser);
    const { password_hash: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login with Email or USN + Password
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier (Email or USN) and password are required.' });
    }

    const user = db.getUserByEmail(identifier) || db.getUserByUSN(identifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact college admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to process login.' });
  }
});

// Fast demo login switcher for instant evaluation testing
router.post('/demo-login', (req, res) => {
  try {
    const { role } = req.body;
    let targetEmail = 'aarav@campusmilan.edu'; // default student

    if (role === 'organizer') {
      targetEmail = 'priya@campusmilan.edu';
    } else if (role === 'admin') {
      targetEmail = 'admin@campusmilan.edu';
    } else if (role === 'student2') {
      targetEmail = 'sneha@campusmilan.edu';
    }

    const user = db.getUserByEmail(targetEmail);
    if (!user) {
      return res.status(404).json({ error: 'Demo user not found.' });
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    return res.json({
      message: `Logged in as demo ${user.role} (${user.name})`,
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Demo login error:', err);
    return res.status(500).json({ error: 'Failed to switch demo account.' });
  }
});

// Get current authenticated user session
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { password_hash: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

export default router;
