import { Link } from 'react-router-dom';
import { BrandLink } from './Brand';
import { FALLBACK_CATEGORIES } from '../data/fallback';
import { SITE } from '../data/site';
import SocialIcon from './SocialIcon';

const Social = ({ href, label, icon }) => (
  <a href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer noopener" aria-label={label} title={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-white/70 transition hover:border-lime hover:bg-lime hover:text-midnight">
    <SocialIcon name={icon} />
  </a>
);

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-midnight/60 backdrop-blur-xl">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
        <div>
          <BrandLink />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
            Engineering and product insights for builders: software, AI, cloud and security, published weekly.
          </p>
          <div className="mt-6 flex gap-2.5">
            {SITE.socials.map((x) => <Social key={x.key} href={x.href} label={x.label} icon={x.key} />)}
            <Social href={`mailto:${SITE.email}`} label="Email" icon="email" />
          </div>
          <a href={`mailto:${SITE.email}`} className="mt-4 inline-block font-mono text-[11px] tracking-[0.1em] text-white/50 transition hover:text-lime">{SITE.email}</a>
        </div>

        <div>
          <h4 className="label mb-5 text-lime">Navigate</h4>
          <ul className="space-y-3 text-sm text-white/65">
            {[['/', 'Home'], ['/articles', 'Articles'], ['/categories', 'Categories'], ['/about', 'About'], ['/admin', 'Admin']].map(([to, l]) => (
              <li key={to}><Link to={to} className="transition hover:text-white">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="label mb-5 text-lime">Categories</h4>
          <ul className="space-y-3 text-sm text-white/65">
            {FALLBACK_CATEGORIES.map((c) => (
              <li key={c.slug}><Link to={`/articles?category=${c.slug}`} className="transition hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="label mb-5 text-lime">Feeds</h4>
          <ul className="space-y-3 text-sm text-white/65">
            <li><a href="/sitemap.xml" className="transition hover:text-white">Sitemap</a></li>
            <li><a href="/robots.txt" className="transition hover:text-white">robots.txt</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <div className="container-x flex flex-col items-center justify-between gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Blockwise Tech Blog</span>
          <span>Built on the MERN stack</span>
        </div>
      </div>
    </footer>
  );
}
