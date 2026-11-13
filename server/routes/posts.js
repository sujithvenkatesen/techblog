import { Router } from 'express';
import Post from '../models/Post.js';
import { Category, Tag } from '../models/Taxonomy.js';
import { requireAuth, can } from '../middleware/auth.js';
import { wrap } from '../middleware/error.js';

const router = Router();
const populate = [
  { path: 'category', select: 'name slug shortName' },
  { path: 'author', select: 'name slug role avatar bio' },
  { path: 'tags', select: 'name slug' },
];
const LIST_FIELDS = '-content';
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const liveFilter = () => ({ status: 'published', publishedAt: { $lte: new Date() } });

/* ---------------- Public ---------------- */

router.get(
  '/',
  wrap(async (req, res) => {
    const { category, tag, q, sort = 'latest', featured, page = 1, limit = 9 } = req.query;
    const filter = liveFilter();

    if (category) {
      // supports one or many comma-separated category slugs
      const slugs = String(category).split(',').filter(Boolean);
      const cats = await Category.find({ slug: { $in: slugs } }).select('_id');
      filter.category = { $in: cats.map((c) => c._id) };
    }
    if (tag) {
      const t = await Tag.findOne({ slug: tag }).select('_id');
      filter.tags = t ? t._id : null;
    }
    if (featured === 'true') filter.featured = true;
    if (q) {
      const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ title: rx }, { excerpt: rx }];
    }

    const sortBy = sort === 'popular' ? { views: -1, publishedAt: -1 } : { publishedAt: -1 };
    const p = Math.max(1, Number(page));
    const l = Math.min(30, Math.max(1, Number(limit)));

    const [items, total] = await Promise.all([
      Post.find(filter).select(LIST_FIELDS).populate(populate).sort(sortBy).skip((p - 1) * l).limit(l).lean(),
      Post.countDocuments(filter),
    ]);
    res.json({ items, total, page: p, pages: Math.ceil(total / l) });
  })
);

router.get(
  '/trending',
  wrap(async (req, res) => {
    const items = await Post.find(liveFilter()).select(LIST_FIELDS).populate(populate).sort({ views: -1 }).limit(4).lean();
    res.json(items);
  })
);

/* ---------------- Admin (declared before /:slug) ---------------- */

router.get(
  '/admin/all',
  requireAuth,
  can('posts'),
  wrap(async (req, res) => {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.title = new RegExp(escapeRegex(String(q)), 'i');
    res.json(await Post.find(filter).select(LIST_FIELDS).populate(populate).sort({ updatedAt: -1 }).lean());
  })
);

router.get(
  '/admin/stats',
  requireAuth,
  can('posts'),
  wrap(async (req, res) => {
    const [total, published, drafts, scheduled, featured, agg] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Post.countDocuments({ status: 'scheduled' }),
      Post.countDocuments({ featured: true }),
      Post.aggregate([{ $group: { _id: null, views: { $sum: '$views' } } }]),
    ]);
    const top = await Post.find().select('title slug views').sort({ views: -1 }).limit(5).lean();
    res.json({ total, published, drafts, scheduled, featured, views: agg[0]?.views || 0, top });
  })
);

router.get(
  '/admin/:id',
  requireAuth,
  can('posts'),
  wrap(async (req, res) => {
    const post = await Post.findById(req.params.id).populate(populate).lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  })
);

function applyStatus(body) {
  const data = { ...body };
  if (data.status === 'scheduled') {
    if (!data.scheduledFor) throw Object.assign(new Error('Pick a date to schedule'), { status: 400 });
    data.publishedAt = new Date(data.scheduledFor);
  } else if (data.status === 'published') {
    data.publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
    data.scheduledFor = undefined;
  } else {
    data.scheduledFor = undefined;
  }
  return data;
}

router.post(
  '/',
  requireAuth,
  can('posts'),
  wrap(async (req, res) => {
    const post = await Post.create(applyStatus(req.body));
    res.status(201).json(await post.populate(populate));
  })
);

router.put(
  '/:id',
  requireAuth,
  can('posts'),
  wrap(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    Object.assign(post, applyStatus(req.body));
    await post.save();
    res.json(await post.populate(populate));
  })
);

router.patch(
  '/:id/featured',
  requireAuth,
  can('posts'),
  wrap(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.featured = !post.featured;
    await post.save();
    res.json({ featured: post.featured });
  })
);

router.delete(
  '/:id',
  requireAuth,
  can('posts'),
  wrap(async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

/* ---------------- Public detail ---------------- */

router.get(
  '/:slug',
  wrap(async (req, res) => {
    const post = await Post.findOneAndUpdate({ slug: req.params.slug, ...liveFilter() }, { $inc: { views: 1 } }, { new: true })
      .populate(populate)
      .lean();
    if (!post) return res.status(404).json({ message: 'Article not found' });

    const [related, prev, next] = await Promise.all([
      Post.find({ ...liveFilter(), category: post.category._id, _id: { $ne: post._id } })
        .select(LIST_FIELDS).populate(populate).sort({ publishedAt: -1 }).limit(3).lean(),
      Post.findOne({ ...liveFilter(), publishedAt: { $lt: post.publishedAt } }).select('title slug featuredImage').sort({ publishedAt: -1 }).lean(),
      Post.findOne({ ...liveFilter(), publishedAt: { $gt: post.publishedAt } }).select('title slug featuredImage').sort({ publishedAt: 1 }).lean(),
    ]);
    res.json({ post, related, prev, next });
  })
);

export default router;
