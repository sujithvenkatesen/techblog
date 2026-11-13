import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WireframeReveal from '../components/WireframeReveal';
import { getCategories } from '../services/api';
import { FALLBACK_CATEGORIES } from '../data/fallback';
import { useSeo } from '../hooks';

export default function CategoriesPage() {
  useSeo({ title: 'Categories', description: 'Explore Blockwise Tech Blog by topic.' });
  const [cats, setCats] = useState(FALLBACK_CATEGORIES);
  useEffect(() => { getCategories().then(setCats); }, []);

  return (
    <div className="container-x pt-[calc(var(--nav-h)+48px)]">
      <WireframeReveal>
        <span className="label text-lime">/ TOPICS</span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">
          Browse by <span className="font-serif font-bold italic text-lime">category</span>
        </h1>
      </WireframeReveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <WireframeReveal key={c.slug} delay={['100', '150', '250'][i % 3]}>
            <Link to={`/articles?category=${c.slug}`} className="glass glass-hover group flex h-full min-h-[200px] flex-col rounded-2xl p-7">
              <span className="font-display text-5xl text-cobalt transition group-hover:text-lime">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="mt-4 text-xl font-bold leading-snug">{c.name}</h2>
              <p className="mt-2 text-sm text-white/55">{c.description}</p>
              <span className="mt-auto pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
                {c.count ?? 0} ARTICLES <span className="text-lime transition group-hover:ml-1">→</span>
              </span>
            </Link>
          </WireframeReveal>
        ))}
      </div>
    </div>
  );
}
