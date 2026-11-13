import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RichEditor from '../../components/RichEditor';
import { adminApi, errMsg } from '../../services/api';

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const toLocalInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const EMPTY = {
  title: '', slug: '', excerpt: '', content: '', featuredImage: '', category: '', author: '', tags: [],
  status: 'draft', scheduledFor: '', featured: false, seoTitle: '', metaDescription: '',
};

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between"><label className="label">{label}</label>{hint && <span className="font-mono text-[10px] text-white/35">{hint}</span>}</div>
      {children}
    </div>
  );
}

export default function PostEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(EMPTY);
  const [cats, setCats] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [tags, setTags] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    Promise.all([adminApi.taxonomy('categories'), adminApi.taxonomy('authors'), adminApi.taxonomy('tags')])
      .then(([c, a, t]) => {
        setCats(c); setAuthors(a); setTags(t);
        if (isNew) setForm((f) => ({ ...f, category: f.category || c[0]?._id || '', author: f.author || a[0]?._id || '' }));
      })
      .catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
  }, [isNew]);

  useEffect(() => {
    if (isNew) return;
    adminApi.post(id).then((p) => {
      setSlugTouched(true);
      setForm({
        ...EMPTY, ...p,
        category: p.category?._id || '', author: p.author?._id || '',
        tags: (p.tags || []).map((t) => t._id),
        scheduledFor: toLocalInput(p.scheduledFor),
      });
    }).catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
  }, [id, isNew]);

  const onTitle = (title) => set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try { set({ featuredImage: await adminApi.upload(file) }); } catch (x) { setMsg({ type: 'error', text: errMsg(x) }); } finally { setUploading(false); }
  };

  const save = async (status) => {
    setMsg(null);
    if (!form.title.trim()) return setMsg({ type: 'error', text: 'Title is required.' });
    if (!form.category || !form.author) return setMsg({ type: 'error', text: 'Choose a category and an author.' });
    const next = status || form.status;
    if (next === 'scheduled' && !form.scheduledFor) return setMsg({ type: 'error', text: 'Pick a date and time to schedule.' });
    setSaving(true);
    try {
      const body = {
        ...form, status: next,
        scheduledFor: next === 'scheduled' ? new Date(form.scheduledFor).toISOString() : undefined,
      };
      delete body._id; delete body.createdAt; delete body.updatedAt; delete body.__v; delete body.views; delete body.readingTime;
      const saved = isNew ? await adminApi.createPost(body) : await adminApi.updatePost(id, body);
      set({ status: saved.status });
      setMsg({ type: 'ok', text: next === 'published' ? 'Published ✓' : next === 'scheduled' ? 'Scheduled ✓' : 'Saved ✓' });
      if (isNew) nav(`/admin/posts/${saved._id}`, { replace: true });
    } catch (x) { setMsg({ type: 'error', text: errMsg(x) }); } finally { setSaving(false); }
  };

  const toggleTag = (tid) => set({ tags: form.tags.includes(tid) ? form.tags.filter((t) => t !== tid) : [...form.tags, tid] });
  const seoTitle = form.seoTitle || form.title;
  const seoDesc = form.metaDescription || form.excerpt;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label text-lime">/ {isNew ? 'NEW POST' : 'EDIT POST'}</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{isNew ? 'Write something great' : form.title || 'Untitled'}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={saving} onClick={() => save('draft')} className="btn-glass !py-2.5">Save draft</button>
          <button disabled={saving} onClick={() => save('scheduled')} className="btn-glass !py-2.5">Schedule</button>
          <button disabled={saving} onClick={() => save('published')} className="btn-lime !py-2.5">{saving ? 'Saving…' : 'Publish now →'}</button>
        </div>
      </div>

      {msg && <p role={msg.type === 'error' ? 'alert' : 'status'} className={`mt-5 rounded-xl border px-4 py-3 text-sm ${msg.type === 'error' ? 'border-red-400/30 bg-red-500/10 text-red-300' : 'border-lime/40 bg-lime/10 text-lime'}`}>{msg.text}</p>}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Field label="Title"><input value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="Article title" className="input !py-4 !text-lg font-bold" /></Field>
          <Field label="Excerpt" hint={`${form.excerpt.length}/400`}><textarea rows={3} maxLength={400} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} placeholder="A short summary shown on cards" className="input resize-y" /></Field>
          <Field label="Body"><RichEditor value={form.content} onChange={(content) => set({ content })} /></Field>

          <section className="glass rounded-2xl p-6">
            <h2 className="label mb-5 text-lime">SEO controls</h2>
            <div className="space-y-5">
              <Field label="Custom URL slug" hint="auto-generated from title">
                <div className="flex gap-2">
                  <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-white/[0.04] pl-4 text-sm text-white/40">/articles/
                    <input value={form.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value) }); }} className="w-full bg-transparent px-1 py-3 text-white outline-none" aria-label="URL slug" />
                  </div>
                  <button type="button" onClick={() => { setSlugTouched(false); set({ slug: slugify(form.title) }); }} className="btn-glass !px-4 !py-2 !text-[10px]">Generate</button>
                </div>
              </Field>
              <Field label="SEO title" hint={`${seoTitle.length}/60`}><input value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} placeholder={form.title} className="input" /></Field>
              <Field label="Meta description" hint={`${seoDesc.length}/160`}><textarea rows={3} maxLength={320} value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} placeholder={form.excerpt} className="input resize-y" /></Field>
              <div className="rounded-xl border border-white/10 bg-white p-4 text-left">
                <div className="truncate text-[13px] text-[#202124]">yoursite.com › articles › {form.slug || 'slug'}</div>
                <div className="truncate text-[19px] leading-snug text-[#1a0dab]">{seoTitle || 'SEO title preview'}</div>
                <div className="line-clamp-2 text-[13px] text-[#4d5156]">{seoDesc || 'Meta description preview'}</div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="glass rounded-2xl p-5">
            <h2 className="label mb-4 text-lime">Publishing</h2>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set({ status: e.target.value })} className="input">
                <option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option>
              </select>
            </Field>
            {form.status === 'scheduled' && (
              <div className="mt-4"><Field label="Publish at"><input type="datetime-local" value={form.scheduledFor} onChange={(e) => set({ scheduledFor: e.target.value })} className="input" /></Field></div>
            )}
            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-white/10 px-4 py-3">
              <span className="text-sm font-medium">Featured post</span>
              <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} className="h-4 w-4 accent-[#D4FF24]" />
            </label>
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="label mb-4 text-lime">Featured image</h2>
            <div className="grid aspect-video place-items-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/[0.03]">
              {form.featuredImage ? <img src={form.featuredImage} alt="Featured preview" className="h-full w-full object-cover" /> : <span className="font-mono text-[11px] text-white/35">No image</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-glass flex-1 !py-2.5 !text-[10px]">{uploading ? 'Uploading…' : 'Upload'}</button>
              {form.featuredImage && <button type="button" onClick={() => set({ featuredImage: '' })} className="btn-glass !px-4 !py-2.5 !text-[10px]">Remove</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />
            <input value={form.featuredImage} onChange={(e) => set({ featuredImage: e.target.value })} placeholder="…or paste an image URL" className="input mt-3 !py-2.5 text-xs" aria-label="Featured image URL" />
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="label mb-4 text-lime">Taxonomy</h2>
            <div className="space-y-4">
              <Field label="Category"><select value={form.category} onChange={(e) => set({ category: e.target.value })} className="input">{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></Field>
              <Field label="Author"><select value={form.author} onChange={(e) => set({ author: e.target.value })} className="input">{authors.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}</select></Field>
              <Field label="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <button type="button" key={t._id} onClick={() => toggleTag(t._id)} aria-pressed={form.tags.includes(t._id)} className={`pill cursor-pointer !normal-case ${form.tags.includes(t._id) ? 'pill-lime' : ''}`}>{t.name}</button>
                  ))}
                  {tags.length === 0 && <span className="text-xs text-white/40">No tags yet. Add some under Taxonomy.</span>}
                </div>
              </Field>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
