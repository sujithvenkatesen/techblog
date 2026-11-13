import { Link } from 'react-router-dom';
import { fmtDate } from '../hooks';

export function Avatar({ author, size = 28 }) {
  const initials = (author?.name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('');
  return author?.avatar ? (
    <img src={author.avatar} alt={author.name} width={size} height={size} className="rounded-full border border-white/15 object-cover" style={{ width: size, height: size }} loading="lazy" />
  ) : (
    <span className="grid place-items-center rounded-full bg-cobalt font-mono text-[10px] text-white" style={{ width: size, height: size }}>{initials}</span>
  );
}

export const catLabel = (c) => (c?.shortName || c?.name || '').toUpperCase();

/** Standard grid card (16:9 thumb, category tag, title, 2-line excerpt, meta). */
export default function PostCard({ post }) {
  return (
    <Link to={`/articles/${post.slug}`} className="glass glass-hover group flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="relative aspect-video overflow-hidden">
        <img src={post.featuredImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent" />
        <span className="pill absolute left-3 top-3 border-white/20 bg-midnight/70 backdrop-blur">{catLabel(post.category)}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.08rem] font-bold leading-snug tracking-tight text-white transition group-hover:text-lime">{post.title}</h3>
        <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-white/55">{post.excerpt}</p>
        <div className="mt-auto flex items-center gap-2.5 pt-5">
          <Avatar author={post.author} />
          <span className="text-[12.5px] font-medium text-white/80">{post.author?.name}</span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{fmtDate(post.publishedAt)} · {post.readingTime} MIN READ</span>
        </div>
      </div>
    </Link>
  );
}
