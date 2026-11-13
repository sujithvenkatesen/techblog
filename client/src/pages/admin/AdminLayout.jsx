import { Navigate, NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandBadge } from '../../components/Brand';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true, perm: 'posts' },
  { to: '/admin/posts/new', label: 'New post', perm: 'posts' },
  { to: '/admin/taxonomy', label: 'Taxonomy & authors', perm: 'taxonomy' },
  { to: '/admin/users', label: 'Users', perm: 'users' },
];

/** Protected shell: requires a valid JWT session. */
export default function AdminLayout() {
  const { user, ready, logout, can } = useAuth();
  if (!ready) return <div className="grid min-h-screen place-items-center font-mono text-xs uppercase tracking-[0.2em] text-white/50">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="glass border-y-0 border-l-0 p-5 lg:sticky lg:top-0 lg:h-screen">
        <Link to="/" className="flex items-center gap-3"><BrandBadge size={32} /><span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/60">CMS</span></Link>
        <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col" aria-label="Admin">
          {NAV.filter((n) => can(n.perm)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? 'bg-lime text-midnight' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-5 lg:absolute lg:inset-x-5 lg:bottom-5 lg:mt-0">
          <div className="text-sm font-semibold">{user.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{user.role}</div>
          <div className="mt-4 flex gap-2">
            <Link to="/" className="btn-glass !px-4 !py-2 !text-[10px]">View site</Link>
            <button onClick={logout} className="btn-glass !px-4 !py-2 !text-[10px]">Sign out</button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10"><Outlet /></main>
    </div>
  );
}
