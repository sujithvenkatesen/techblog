import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BrandLink } from './Brand';
import SearchPalette from './SearchPalette';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/articles', label: 'Articles' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const loc = useLocation();

  useEffect(() => setMenu(false), [loc.pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  return (
    <>
      <header className="glass fixed inset-x-0 top-0 z-50 border-x-0 border-t-0" style={{ height: 'var(--nav-h)' }}>
        <div className="container-x flex h-full items-center justify-between gap-4">
          <BrandLink />

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `relative py-2 text-[13.5px] font-medium transition ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span className={`absolute inset-x-0 -bottom-0.5 h-[2px] origin-left rounded bg-lime transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-white/70 transition hover:border-cobalt hover:text-white" aria-label="Search (Command K)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <span className="hidden font-mono text-[10px] tracking-[0.14em] sm:inline">{isMac ? '⌘K' : 'CTRL K'}</span>
            </button>
            <Link to="/#newsletter" className="btn-lime hidden !px-5 !py-2.5 sm:inline-flex">Subscribe →</Link>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-white/12 md:hidden" onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{menu ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="glass fixed inset-x-0 top-[var(--nav-h)] z-40 border-x-0 border-t-0 md:hidden">
          <nav className="container-x flex flex-col py-4">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `border-b border-white/5 py-3.5 font-mono text-xs uppercase tracking-[0.2em] ${isActive ? 'text-lime' : 'text-white/75'}`}>{l.label}</NavLink>
            ))}
            <Link to="/#newsletter" className="btn-lime mt-4">Subscribe →</Link>
          </nav>
        </div>
      )}

      <SearchPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
