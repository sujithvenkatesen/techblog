import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WireframeReveal from '../components/WireframeReveal';
import PostCard from '../components/PostCard';
import { getPosts, getCategories } from '../services/api';
import { FALLBACK_CATEGORIES } from '../data/fallback';
import { useDebounced, useSeo } from '../hooks';

const PAGE_SIZE = 9;

export default function ArticlesPage() {
  useSeo({ title: 'Articles', description: 'Browse every published article: software, AI, cloud, security and more.' });
  const [params, setParams] = useSearchParams();
  const selected = (params.get('category') || '').split(',').filter(Boolean);
  const sort = params.get('sort') === 'popular' ? 'popular' : 'latest';
  const [q, setQ] = useState(params.get('q') || '');
  const dq = useDebounced(q, 300);

  const [cats, setCats] = useState(FALLBACK_CATEGORIES);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getCategories().then(setCats); }, []);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  const toggleCat = (slug) => {
    const set = new Set(selected);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    update({ category: [...set].join(',') });
  };

  // Reset and load first page whenever filters change
  useEffect(() => {
    let live = true;
    setLoading(true);
    getPosts({ category: selected.join(',') || undefined, q: dq || undefined, sort, page: 1, limit: PAGE_SIZE }).then((d) => {
      if (!live) return;
      setItems(d.items); setPage(1); setPages(d.pages); setTotal(d.total); setLoading(false);
    });
    return () => { live = false; };
  }, [params.get('category'), dq, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = async () => {
    const next = page + 1;
    setLoading(true);
    const d = await getPosts({ category: selected.join(',') || undefined, q: dq || undefined, sort, page: next, limit: PAGE_SIZE });
    setItems((prev) => [...prev, ...d.items.filter((p) => !prev.some((x) => x._id === p._id))]);
    setPage(next); setPages(d.pages); setLoading(false);
  };

  return (
    <div className="container-x pb-8 pt-[calc(var(--nav-h)+48px)]">
      <WireframeReveal>
        <span className="label text-lime">/ ARCHIVE</span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">
          All <span className="font-serif font-bold italic text-lime">articles</span>
        </h1>
        <p className="mt-4 max-w-xl text-white/60">Filter by topic, search by keyword and sort by what the community reads most.</p>
      </WireframeReveal>

      <WireframeReveal delay="100" className="mt-10">
        <div className="glass rounded-2xl p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by keyword…" aria-label="Search articles" className="input md:max-w-sm" />
            <div className="flex rounded-full border border-white/12 p-1 md:ml-auto" role="group" aria-label="Sort">
              {[['latest', 'Latest'], ['popular', 'Most Popular']].map(([v, l]) => (
                <button key={v} onClick={() => update({ sort: v === 'latest' ? '' : v })} aria-pressed={sort === v} className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition ${sort === v ? 'bg-lime text-midnight' : 'text-white/60 hover:text-white'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Categories (multi-select)">
            <button onClick={() => update({ category: '' })} className={`pill cursor-pointer transition ${selected.length === 0 ? 'pill-lime' : 'hover:border-cobalt'}`}>All</button>
            {cats.map((c) => (
              <button key={c.slug} onClick={() => toggleCat(c.slug)} aria-pressed={selected.includes(c.slug)} className={`pill cursor-pointer transition ${selected.includes(c.slug) ? 'pill-lime' : 'hover:border-cobalt'}`}>{c.name}</button>
            ))}
          </div>
        </div>
      </WireframeReveal>

      <p className="label mt-8" aria-live="polite">{loading && items.length === 0 ? 'Loading…' : `${total} article${total === 1 ? '' : 's'}`}</p>

      {!loading && items.length === 0 ? (
        <div className="glass mt-6 rounded-2xl p-12 text-center text-white/60">No articles found. Try clearing a filter.</div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <WireframeReveal key={p._id} delay={['100', '150', '250'][i % 3]}>
              <PostCard post={p} />
            </WireframeReveal>
          ))}
        </div>
      )}

      {page < pages && (
        <div className="mt-12 text-center">
          <button onClick={loadMore} disabled={loading} className="btn-lime disabled:opacity-50">{loading ? 'Loading…' : 'Load more →'}</button>
        </div>
      )}
    </div>
  );
}
