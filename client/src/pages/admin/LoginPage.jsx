import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { errMsg } from '../../services/api';
import { BrandBadge } from '../../components/Brand';

export default function LoginPage() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await login(email, password); nav('/admin'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-3xl p-8 shadow-cobalt">
        <BrandBadge size={44} />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Admin sign in</h1>
        <p className="mt-1 text-sm text-white/50">Authorised editors only.</p>
        <label className="label mt-7 block" htmlFor="email">Email</label>
        <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-2" />
        <label className="label mt-4 block" htmlFor="pw">Password</label>
        <input id="pw" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-2" />
        {err && <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{err}</p>}
        <button disabled={busy} className="btn-lime mt-6 w-full disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in →'}</button>
        <Link to="/" className="mt-5 block text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/40 hover:text-white">← Back to site</Link>
      </form>
    </div>
  );
}
