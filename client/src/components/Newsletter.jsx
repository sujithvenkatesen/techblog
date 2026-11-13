import { useState } from 'react';
import WireframeReveal from './WireframeReveal';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    // Hook this up to your email provider (Mailchimp, Resend, etc.).
    setDone(true);
  };

  return (
    <section id="newsletter" className="container-x mt-28">
      <WireframeReveal>
        <div className="glass relative overflow-hidden rounded-3xl p-8 md:p-14" style={{ borderImage: 'none' }}>
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cobalt/60 blur-[90px]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-cobalt via-cobalt/60 to-transparent" />
          <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="label text-lime">Newsletter</span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Get the <span className="font-serif font-bold italic text-lime">deep dives</span><br />in your inbox.
              </h2>
              <p className="mt-4 max-w-md text-white/60">One thoughtful engineering essay a week. No spam, unsubscribe any time.</p>
            </div>
            {done ? (
              <p role="status" className="rounded-2xl border border-lime/40 bg-lime/10 p-6 font-mono text-sm text-lime">You're on the list. Watch your inbox. ✓</p>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="nl-email" className="sr-only">Email address</label>
                <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="input !rounded-full !px-6" />
                <button className="btn-lime whitespace-nowrap">Subscribe →</button>
              </form>
            )}
          </div>
        </div>
      </WireframeReveal>
    </section>
  );
}
