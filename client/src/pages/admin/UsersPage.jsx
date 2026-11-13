import { useCallback, useEffect, useState } from 'react';
import { adminApi, errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PERMS = [['posts', 'Posts'], ['media', 'Media'], ['taxonomy', 'Taxonomy'], ['authors', 'Authors'], ['users', 'Users']];
const BLANK = { name: '', email: '', password: '', role: 'editor', permissions: ['posts', 'media'] };

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [msg, setMsg] = useState('');

  const load = useCallback(() => adminApi.users().then(setUsers).catch((e) => setMsg(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);

  const togglePerm = (p) => setForm((f) => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p] }));

  const submit = async (e) => {
    e.preventDefault();
    try { await adminApi.createUser(form); setForm(BLANK); setMsg(''); load(); } catch (x) { setMsg(errMsg(x)); }
  };
  const remove = async (u) => {
    if (!window.confirm(`Remove ${u.name}?`)) return;
    try { await adminApi.deleteUser(u._id); load(); } catch (x) { setMsg(errMsg(x)); }
  };

  if (me?.role !== 'admin') return <p className="text-white/60">Admins only.</p>;

  return (
    <div>
      <span className="label text-lime">/ USERS &amp; PERMISSIONS</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Team access</h1>
      {msg && <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{msg}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="glass divide-y divide-white/8 overflow-hidden rounded-2xl">
          {users.map((u) => (
            <div key={u._id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{u.name} <span className="pill ml-2 !text-[9px]">{u.role}</span></div>
                <div className="font-mono text-[10.5px] text-white/40">{u.email} · {u.role === 'admin' ? 'all permissions' : u.permissions.join(', ') || 'none'}</div>
              </div>
              {u._id !== me.id && <button onClick={() => remove(u)} className="text-sm text-red-300/80 hover:text-red-300">Remove</button>}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="glass h-fit space-y-4 rounded-2xl p-5">
          <h2 className="label text-lime">Add user</h2>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" aria-label="Name" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" aria-label="Email" />
          <input required minLength={8} type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" aria-label="Password" autoComplete="new-password" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input" aria-label="Role"><option value="editor">Editor</option><option value="admin">Admin</option></select>
          {form.role === 'editor' && (
            <div className="flex flex-wrap gap-1.5">
              {PERMS.map(([p, l]) => <button type="button" key={p} aria-pressed={form.permissions.includes(p)} onClick={() => togglePerm(p)} className={`pill cursor-pointer ${form.permissions.includes(p) ? 'pill-lime' : ''}`}>{l}</button>)}
            </div>
          )}
          <button className="btn-lime w-full !py-2.5">Create user</button>
        </form>
      </div>
    </div>
  );
}
