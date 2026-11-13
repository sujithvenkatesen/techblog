import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BLOCK_COLORS } from './Brand';

/** One isometric cube: top / left / right faces, inner highlight, face letter. */
function Cube({ letter, color, textColor = '#fff' }) {
  return (
    <svg viewBox="0 0 100 112" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${letter}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
        <filter id={`s-${letter}`} x="-40%" y="-40%" width="180%" height="190%">
          <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>
      <g filter={`url(#s-${letter})`}>
        {/* faces */}
        <polygon points="50,4 96,30 50,56 4,30" fill={color} />
        <polygon points="4,30 50,56 50,108 4,82" fill={color} />
        <polygon points="50,56 96,30 96,82 50,108" fill={color} />
        {/* shading per face */}
        <polygon points="50,4 96,30 50,56 4,30" fill="#fff" opacity="0.32" />
        <polygon points="4,30 50,56 50,108 4,82" fill="#000" opacity="0.12" />
        <polygon points="50,56 96,30 96,82 50,108" fill="#000" opacity="0.34" />
        <polygon points="4,30 50,56 50,108 4,82" fill={`url(#g-${letter})`} />
        {/* inner highlight edges */}
        <polyline points="4,30 50,4 96,30" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="1.4" />
        <line x1="50" y1="56" x2="50" y2="108" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
        <polygon points="50,12 86,32 50,52 14,32" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1" />
        {/* letter on right face (skewed to match the plane) */}
        <g transform="matrix(1 -0.5556 0 1 50 56)">
          <text x="23" y="38" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="34" fill={textColor}>
            {letter}
          </text>
        </g>
      </g>
    </svg>
  );
}

const CUBES = [
  { letter: 'B', color: BLOCK_COLORS.B, text: '#fff', pos: 'left-[6%] top-[22%]', delay: 0 },
  { letter: 'L', color: BLOCK_COLORS.L, text: '#030407', pos: 'right-[6%] top-[12%]', delay: 0.5 },
  { letter: 'O', color: BLOCK_COLORS.O, text: '#fff', pos: 'left-[16%] bottom-[8%]', delay: 1 },
  { letter: 'K', color: BLOCK_COLORS.K, text: '#030407', pos: 'right-[14%] bottom-[16%]', delay: 1.5 },
];

const TAGS = [
  { label: 'CLOUD', cls: 'left-[2%] top-[6%]', d: 0 },
  { label: 'AI ENGINE', cls: 'right-[0%] top-[44%]', d: 1.2 },
  { label: 'SECURITY', cls: 'left-[8%] bottom-[2%]', d: 2.2 },
];

export default function Logo3D() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 16, y: px * 20 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative mx-auto aspect-square w-full max-w-[560px] select-none"
      style={{ perspective: 1100 }}
    >
      {/* Electric cobalt aura */}
      <div className="absolute inset-[4%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(21,88,201,.95) 0%, rgba(21,88,201,.5) 32%, rgba(21,88,201,.12) 58%, transparent 72%)', filter: 'blur(28px)' }} />
      <div className="absolute inset-[22%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(60,130,255,.55), transparent 70%)', filter: 'blur(18px)' }} />

      {/* Blueprint orbital rings */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden="true">
        <ellipse cx="200" cy="200" rx="188" ry="188" fill="none" stroke="#1558C9" strokeOpacity=".7" strokeDasharray="2 7" />
        <circle cx="388" cy="200" r="4" fill="#D4FF24" />
        <text x="14" y="204" fontFamily="JetBrains Mono" fontSize="12" fill="#1558C9">+</text>
      </svg>
      <svg viewBox="0 0 400 400" className="absolute inset-[9%] animate-spin-slower" aria-hidden="true">
        <ellipse cx="200" cy="200" rx="190" ry="120" fill="none" stroke="#1558C9" strokeOpacity=".55" transform="rotate(-24 200 200)" />
        <circle cx="30" cy="150" r="3.5" fill="#fff" fillOpacity=".8" />
      </svg>

      {/* Tilt layer */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: 'preserve-3d' }}
      >
        {CUBES.map((c, i) => (
          <motion.div
            key={c.letter}
            className={`absolute h-[36%] w-[36%] ${c.pos}`}
            style={{ translateZ: 20 + i * 12 }}
            animate={{ y: [0, -16, 0], rotate: [0, i % 2 ? 2 : -2, 0] }}
            transition={{ duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
          >
            <Cube letter={c.letter} color={c.color} textColor={c.text} />
          </motion.div>
        ))}
      </div>

      {/* Floating glass metadata tags */}
      {TAGS.map((t) => (
        <motion.span
          key={t.label}
          className={`glass absolute ${t.cls} rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white`}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: t.d }}
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-lime align-middle" />
          {t.label}
        </motion.span>
      ))}
    </div>
  );
}
