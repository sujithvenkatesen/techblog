
import { Category, Tag, Author } from '../models/Taxonomy.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { categories, authors, tags, posts } from './data.js';

async function ensureTaxonomy() {
  const models = [
    { Model: Category, items: categories },
    { Model: Tag, items: tags.map((name) => ({ name })) },
    { Model: Author, items: authors },
  ];

  for (const { Model, items } of models) {
    for (const item of items) {
      const slug = item.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const insertFields = { ...item };
      delete insertFields.slug;

      await Model.updateOne(
        { name: item.name },
        {
          $setOnInsert: insertFields,
          $set: { slug },
        },
        { upsert: true }
      );
    }
  }

  console.log('[seed] taxonomy created or updated');
}

export async function seedAdmin() {
  if ((await User.countDocuments()) > 0) return;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be configured before creating the admin user.'
    );
  }

  await User.create({
    name: process.env.ADMIN_NAME || 'Site Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    permissions: ['posts', 'media', 'taxonomy', 'authors', 'users'],
  });

  console.log(`[seed] admin created: ${adminEmail}`);
}

export async function seedAll() {
  await ensureTaxonomy();
  await seedAdmin();

  if ((await Post.countDocuments()) > 0) return;

  const cats = Object.fromEntries(
    (await Category.find()).map((c) => [c.name, c._id])
  );

  const auths = Object.fromEntries(
    (await Author.find()).map((a) => [a.name, a._id])
  );

  const tagDocs = Object.fromEntries(
    (await Tag.find()).map((t) => [t.name, t._id])
  );

  for (const p of posts) {
    const {
      daysAgo,
      category,
      author,
      tags: tagNames,
      ...rest
    } = p;

    await Post.create({
      ...rest,
      category: cats[category],
      author: auths[author],
      tags: tagNames.map((name) => tagDocs[name]).filter(Boolean),
      status: 'published',
      publishedAt: new Date(Date.now() - daysAgo * 86400000),
      seoTitle: `${rest.title} | Blockwise Tech Blog`,
      metaDescription: rest.excerpt,
    });
  }

  console.log(`[seed] inserted ${posts.length} sample posts`);
}
