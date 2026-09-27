// A small dependency-free line+bar chart drawn as inline SVG.
// Avoids pulling in a charting library for one simple trend view.
export default function TrendChart({ data, valueKey, label, color = '#1f6f5c' }) {
  const W = 700, H = 220, PAD = 30;
  const values = data.map((d) => d[valueKey]);
  const max = Math.max(1, ...values);
  const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - (d[valueKey] / max) * (H - PAD * 2);
    return [x, y];
  });
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ');

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label={label}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d9e1de" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        ))}
      </svg>
      <div className="chart-labels">
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{label}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}
