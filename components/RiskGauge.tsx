"use client";
import { riskColor } from "@/lib/risk";

interface Props {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
}

export default function RiskGauge({ score, level }: Props) {
  const rc = riskColor(level);
  const circumference = 2 * Math.PI * 62;
  const offset = circumference * (1 - score / 100);

  const ticks = Array.from({ length: 36 }, (_, i) => {
    const ang = (i / 36) * 360 * (Math.PI / 180);
    const big = i % 9 === 0;
    const r1 = big ? 70 : 72;
    const r2 = big ? 77 : 75;
    return {
      x1: 80 + r1 * Math.cos(ang - Math.PI / 2),
      y1: 80 + r1 * Math.sin(ang - Math.PI / 2),
      x2: 80 + r2 * Math.cos(ang - Math.PI / 2),
      y2: 80 + r2 * Math.sin(ang - Math.PI / 2),
      stroke: big ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)",
      strokeWidth: big ? 0.8 : 0.5,
    };
  });

  return (
    <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.stroke} strokeWidth={t.strokeWidth} />
        ))}
        <circle cx="80" cy="80" r="62" fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
        <circle cx="80" cy="80" r="62" fill="none"
          stroke={rc} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{
            filter: `drop-shadow(0 0 4px ${rc}55)`,
            transition: "stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1), stroke .4s",
          }}
        />
        <circle cx="80" cy="80" r="52" fill="none"
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
        <text x="80" y="78" textAnchor="middle" dominantBaseline="middle"
          fontFamily="'Bebas Neue', Impact" fontSize="44" fill={rc} letterSpacing="1">
          {score}
        </text>
        <text x="80" y="100" textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace" fontSize="8.5"
          fill="rgba(236,234,229,0.45)" letterSpacing="2">
          {level} RISK
        </text>
        <text x="80" y="112" textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace" fontSize="7"
          fill="rgba(236,234,229,0.14)" letterSpacing="1">
          / 100
        </text>
      </svg>
    </div>
  );
}
