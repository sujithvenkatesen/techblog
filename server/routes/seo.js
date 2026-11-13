import { Router } from 'express';
import Post from '../models/Post.js';
import { Category } from '../models/Taxonomy.js';
import { wrap } from '../middleware/error.js';

const router = Router();
const site = () => (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', '', `Sitemap: ${site()}/sitemap.xml`].join('\n')
  );
});

router.get(
  '/sitemap.xml',
  wrap(async (req, res) => {
    const [posts, cats] = await Promise.all([
      Post.find({ status: 'published', publishedAt: { $lte: new Date() } }).select('slug updatedAt').lean(),
      Category.find().select('slug').lean(),
    ]);
    const urls = [
      { loc: `${site()}/`, priority: '1.0' },
      { loc: `${site()}/articles`, priority: '0.9' },
      { loc: `${site()}/categories`, priority: '0.7' },
      { loc: `${site()}/about`, priority: '0.5' },
      ...cats.map((c) => ({ loc: `${site()}/articles?category=${c.slug}`, priority: '0.6' })),
      ...posts.map((p) => ({ loc: `${site()}/articles/${p.slug}`, lastmod: p.updatedAt.toISOString(), priority: '0.8' })),
    ];
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`)
        .join('\n') +
      `\n</urlset>`;
    res.type('application/xml').send(xml);
  })
);

export default router;
