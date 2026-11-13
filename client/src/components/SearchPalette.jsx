import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/api';
import { useDebounced } from '../hooks';

export default function SearchPalette({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(0);
  const dq = useDebounced(q, 200);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let live = true;
    getPosts({ q: dq || undefined, limit: 6, sort: dq ? 'latest' : 'popular' }).then((d) => live && setResults(d.items || []));
    return () => { live = false; };
  }, [dq, open]);

  const go = (post) => {
    onClose();
    navigate(`/articles/${post.slug}`);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) go(results[active]);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-midnight/80 px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label="Search articles">
      <div className="glass w-full max-w-xl overflow-hidden rounded-2xl shadow-cobalt" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey} placeholder="Search articles…" className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35" />
          <kbd className="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/50">ESC</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          <li className="label px-3 pb-2 pt-1 text-[10px]">{q ? 'Results' : 'Popular'}</li>
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-white/50">No articles match “{q}”.</li>}
          {results.map((p, i) => (
            <li key={p._id}>
              <button onMouseEnter={() => setActive(i)} onClick={() => go(p)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === active ? 'bg-cobalt/25' : ''}`}>
                <img src={p.featuredImage} alt="" className="h-10 w-16 rounded-md object-cover" loading="lazy" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{p.title}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{p.category?.shortName || p.category?.name}</span>
                </span>
                {i === active && <span className="font-mono text-xs text-lime">↵</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
