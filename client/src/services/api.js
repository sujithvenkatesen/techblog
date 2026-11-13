import axios from 'axios';
import { FALLBACK_POSTS, FALLBACK_CATEGORIES } from '../data/fallback';

// Relative base URL: the Vite dev server proxies /api to http://localhost:5000,
// which also makes this work through devtunnels.ms.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8000,
});

http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('bw_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch { /* storage unavailable */ }
  return config;
});

/* ---------- Fallback helpers (public reads only) ---------- */

const hasFilters = (p = {}) => Boolean(p.q || p.category || p.tag || p.featured);

function filterFallback(params = {}) {
  const { q, category, sort = 'latest', featured, page = 1, limit = 9 } = params;
  let items = [...FALLBACK_POSTS];
  if (category) {
    const slugs = String(category).split(',').filter(Boolean);
    items = items.filter((p) => slugs.includes(p.category.slug));
  }
  if (featured) items = items.filter((p) => p.featured);
  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter((p) => `${p.title} ${p.excerpt}`.toLowerCase().includes(needle));
  }
  items.sort((a, b) =>
    sort === 'popular' ? b.views - a.views : new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  const total = items.length;
  const start = (Number(page) - 1) * Number(limit);
  return {
    items: items.slice(start, start + Number(limit)),
    total,
    page: Number(page),
    pages: Math.max(1, Math.ceil(total / Number(limit))),
    fromFallback: true,
  };
}

/* ---------- Public API ---------- */

export async function getPosts(params = {}) {
  try {
    const { data } = await http.get('/posts', { params });
    // Empty with no filters means an unseeded/empty backend: show fallback instead.
    if (!data?.items?.length && !hasFilters(params)) return filterFallback(params);
    return data;
  } catch {
    return filterFallback(params);
  }
}

export async function getTrending() {
  try {
    const { data } = await http.get('/posts/trending');
    if (Array.isArray(data) && data.length) return data;
  } catch { /* fall through */ }
  return [...FALLBACK_POSTS].sort((a, b) => b.views - a.views).slice(0, 4);
}

export async function getCategories() {
  try {
    const { data } = await http.get('/taxonomy/categories');
    if (Array.isArray(data) && data.length) return data;
  } catch { /* fall through */ }
  return FALLBACK_CATEGORIES.map((c) => ({
    ...c,
    count: FALLBACK_POSTS.filter((p) => p.category.slug === c.slug).length,
  }));
}

export async function getPost(slug) {
  try {
    const { data } = await http.get(`/posts/${slug}`);
    return data; // { post, related, prev, next }
  } catch (err) {
    const idx = [...FALLBACK_POSTS]
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .findIndex((p) => p.slug === slug);
    if (err?.response?.status === 404 && idx === -1) throw err;
    const sorted = [...FALLBACK_POSTS].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (idx === -1) throw err;
    const post = sorted[idx];
    return {
      post,
      related: sorted.filter((p) => p._id !== post._id && p.category.slug === post.category.slug).slice(0, 3)
        .concat(sorted.filter((p) => p._id !== post._id && p.category.slug !== post.category.slug)).slice(0, 3),
      prev: sorted[idx + 1] || null,
      next: sorted[idx - 1] || null,
    };
  }
}

/* ---------- Admin API (no fallback: needs the real backend) ---------- */

export const adminApi = {
  login: (email, password) => http.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => http.get('/auth/me').then((r) => r.data.user),
  stats: () => http.get('/posts/admin/stats').then((r) => r.data),
  posts: (params) => http.get('/posts/admin/all', { params }).then((r) => r.data),
  post: (id) => http.get(`/posts/admin/${id}`).then((r) => r.data),
  createPost: (body) => http.post('/posts', body).then((r) => r.data),
  updatePost: (id, body) => http.put(`/posts/${id}`, body).then((r) => r.data),
  toggleFeatured: (id) => http.patch(`/posts/${id}/featured`).then((r) => r.data),
  deletePost: (id) => http.delete(`/posts/${id}`).then((r) => r.data),
  taxonomy: (kind) => http.get(`/taxonomy/${kind}`).then((r) => r.data),
  createTax: (kind, body) => http.post(`/taxonomy/${kind}`, body).then((r) => r.data),
  updateTax: (kind, id, body) => http.put(`/taxonomy/${kind}/${id}`, body).then((r) => r.data),
  deleteTax: (kind, id) => http.delete(`/taxonomy/${kind}/${id}`).then((r) => r.data),
  users: () => http.get('/auth/users').then((r) => r.data),
  createUser: (body) => http.post('/auth/users', body).then((r) => r.data),
  deleteUser: (id) => http.delete(`/auth/users/${id}`).then((r) => r.data),
  upload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return http.post('/media', fd).then((r) => r.data.url);
  },
};

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
