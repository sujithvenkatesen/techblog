import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import WireframeReveal from '../components/WireframeReveal';
import Logo3D from '../components/Logo3D';
import PostCard, { Avatar, catLabel } from '../components/PostCard';
import Newsletter from '../components/Newsletter';
import { getPosts, getTrending, getCategories } from '../services/api';
import { FALLBACK_POSTS, FALLBACK_CATEGORIES } from '../data/fallback';
import { useDebounced, useSeo, fmtDate } from '../hooks';
import { SAME_AS } from '../data/site';

const STACK = ['React', 'Node.js', 'MongoDB', 'AI / ML', 'Kubernetes', 'Cloud'];

function SectionHead({ num, title, right }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-end gap-5">
        <span className="section-num">{num}</span>
        <div className="pb-1">
          <span className="label text-lime">/ {title.eyebrow}</span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">{title.text}</h2>
        </div>
      </div>
      {right}
    </div>
  );
}

function Hero() {
  return (
    <section className="container-x relative grid items-center gap-10 pb-16 pt-[calc(var(--nav-h)+56px)] lg:grid-cols-2 lg:pb-24">
      <div className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-cobalt/30 blur-[120px]" />
      <WireframeReveal className="relative">
        <span className="pill border-cobalt/60 bg-cobalt/10 text-white/85">ENGINEERING &amp; PRODUCT INSIGHTS</span>
        <h1 className="mt-6 text-[2.7rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl xl:text-[4.4rem]">
          <span className="font-serif font-bold italic text-lime">Explore</span>{' '}
          <span className="text-white">Every</span>
          <br />
          <span className="text-cobalt">Tech Breakthrough</span>
        </h1>
        <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-white/65">
          Practical deep dives on software, AI, cloud and security, written by the engineers who ship it, with the trade-offs left in.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
          <span><b className="mr-1.5 font-display text-lg font-normal text-lime">7+</b>CATEGORIES</span>
          <span className="text-cobalt">/</span>
          <span>WEEKLY DEEP DIVES</span>
          <span className="text-cobalt">/</span>
          <span>OPEN ARCHITECTURE</span>
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/articles" className="btn-lime">Explore Articles →</Link>
          <Link to="/categories" className="btn-glass">Browse Topics</Link>
        </div>
      </WireframeReveal>

      <WireframeReveal delay="150" className="relative">
        <Logo3D />
      </WireframeReveal>
    </section>
  );
}

function Featured({ posts }) {
  const [hero, ...rest] = posts;
  if (!hero) return null;
  return (
    <section className="container-x mt-10" aria-labelledby="featured-h">
      <WireframeReveal>
        <SectionHead num="01" title={{ eyebrow: 'FEATURED', text: 'Spotlight stories' }} />
      </WireframeReveal>
      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <WireframeReveal delay="100" className="h-full">
          <Link to={`/articles/${hero.slug}`} className="glass glass-hover group relative flex h-full min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl">
            <img src={hero.featuredImage} alt={hero.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/55 to-transparent" />
            <span className="pill pill-lime absolute left-5 top-5">FEATURED</span>
            <div className="relative p-6 md:p-8">
              <span className="label">{catLabel(hero.category)}</span>
              <h3 id="featured-h" className="mt-3 text-2xl font-extrabold leading-tight tracking-tight md:text-[2rem]">{hero.title}</h3>
              <p className="mt-3 line-clamp-2 max-w-xl text-sm text-white/65">{hero.excerpt}</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar author={hero.author} size={34} />
                <span className="text-sm font-medium">{hero.author?.name}</span>
                <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/60">{hero.readingTime} MIN READ</span>
              </div>
            </div>
          </Link>
        </WireframeReveal>

        <div className="flex flex-col gap-6">
          {rest.slice(0, 2).map((p, i) => (
            <WireframeReveal key={p._id} delay={i ? '250' : '150'} className="flex-1">
              <Link to={`/articles/${p.slug}`} className="glass glass-hover group flex h-full overflow-hidden rounded-2xl">
                <div className="w-[38%] shrink-0 overflow-hidden">
                  <img src={p.featuredImage} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <span className="pill pill-lime !px-2.5 !py-0.5 !text-[9.5px]">FEATURED</span>
                    <span className="label !text-[10px]">{catLabel(p.category)}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-3 text-[1.02rem] font-bold leading-snug transition group-hover:text-lime">{p.title}</h3>
                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <Avatar author={p.author} size={24} />
                    <span className="text-xs text-white/70">{p.author?.name}</span>
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{p.readingTime} MIN</span>
                  </div>
                </div>
              </Link>
            </WireframeReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Latest({ categories }) {
  const [active, setActive] = useState('all');
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 250);
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    getPosts({ category: active === 'all' ? undefined : active, q: dq || undefined, limit: 6 }).then((d) => {
      if (live) { setPosts(d.items); setLoading(false); }
    });
    return () => { live = false; };
  }, [active, dq]);

  return (
    <section className="container-x mt-28" aria-labelledby="latest-h">
      <WireframeReveal>
        <SectionHead num="02" title={{ eyebrow: 'LATEST ARTICLES', text: 'Fresh off the press' }} right={<Link to="/articles" className="btn-glass !py-2.5">View all →</Link>} />
      </WireframeReveal>

      <div className="sticky top-[var(--nav-h)] z-30 -mx-5 mb-8 border-y border-white/8 bg-midnight/80 px-5 py-3 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto" role="tablist" aria-label="Filter by category">
            {[{ slug: 'all', name: 'All', shortName: 'ALL' }, ...categories].map((c) => (
              <button key={c.slug} role="tab" aria-selected={active === c.slug} onClick={() => setActive(c.slug)} className={`pill shrink-0 cursor-pointer transition ${active === c.slug ? 'pill-lime' : 'hover:border-cobalt hover:text-white'}`}>
                {c.shortName || c.name}
              </button>
            ))}
          </div>
          <div className="relative md:w-64">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" aria-label="Search articles" className="input !rounded-full !py-2.5 !pl-10 text-[13px]" />
          </div>
        </div>
      </div>

      {posts.length === 0 && !loading ? (
        <p className="glass rounded-2xl p-10 text-center text-white/60">No articles match your filters.</p>
      ) : (
        <div className={`grid gap-6 transition-opacity md:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
          {posts.map((p, i) => (
            <WireframeReveal key={p._id} delay={['100', '150', '250'][i % 3]}>
              <PostCard post={p} />
            </WireframeReveal>
          ))}
        </div>
      )}
    </section>
  );
}

function Trending({ posts }) {
  const list = useMemo(() => posts.slice(0, 4), [posts]);
  const row = [...STACK, ...STACK];
  return (
    <section className="container-x mt-28" aria-labelledby="trending-h">
      <WireframeReveal>
        <SectionHead num="03" title={{ eyebrow: 'TRENDING & STACK', text: 'Trending deep dives' }} />
      </WireframeReveal>
      <div className="grid gap-x-12 lg:grid-cols-2">
        {list.map((p, i) => (
          <WireframeReveal key={p._id} delay={['100', '150', '250', '350'][i]}>
            <Link to={`/articles/${p.slug}`} className="group flex items-center gap-6 border-b border-white/10 py-6 transition hover:border-cobalt">
              <span className={`font-display text-6xl leading-none transition md:text-7xl ${i % 2 ? 'text-lime' : 'text-cobalt'} group-hover:text-white`}>{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <span className="label !text-[10px]">{catLabel(p.category)} · {fmtDate(p.publishedAt)}</span>
                <h3 className="mt-1.5 text-lg font-bold leading-snug transition group-hover:text-lime">{p.title}</h3>
                <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{(p.views || 0).toLocaleString()} VIEWS · {p.readingTime} MIN READ</span>
              </div>
              <span className="ml-auto hidden text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-lime sm:block">→</span>
            </Link>
          </WireframeReveal>
        ))}
      </div>

      <WireframeReveal delay="150" className="mt-14">
        <p className="label mb-4">Developer ecosystem</p>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] py-6" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
          <div className="flex w-max animate-marquee gap-14 whitespace-nowrap">
            {row.map((s, i) => (
              <span key={i} className="flex items-center gap-14 font-display text-3xl uppercase tracking-wide text-white/35 transition hover:text-white md:text-4xl">
                {s}<span className="text-lg text-cobalt">✦</span>
              </span>
            ))}
          </div>
        </div>
      </WireframeReveal>
    </section>
  );
}

export default function HomePage() {
  useSeo({
    description: 'Weekly deep dives on software development, AI, cloud, security and more from the Blockwise engineering team.',
    jsonLd: { '@context': 'https://schema.org', '@type': 'Blog', name: 'Blockwise Tech Blog', url: window.location.origin, sameAs: SAME_AS },
  });

  // Seeded with fallback data so the page is never empty, even before the API answers.
  const [featured, setFeatured] = useState(FALLBACK_POSTS.filter((p) => p.featured).slice(0, 3));
  const [trending, setTrending] = useState([...FALLBACK_POSTS].sort((a, b) => b.views - a.views).slice(0, 4));
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    let live = true;
    (async () => {
      const [f, latest, t, c] = await Promise.all([
        getPosts({ featured: 'true', limit: 3 }),
        getPosts({ limit: 3 }),
        getTrending(),
        getCategories(),
      ]);
      if (!live) return;
      let items = f.items || [];
      if (items.length < 3) {
        // top up the bento grid so it is always full
        const ids = new Set(items.map((p) => p._id));
        items = [...items, ...(latest.items || []).filter((p) => !ids.has(p._id))].slice(0, 3);
      }
      if (items.length) setFeatured(items);
      if (t?.length) setTrending(t);
      if (c?.length) setCategories(c);
    })();
    return () => { live = false; };
  }, []);

  return (
    <>
      <Hero />
      <Featured posts={featured} />
      <Latest categories={categories} />
      <Trending posts={trending} />
      <Newsletter />
    </>
  );
}
