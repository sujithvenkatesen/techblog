import { Router } from 'express';
import { Category, Tag, Author } from '../models/Taxonomy.js';
import Post from '../models/Post.js';
import { requireAuth, can } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';

const router = Router();

const models = { categories: Category, tags: Tag, authors: Author };
const permFor = (kind) => (kind === 'authors' ? 'authors' : 'taxonomy');

router.param('kind', (req, res, next, kind) => {
  if (!models[kind]) return res.status(404).json({ message: 'Unknown taxonomy' });
  req.Model = models[kind];
  next();
});

// Public: lists (categories include published post counts)
router.get(
  '/:kind',
  wrap(async (req, res) => {
    const items = await req.Model.find().sort('name').lean();
    if (req.params.kind === 'categories') {
      const counts = await Post.aggregate([
        { $match: { status: 'published', publishedAt: { $lte: new Date() } } },
        { $group: { _id: '$category', n: { $sum: 1 } } },
      ]);
      const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
      items.forEach((i) => (i.count = map[String(i._id)] || 0));
    }
    res.json(items);
  })
);

router.post(
  '/:kind',
  requireAuth,
  (req, res, next) => can(permFor(req.params.kind))(req, res, next),
  wrap(async (req, res) => res.status(201).json(await req.Model.create(req.body)))
);

router.put(
  '/:kind/:id',
  requireAuth,
  (req, res, next) => can(permFor(req.params.kind))(req, res, next),
  wrap(async (req, res) => {
    const doc = await req.Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    Object.assign(doc, req.body);
    await doc.save();
    res.json(doc);
  })
);

router.delete(
  '/:kind/:id',
  requireAuth,
  (req, res, next) => can(permFor(req.params.kind))(req, res, next),
  wrap(async (req, res) => {
    const field = { categories: 'category', authors: 'author', tags: 'tags' }[req.params.kind];
    const inUse = await Post.countDocuments({ [field]: req.params.id });
    if (inUse && req.params.kind !== 'tags') {
      return res.status(409).json({ message: `Still used by ${inUse} post(s). Reassign them first.` });
    }
    if (req.params.kind === 'tags') await Post.updateMany({ tags: req.params.id }, { $pull: { tags: req.params.id } });
    await req.Model.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

export default router;
