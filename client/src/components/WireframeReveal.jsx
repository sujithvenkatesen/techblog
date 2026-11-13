import { useEffect, useRef } from 'react';

/**
 * Wireframe-to-Live reveal.
 * Wrapper shows a blueprint box + crosshair; on entering the viewport it
 * receives `.is-live` and the inner `.wf-content` fades/slides in.
 *
 * Visibility guarantee (content can never stay at opacity 0):
 *  1. Elements already in the viewport on mount go live immediately.
 *  2. IntersectionObserver (threshold 0.15) handles scroll reveals.
 *  3. A 500ms fallback timeout makes any in-viewport element live even if the
 *     observer never fires, and everything goes live if IO is unsupported.
 *  4. A throttled scroll/resize check + a ResizeObserver cover elements whose
 *     size changes after async data lands.
 */
export default function WireframeReveal({ as: Tag = 'div', delay, className = '', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let done = false;
    const cleanups = [];

    const go = () => {
      if (done) return;
      done = true;
      el.classList.add('is-live');
      cleanups.forEach((fn) => fn());
    };

    const inViewport = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.top < vh * 0.98 && r.bottom > 0;
    };

    // 1. Already visible on load -> live right away.
    if (inViewport()) {
      go();
      return undefined;
    }

    // No IntersectionObserver: never hide content.
    if (typeof IntersectionObserver === 'undefined') {
      go();
      return undefined;
    }

    // 2. Scroll reveal.
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && go(),
      { threshold: 0.15 }
    );
    io.observe(el);
    cleanups.push(() => io.disconnect());

    // 3. 500ms fail-safe for anything that is on screen but not yet reported.
    const t = setTimeout(() => inViewport() && go(), 500);
    cleanups.push(() => clearTimeout(t));

    // 4. Re-check on scroll/resize and when the element's size changes (async data).
    let raf = 0;
    const check = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => inViewport() && go());
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    });
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(check);
      ro.observe(el);
      cleanups.push(() => ro.disconnect());
    }

    return () => {
      done = true;
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <Tag ref={ref} className={`wf-reveal ${className}`} data-delay={delay} {...rest}>
      <div className="wf-content">{children}</div>
    </Tag>
  );
}
