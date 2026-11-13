import { Router } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { requireAuth, adminOnly } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';

const router = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, permissions: u.permissions });

router.post(
  '/login',
  limiter,
  wrap(async (req, res) => {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matches(String(password || '')))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  })
);

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

// Admin-managed staff accounts (permissions per user)
router.get('/users', requireAuth, adminOnly, wrap(async (req, res) => res.json(await User.find().sort('name'))));

router.post(
  '/users',
  requireAuth,
  adminOnly,
  wrap(async (req, res) => {
    const { name, email, password, role, permissions } = req.body;
    const user = await User.create({ name, email, password, role, permissions });
    res.status(201).json(publicUser(user));
  })
);

router.delete(
  '/users/:id',
  requireAuth,
  adminOnly,
  wrap(async (req, res) => {
    if (String(req.user._id) === req.params.id) return res.status(400).json({ message: 'You cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
