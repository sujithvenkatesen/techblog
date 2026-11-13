import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, errMsg } from '../../services/api';
import { fmtDate } from '../../hooks';

const STATUS_STYLE = {
  published: 'border-lime/50 bg-lime/10 text-lime',
  draft: 'border-white/20 bg-white/5 text-white/70',
  scheduled: 'border-cobalt bg-cobalt/20 text-white',
};

function Metric({ label, value }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="font-display text-4xl leading-none text-white">{value}</div>
      <div className="label mt-3 !text-[10px]">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([adminApi.stats(), adminApi.posts({ status: status || undefined, q: q || undefined })]);
      setStats(s); setPosts(p); setErr('');
    } catch (e) { setErr(errMsg(e)); }
  }, [status, q]);

  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  const toggle = async (id) => { await adminApi.toggleFeatured(id); load(); };
  const remove = async (p) => {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    await adminApi.deletePost(p._id); load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label text-lime">/ DASHBOARD</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Posts &amp; performance</h1>
        </div>
        <Link to="/admin/posts/new" className="btn-lime">New post +</Link>
      </div>

      {err && <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">{err}. Is the API running?</p>}

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Total posts" value={stats.total} />
          <Metric label="Published" value={stats.published} />
          <Metric label="Drafts" value={stats.drafts} />
          <Metric label="Scheduled" value={stats.scheduled} />
          <Metric label="Featured" value={stats.featured} />
          <Metric label="Total views" value={stats.views.toLocaleString()} />
        </div>
      )}

      <div className="glass mt-8 overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" aria-label="Search posts" className="input md:max-w-xs" />
          <div className="flex gap-2 md:ml-auto">
            {['', 'published', 'draft', 'scheduled'].map((s) => (
              <button key={s || 'all'} onClick={() => setStatus(s)} className={`pill cursor-pointer ${status === s ? 'pill-lime' : ''}`}>{s || 'All'}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="label !text-[10px] text-white/45">
                <th className="px-5 py-3 font-normal">Title</th><th className="px-3 font-normal">Category</th><th className="px-3 font-normal">Status</th><th className="px-3 font-normal">Date</th><th className="px-3 font-normal">Views</th><th className="px-3 font-normal">Featured</th><th className="px-5 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} className="border-t border-white/8 transition hover:bg-white/[0.03]">
                  <td className="max-w-[340px] px-5 py-4"><div className="truncate font-semibold">{p.title}</div><div className="truncate font-mono text-[10.5px] text-white/40">/{p.slug}</div></td>
                  <td className="px-3 text-white/65">{p.category?.shortName || p.category?.name}</td>
                  <td className="px-3"><span className={`pill !text-[9.5px] ${STATUS_STYLE[p.status]}`}>{p.status}</span></td>
                  <td className="px-3 font-mono text-[11px] text-white/55">{fmtDate(p.status === 'scheduled' ? p.scheduledFor : p.publishedAt || p.createdAt)}</td>
                  <td className="px-3 font-mono text-[12px] text-white/70">{p.views}</td>
                  <td className="px-3">
                    <button onClick={() => toggle(p._id)} role="switch" aria-checked={p.featured} aria-label="Toggle featured" className={`relative h-6 w-11 rounded-full border transition ${p.featured ? 'border-lime bg-lime' : 'border-white/20 bg-white/5'}`}>
                      <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${p.featured ? 'left-[22px] bg-midnight' : 'left-0.5 bg-white/60'}`} style={{ width: 18, height: 18 }} />
                    </button>
                  </td>
                  <td className="px-5 text-right">
                    <Link to={`/admin/posts/${p._id}`} className="mr-4 text-white/70 hover:text-lime">Edit</Link>
                    {p.status === 'published' && <Link to={`/articles/${p.slug}`} target="_blank" className="mr-4 text-white/70 hover:text-lime">View</Link>}
                    <button onClick={() => remove(p)} className="text-red-300/80 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && !err && <tr><td colSpan={7} className="px-5 py-12 text-center text-white/45">No posts found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
