import { Link } from 'react-router-dom';
import WireframeReveal from '../components/WireframeReveal';
import { useSeo } from '../hooks';
import { SITE } from '../data/site';
import SocialIcon from '../components/SocialIcon';

const PILLARS = [
  ['01', 'Trade-offs included', 'We publish what worked, what did not and what we would do differently.'],
  ['02', 'Open architecture', 'Real code, real numbers and reproducible examples. No hand-waving.'],
  ['03', 'Weekly cadence', 'One carefully edited deep dive each week instead of daily noise.'],
];

export default function AboutPage() {
  useSeo({ title: 'About', description: 'About the Blockwise Tech Blog and the engineers behind it.' });
  return (
    <div className="container-x pt-[calc(var(--nav-h)+48px)]">
      <WireframeReveal>
        <span className="label text-lime">/ ABOUT</span>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Engineering stories, <span className="font-serif font-bold italic text-lime">told straight.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
          Blockwise Tech Blog is written by working engineers and product people. We cover software development, AI, cloud, security and the industry around them, with the depth that only comes from shipping real systems.
        </p>
      </WireframeReveal>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PILLARS.map(([n, t, d], i) => (
          <WireframeReveal key={n} delay={['100', '150', '250'][i]}>
            <div className="glass glass-hover h-full rounded-2xl p-7">
              <span className="font-display text-5xl text-cobalt">{n}</span>
              <h2 className="mt-4 text-xl font-bold">{t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{d}</p>
            </div>
          </WireframeReveal>
        ))}
      </div>
      <WireframeReveal className="mt-14">
        <Link to="/articles" className="btn-lime">Start reading →</Link>
      </WireframeReveal>

      <WireframeReveal className="mt-20">
        <div className="glass rounded-3xl p-8 md:p-10">
          <span className="label text-lime">/ CONNECT</span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">Say hello</h2>
          <p className="mt-2 text-white/60">Questions, ideas or collaborations. Find me on any of these.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {SITE.socials.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noreferrer noopener" className="btn-glass !normal-case !tracking-[0.06em]"><SocialIcon name={s.key} size={15} />{s.label}</a>
            ))}
            <a href={`mailto:${SITE.email}`} className="btn-lime !normal-case !tracking-[0.06em]"><SocialIcon name="email" size={15} />{SITE.email}</a>
          </div>
        </div>
      </WireframeReveal>
    </div>
  );
}
