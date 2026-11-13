import { Link } from 'react-router-dom';

export const BLOCK_COLORS = {
  B: '#FF5A4F',
  L: '#D4FF24',
  O: '#1558C9',
  K: '#FFB020',
};

/** Flat 4-square badge used in navbar + footer (original mark, not a third-party logo). */
export function BrandBadge({ size = 36 }) {
  const cells = [
    ['B', BLOCK_COLORS.B, '#fff'],
    ['L', BLOCK_COLORS.L, '#030407'],
    ['O', BLOCK_COLORS.O, '#fff'],
    ['K', BLOCK_COLORS.K, '#030407'],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Blockwise logo">
      {cells.map(([ch, fill, text], i) => {
        const x = (i % 2) * 20 + 1;
        const y = Math.floor(i / 2) * 20 + 1;
        return (
          <g key={ch}>
            <rect x={x} y={y} width="18" height="18" rx="5" fill={fill} />
            <text x={x + 9} y={y + 13} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="11" fill={text}>
              {ch}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function BrandLink({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`} aria-label="Blockwise Tech Blog home">
      <BrandBadge />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[15px] font-extrabold tracking-tight text-white">Blockwise</span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Tech Blog</span>
      </span>
    </Link>
  );
}
