import { Router } from 'express';
import { requireAuth, can } from '../middleware/auth.js';
import { upload, publish } from '../utils/upload.js';
import { wrap } from '../middleware/error.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  can('media'),
  upload.single('image'),
  wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image received' });
    res.status(201).json({ url: await publish(req.file) });
  })
);

export default router;
