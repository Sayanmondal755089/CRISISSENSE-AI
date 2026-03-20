"use client";
import { DangerZone, SafeZone } from "@/lib/cities";

interface Props {
  cityName: string;
  dangerZones: DangerZone[];
  safeZones: SafeZone[];
}

const LEVEL_COLOR: Record<string, string> = {
  extreme: "#f43f5e",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#facc15",
};

export default function TacticalMap({ cityName, dangerZones, safeZones }: Props) {
  const W = 560, H = 180;
  const allPts = [...dangerZones, ...safeZones];
  const lats = allPts.map((z) => z.lat);
  const lons = allPts.map((z) => z.lon);
  const minLat = Math.min(...lats) - 0.07;
  const maxLat = Math.max(...lats) + 0.07;
  const minLon = Math.min(...lons) - 0.07;
  const maxLon = Math.max(...lons) + 0.07;

  const xy = (lat: number, lon: number) => ({
    x: ((lon - minLon) / (maxLon - minLon)) * (W - 80) + 40,
    y: ((maxLat - lat) / (maxLat - minLat)) * (H - 50) + 25,
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        {dangerZones.map((z, i) => (
          <radialGradient key={`dg${i}`} id={`dg${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={LEVEL_COLOR[z.level] ?? "#f43f5e"} stopOpacity="0.35" />
            <stop offset="100%" stopColor={LEVEL_COLOR[z.level] ?? "#f43f5e"} stopOpacity="0" />
          </radialGradient>
        ))}
        {safeZones.map((_, i) => (
          <radialGradient key={`sg${i}`} id={`sg${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="#050509" />

      {/* Grid lines */}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`v${i}`} x1={i * W / 11} y1="0" x2={i * W / 11} y2={H}
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * H / 6} x2={W} y2={i * H / 6}
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
      ))}

      {/* Danger zones */}
      {dangerZones.map((z, i) => {
        const { x, y } = xy(z.lat, z.lon);
        const r = z.radius * 0.9;
        const c = LEVEL_COLOR[z.level] ?? "#f43f5e";
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={`url(#dg${i})`} />
            <circle cx={x} cy={y} r={r} fill="none" stroke={c}
              strokeWidth="0.6" strokeDasharray="4 3" opacity="0.7" />
            <circle cx={x} cy={y} r="4.5" fill={c} opacity="0.92" />
            <text x={x + 8} y={y - 5} fontFamily="'JetBrains Mono', monospace"
              fontSize="7.5" fill={c} opacity="0.8">
              {z.name.slice(0, 17)}
            </text>
            {z.level === "extreme" && (
              <circle cx={x} cy={y} r={r + 8} fill="none" stroke={c}
                strokeWidth="0.4" opacity="0.25" className="animate-pulse" />
            )}
          </g>
        );
      })}

      {/* Safe zones */}
      {safeZones.map((z, i) => {
        const { x, y } = xy(z.lat, z.lon);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="18" fill={`url(#sg${i})`} />
            <polygon
              points={`${x},${y - 8} ${x - 6},${y + 5} ${x + 6},${y + 5}`}
              fill="#4ade80" opacity="0.88"
            />
            <text x={x + 9} y={y + 3} fontFamily="'JetBrains Mono', monospace"
              fontSize="7" fill="#4ade80" opacity="0.7">
              {z.name.slice(0, 15)}
            </text>
          </g>
        );
      })}

      {/* Corner brackets */}
      <path d="M4 14 L4 4 L14 4" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" />
      <path d={`M${W - 4} 14 L${W - 4} 4 L${W - 14} 4`} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" />
      <path d={`M4 ${H - 14} L4 ${H - 4} L14 ${H - 4}`} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" />
      <path d={`M${W - 4} ${H - 14} L${W - 4} ${H - 4} L${W - 14} ${H - 4}`} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" />

      {/* City label */}
      <text x={W / 2} y={H - 6} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="7"
        fill="rgba(255,255,255,0.12)" letterSpacing="3">
        {cityName.toUpperCase()} — THREAT TOPOLOGY
      </text>
    </svg>
  );
}
