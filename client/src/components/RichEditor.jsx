import { useEffect, useRef, useState } from 'react';
import { adminApi, errMsg } from '../services/api';

const youtubeEmbed = (url) => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  const v = url.match(/vimeo\.com\/(\d+)/);
  if (v) return `https://player.vimeo.com/video/${v[1]}`;
  return null;
};

const Btn = ({ onClick, children, title, active }) => (
  <button type="button" title={title} aria-label={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={`rounded-lg px-2.5 py-1.5 font-mono text-[11px] transition ${active ? 'bg-lime text-midnight' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>{children}</button>
);

/** Lightweight contentEditable rich editor with HTML source mode and image upload. */
export default function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const lastHtml = useRef('');
  const [source, setSource] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  // Push external value into the DOM only when it differs from what the editor last emitted.
  useEffect(() => {
    if (!source && ref.current && value !== lastHtml.current) {
      ref.current.innerHTML = value || '';
      lastHtml.current = value || '';
    }
  }, [value, source]);

  const emit = () => {
    const html = ref.current.innerHTML;
    lastHtml.current = html;
    onChange(html);
  };

  const exec = (cmd, arg = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };
  const insertHTML = (html) => exec('insertHTML', html);

  const addLink = () => {
    const url = window.prompt('Link URL', 'https://');
    if (url) exec('createLink', url);
  };
  const addVideo = () => {
    const url = window.prompt('YouTube or Vimeo URL');
    if (!url) return;
    const src = youtubeEmbed(url);
    if (!src) return setNote('Only YouTube and Vimeo links are supported.');
    insertHTML(`<iframe src="${src}" allowfullscreen loading="lazy"></iframe><p><br></p>`);
  };
  const addTable = () =>
    insertHTML('<table><thead><tr><th>Column A</th><th>Column B</th><th>Column C</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>');
  const addCode = () => {
    const sel = window.getSelection()?.toString() || '// your code';
    const esc = sel.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    insertHTML(`<pre><code class="language-javascript">${esc}</code></pre><p><br></p>`);
  };
  const onImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setNote('');
    try {
      const url = await adminApi.upload(file);
      insertHTML(`<img src="${url}" alt="" /><p><br></p>`);
    } catch (x) { setNote(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/[0.03] p-2">
        <Btn title="Heading 2" onClick={() => exec('formatBlock', 'H2')}>H2</Btn>
        <Btn title="Heading 3" onClick={() => exec('formatBlock', 'H3')}>H3</Btn>
        <Btn title="Paragraph" onClick={() => exec('formatBlock', 'P')}>¶</Btn>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <Btn title="Bold" onClick={() => exec('bold')}><b>B</b></Btn>
        <Btn title="Italic" onClick={() => exec('italic')}><i>I</i></Btn>
        <Btn title="Link" onClick={addLink}>Link</Btn>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <Btn title="Bulleted list" onClick={() => exec('insertUnorderedList')}>• List</Btn>
        <Btn title="Numbered list" onClick={() => exec('insertOrderedList')}>1. List</Btn>
        <Btn title="Quote" onClick={() => exec('formatBlock', 'BLOCKQUOTE')}>“ ”</Btn>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <Btn title="Code block" onClick={addCode}>{'</>'}</Btn>
        <Btn title="Table" onClick={addTable}>Table</Btn>
        <Btn title="Embed video" onClick={addVideo}>Video</Btn>
        <Btn title="Upload inline image" onClick={() => fileRef.current?.click()}>{busy ? 'Uploading…' : 'Image'}</Btn>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onImage} />
        <Btn title="Edit HTML source" active={source} onClick={() => setSource((s) => !s)}>HTML</Btn>
      </div>

      {note && <p role="alert" className="border-b border-white/10 bg-red-500/10 px-4 py-2 text-xs text-red-300">{note}</p>}

      {source ? (
        <textarea value={value} onChange={(e) => { lastHtml.current = e.target.value; onChange(e.target.value); }} spellCheck={false} className="block h-[460px] w-full resize-y bg-midnight/60 p-5 font-mono text-[13px] leading-relaxed text-white outline-none" aria-label="HTML source" />
      ) : (
        <div className="p-5 md:p-7">
          <div ref={ref} contentEditable suppressContentEditableWarning onInput={emit} onBlur={emit} data-placeholder="Start writing your article…" className="editor-surface prose-blog" role="textbox" aria-multiline="true" aria-label="Article body" />
        </div>
      )}
    </div>
  );
}
