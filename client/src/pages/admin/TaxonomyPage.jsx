import { useCallback, useEffect, useState } from 'react';
import { adminApi, errMsg } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const KINDS = {
  categories: { label: 'Categories', perm: 'taxonomy', fields: [['name', 'Name'], ['description', 'Description']] },
  tags: { label: 'Tags', perm: 'taxonomy', fields: [['name', 'Name']] },
  authors: { label: 'Authors', perm: 'authors', fields: [['name', 'Name'], ['role', 'Role'], ['avatar', 'Avatar URL'], ['bio', 'Bio']] },
};

export default function TaxonomyPage() {
  const { can } = useAuth();
  const tabs = Object.entries(KINDS).filter(([, k]) => can(k.perm));
  const [kind, setKind] = useState(tabs[0]?.[0] || 'categories');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const k = KINDS[kind];

  const load = useCallback(() => adminApi.taxonomy(kind).then(setItems).catch((e) => setMsg(errMsg(e))), [kind]);
  useEffect(() => { setForm({}); setEditing(null); setMsg(''); load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await adminApi.updateTax(kind, editing, form);
      else await adminApi.createTax(kind, form);
      setForm({}); setEditing(null); setMsg(''); load();
    } catch (x) { setMsg(errMsg(x)); }
  };
  const remove = async (it) => {
    if (!window.confirm(`Delete “${it.name}”?`)) return;
    try { await adminApi.deleteTax(kind, it._id); load(); } catch (x) { setMsg(errMsg(x)); }
  };
  const edit = (it) => { setEditing(it._id); setForm(Object.fromEntries(k.fields.map(([f]) => [f, it[f] || '']))); };

  return (
    <div>
      <span className="label text-lime">/ TAXONOMY &amp; AUTHORS</span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Organise your content</h1>

      <div className="mt-6 flex gap-2">
        {tabs.map(([key, v]) => <button key={key} onClick={() => setKind(key)} className={`pill cursor-pointer ${kind === key ? 'pill-lime' : ''}`}>{v.label}</button>)}
      </div>

      {msg && <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{msg}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="glass divide-y divide-white/8 overflow-hidden rounded-2xl">
          {items.map((it) => (
            <div key={it._id} className="flex items-center gap-4 px-5 py-4">
              {kind === 'authors' && (it.avatar ? <img src={it.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-cobalt text-xs">{it.name[0]}</span>)}
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{it.name}</div>
                <div className="truncate font-mono text-[10.5px] text-white/40">{kind === 'authors' ? it.role : it.description || `/${it.slug}`}</div>
              </div>
              <button onClick={() => edit(it)} className="text-sm text-white/70 hover:text-lime">Edit</button>
              <button onClick={() => remove(it)} className="text-sm text-red-300/80 hover:text-red-300">Delete</button>
            </div>
          ))}
          {items.length === 0 && <p className="p-10 text-center text-white/45">Nothing here yet.</p>}
        </div>

        <form onSubmit={submit} className="glass h-fit space-y-4 rounded-2xl p-5">
          <h2 className="label text-lime">{editing ? 'Edit' : 'Add'} {k.label.toLowerCase().replace(/ies$/, 'y').replace(/s$/, '')}</h2>
          {k.fields.map(([f, label]) => (
            <div key={f}>
              <label className="label mb-2 block !text-[10px]" htmlFor={`f-${f}`}>{label}</label>
              {f === 'bio' || f === 'description' ? (
                <textarea id={`f-${f}`} rows={3} value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="input resize-y" />
              ) : (
                <input id={`f-${f}`} required={f === 'name'} value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="input" />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-lime flex-1 !py-2.5">{editing ? 'Update' : 'Add'}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({}); }} className="btn-glass !py-2.5">Cancel</button>}
          </div>
        </form>
      </div>
    </div>
  );
}
