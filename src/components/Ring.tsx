export function Ring({ pct, size = 28, stroke }: { pct: number; size?: number; stroke?: number }) {
  const sw = stroke ?? Math.max(3, size / 10);
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} className="ring-bg" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={sw} className="ring-fg"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {size >= 48 && <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="ring-text">{pct}%</text>}
    </svg>
  );
}
