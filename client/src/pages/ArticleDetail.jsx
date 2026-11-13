import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import 'highlight.js/styles/github-dark.css';
import WireframeReveal from '../components/WireframeReveal';
import PostCard, { Avatar } from '../components/PostCard';
import { getPost } from '../services/api';
import { useSeo, fmtDate } from '../hooks';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Sanitize the body, add ids to h2/h3 and return { html, toc }. */
function prepare(raw = '') {
  const clean = DOMPurify.sanitize(raw, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'rel'],
  });
  const doc = new DOMParser().parseFromString(`<div id="r">${clean}</div>`, 'text/html');
  const root = doc.getElementById('r');
  const used = new Set();
  const toc = [];
  root.querySelectorAll('h2, h3').forEach((h) => {
    let id = slugify(h.textContent) || 'section';
    while (used.has(id)) id += '-x';
    used.add(id);
    h.id = id;
    toc.push({ id, text: h.textContent, level: h.tagName === 'H3' ? 3 : 2 });
  });
  root.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  return { html: root.innerHTML, toc };
}

const ShareBtn = ({ href, label, children, onClick }) => (
  <a href={href} onClick={onClick} target="_blank" rel="noreferrer noopener" aria-label={label} title={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-white/70 transition hover:border-lime hover:bg-lime hover:text-midnight">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">{children}</svg>
  </a>
);

export default function ArticleDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState('');
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    let live = true;
    setData(null); setError(false); window.scrollTo(0, 0);
    getPost(slug).then((d) => live && setData(d)).catch(() => live && setError(true));
    return () => { live = false; };
  }, [slug]);

  const post = data?.post;
  const { html, toc } = useMemo(() => prepare(post?.content), [post?.content]);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  useSeo({
    title: post?.seoTitle || post?.title,
    description: post?.metaDescription || post?.excerpt,
    image: post?.featuredImage,
    type: 'article',
    jsonLd: post && {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      image: post.featuredImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      author: { '@type': 'Person', name: post.author?.name },
      publisher: { '@type': 'Organization', name: 'Blockwise Tech Blog' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      articleSection: post.category?.name,
      keywords: (post.tags || []).map((t) => t.name).join(', '),
    },
  });

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(Math.min(100, Math.max(0, ((-r.top + 120) / Math.max(total, 1)) * 100)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [html]);

  // Syntax highlighting + Copy Code buttons
  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    root.querySelectorAll('pre').forEach((pre) => {
      const code = pre.querySelector('code') || pre;
      if (!code.dataset.highlighted) hljs.highlightElement(code);
      if (pre.querySelector('.copy-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Copy Code';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.innerText);
          btn.textContent = 'Copied ✓';
        } catch { btn.textContent = 'Press Ctrl+C'; }
        setTimeout(() => (btn.textContent = 'Copy Code'), 1800);
      });
      pre.appendChild(btn);
    });
  }, [html]);

  // Active TOC section while scrolling
  useEffect(() => {
    if (!toc.length) return undefined;
    const onScroll = () => {
      let current = toc[0].id;
      for (const t of toc) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top < 160) current = t.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  if (error) {
    return (
      <div className="container-x pt-[calc(var(--nav-h)+120px)] text-center">
        <h1 className="font-display text-7xl text-cobalt">404</h1>
        <p className="mt-4 text-white/60">That article could not be found.</p>
        <Link to="/articles" className="btn-lime mt-8">Browse articles →</Link>
      </div>
    );
  }
  if (!post) return <div className="container-x pt-[calc(var(--nav-h)+120px)] text-center font-mono text-xs uppercase tracking-[0.2em] text-white/50">Loading article…</div>;

  const enc = encodeURIComponent;
  const copyLink = async (e) => {
    e.preventDefault();
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* noop */ }
  };

  return (
    <>
      {/* Reading progress, fixed beneath the navbar */}
      <div className="fixed inset-x-0 z-40 h-[3px] bg-white/5" style={{ top: 'var(--nav-h)' }} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
        <div className="h-full bg-lime shadow-[0_0_14px_rgba(212,255,36,.7)]" style={{ width: `${progress}%` }} />
      </div>

      <header className="container-x pt-[calc(var(--nav-h)+48px)]">
        <WireframeReveal>
          <nav className="label mb-6 flex flex-wrap gap-2 !text-[10.5px]" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">Home</Link>/<Link to="/articles" className="hover:text-white">Articles</Link>/<span className="text-lime">{post.category?.shortName || post.category?.name}</span>
          </nav>
          <Link to={`/articles?category=${post.category?.slug}`} className="pill pill-lime">{post.category?.name}</Link>
          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/60">{post.excerpt}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <Avatar author={post.author} size={44} />
              <div>
                <div className="text-sm font-semibold">{post.author?.name}</div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/50">{post.author?.role}</div>
              </div>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">{fmtDate(post.publishedAt)}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-lime">{post.readingTime} MIN READ</span>
          </div>
        </WireframeReveal>
        <WireframeReveal delay="150" className="mt-10">
          <img src={post.featuredImage} alt={post.title} className="aspect-[21/9] w-full rounded-3xl border border-white/10 object-cover" />
        </WireframeReveal>
      </header>

      <div className="container-x mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0 max-w-[760px]">
          <div ref={bodyRef} className="prose-blog" dangerouslySetInnerHTML={{ __html: html }} />

          {post.tags?.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((t) => <span key={t._id} className="pill">#{t.name}</span>)}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-white/10 py-6">
            <span className="label mr-2">Share</span>
            <ShareBtn label="Share on X" href={`https://twitter.com/intent/tweet?text=${enc(post.title)}&url=${enc(url)}`}><path d="M18.244 2H21.5l-7.19 8.21L22.75 22h-6.62l-5.19-6.78L4.99 22H1.73l7.69-8.78L1.25 2h6.79l4.69 6.2L18.244 2Zm-1.16 18h1.83L6.99 3.9H5.03L17.084 20Z" /></ShareBtn>
            <ShareBtn label="Share on LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.83v1.57h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.12v5.88h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4V9.75Z" /></ShareBtn>
            <ShareBtn label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" /></ShareBtn>
            <ShareBtn label="Copy link" href={url} onClick={copyLink}><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-1.5 1.5a1 1 0 1 1-1.4-1.4l1.5-1.5a1 1 0 0 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a1 1 0 0 0 1.4 1.4l1.5-1.5a1 1 0 0 1 1.4 1.4l-1.5 1.5a3 3 0 1 1-4.2-4.2l3-3a1 1 0 0 1 1.4 0Z" /></ShareBtn>
            {copied && <span className="font-mono text-xs text-lime" role="status">Link copied ✓</span>}
          </div>

          <div className="glass mt-10 flex items-start gap-5 rounded-2xl p-6">
            <Avatar author={post.author} size={64} />
            <div>
              <span className="label !text-[10px]">Written by</span>
              <div className="mt-1 text-lg font-bold">{post.author?.name}</div>
              <p className="mt-1 text-sm leading-relaxed text-white/60">{post.author?.bio}</p>
            </div>
          </div>
        </article>

        {/* Sticky Table of Contents */}
        <aside className="hidden lg:block">
          {toc.length > 0 && (
            <nav className="glass sticky top-[110px] rounded-2xl p-5" aria-label="On this page">
              <p className="label mb-4 text-lime">On This Page</p>
              <ul className="space-y-1">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className={`block border-l-2 py-1.5 text-[13px] leading-snug transition ${t.level === 3 ? 'pl-7' : 'pl-4'} ${activeId === t.id ? 'border-lime font-medium text-white' : 'border-white/10 text-white/50 hover:text-white'}`}>{t.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>

      {/* Prev / Next */}
      {(data.prev || data.next) && (
        <section className="container-x mt-16 grid gap-5 md:grid-cols-2">
          {[['prev', '← Previous', data.prev], ['next', 'Next →', data.next]].map(([k, label, p]) =>
            p ? (
              <Link key={k} to={`/articles/${p.slug}`} className={`glass glass-hover group flex items-center gap-5 rounded-2xl p-5 ${k === 'next' ? 'md:flex-row-reverse md:text-right' : ''}`}>
                <img src={p.featuredImage} alt="" loading="lazy" className="h-20 w-28 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <span className="label !text-[10px] text-lime">{label}</span>
                  <div className="mt-1.5 line-clamp-2 font-bold leading-snug transition group-hover:text-lime">{p.title}</div>
                </div>
              </Link>
            ) : <div key={k} />
          )}
        </section>
      )}

      {/* Related */}
      {data.related?.length > 0 && (
        <section className="container-x mt-24">
          <WireframeReveal>
            <div className="mb-8 flex items-end gap-4">
              <span className="section-num">+</span>
              <h2 className="pb-1 text-2xl font-extrabold tracking-tight">Related articles</h2>
            </div>
          </WireframeReveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.related.map((p, i) => (
              <WireframeReveal key={p._id} delay={['100', '150', '250'][i % 3]}><PostCard post={p} /></WireframeReveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
