/**
 * CrisisSense AI v2 — Awwwards-Level Disaster Intelligence Platform
 * ─────────────────────────────────────────────────────────────────
 * Stack: React + Tailwind (optional) + Framer Motion (optional)
 * Fonts: Bebas Neue (display) · JetBrains Mono (data) · Inter (body)
 * AI:    Claude claude-sonnet-4-20250514 via Anthropic API (mock fallback included)
 *
 * Setup:
 *   npx create-next-app@latest crisissense --app
 *   cd crisissense && npm install
 *   Add to app/layout.tsx:
 *     <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
 *   Copy this file → app/page.tsx (rename .jsx → .tsx as needed)
 *   npm run dev
 *
 * API key: For production, proxy /api/anthropic → Anthropic API
 *          to keep your key server-side.
 */

"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────
const injectStyles = () => {
  if (typeof document === "undefined") return;
  const id = "cs-styles";
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@300;400;500&family=Inter:wght@300;400;500&display=swap');
    :root {
      --bg:#07070c; --s1:rgba(255,255,255,.032); --s2:rgba(255,255,255,.055);
      --b1:rgba(255,255,255,.07); --b2:rgba(255,255,255,.13); --b3:rgba(255,255,255,.22);
      --c:#22d3ee; --ca:rgba(34,211,238,.1); --cb:rgba(34,211,238,.22);
      --amber:#f59e0b; --rose:#f43f5e; --green:#4ade80;
      --text:#eceae5; --muted:rgba(236,234,229,.42); --ghost:rgba(236,234,229,.13);
      --D:'Bebas Neue',Impact,sans-serif;
      --M:'JetBrains Mono','Courier New',monospace;
      --S:'Inter',system-ui,sans-serif;
    }
    @keyframes char-up {
      from { transform: translateY(105%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes draw-x    { from { transform: scaleX(0) } }
    @keyframes slide-sm  { from { transform: translateY(14px); opacity: 0 } }
    @keyframes fade-in   { from { opacity: 0 } }
    @keyframes bar-grow  { from { width: 0 } }
    @keyframes spin-slow { to   { transform: rotate(360deg) } }
    @keyframes pulse-op  { 0%,100% { opacity: 1 } 50% { opacity: .25 } }
    @keyframes blink-cur { 50% { opacity: 0 } }
    @keyframes tweet-in  { from { transform: translateX(12px); opacity: 0 } }
    @keyframes num-pop   { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
    @keyframes scan-v    { 0%{top:-1px} 100%{top:100%} }
    @keyframes float-up  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

    body { background: var(--bg); font-family: var(--S); color: var(--text); overflow-x: hidden; }
    ::-webkit-scrollbar { width: 2px; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); }

    .cs-card {
      background: var(--s1); border: 1px solid var(--b1); padding: 18px;
      transition: border-color .2s;
    }
    .cs-card:hover { border-color: var(--b2); }
    .cs-lbl {
      font-family: var(--M); font-size: 9px; letter-spacing: .18em;
      color: var(--muted); display: block; margin-bottom: 11px; text-transform: uppercase;
    }
    .cs-pill {
      font-family: var(--M); font-size: 10px; letter-spacing: .1em;
      padding: 6px 13px; border: 1px solid var(--b1); background: transparent;
      color: var(--muted); cursor: pointer;
      transition: all .22s cubic-bezier(.16,1,.3,1); position: relative; overflow: hidden;
    }
    .cs-pill:hover  { color: var(--c); border-color: var(--cb); background: var(--ca); }
    .cs-pill.active { color: var(--c); border-color: var(--c); background: rgba(34,211,238,.07); }
    .cs-btn {
      font-family: var(--M); font-size: 11px; letter-spacing: .16em;
      padding: 13px 30px; border: 1px solid var(--text); color: var(--text);
      background: transparent; cursor: pointer;
      transition: all .26s cubic-bezier(.16,1,.3,1); position: relative; overflow: hidden;
    }
    .cs-btn::before {
      content: ''; position: absolute; inset: 0; background: var(--text);
      transform: translateY(101%); transition: transform .26s cubic-bezier(.16,1,.3,1);
    }
    .cs-btn:hover { color: var(--bg); }
    .cs-btn:hover::before { transform: translateY(0); }
    .cs-btn > span { position: relative; z-index: 1; }
    .cs-live-dot {
      width: 5px; height: 5px; border-radius: 50%; background: var(--green);
      box-shadow: 0 0 6px var(--green); animation: pulse-op 2.2s ease infinite;
    }
    .cs-tweet {
      padding: 10px 0; border-bottom: 1px solid var(--b1);
      animation: tweet-in .38s cubic-bezier(.16,1,.3,1) both;
    }
    .cs-tweet:last-child { border-bottom: none; }
    .cs-bar-track { height: 3px; background: var(--b1); overflow: hidden; }
    .cs-bar-fill  { height: 100%; animation: bar-grow .9s cubic-bezier(.16,1,.3,1) both; }
    .cs-ai-pre {
      font-family: var(--M); font-size: 11px; line-height: 1.9;
      color: rgba(34,211,238,.82); white-space: pre-wrap;
    }
  `;
  document.head.appendChild(s);
};

// ─── CITY DATA ─────────────────────────────────────────────────────────────
const CITIES = {
  Chennai: {
    vulnerability: 88,
    weather: { rainfall: 85, windSpeed: 62, humidity: 91, temp: 32, condition: "HEAVY RAIN WARNING" },
    threats: ["FLOOD", "CYCLONE"],
    dangerZones: [
      { name: "Adyar River Basin", lat: 13.00, lon: 80.25, radius: 44, level: "extreme" },
      { name: "Cooum River Area",  lat: 13.08, lon: 80.27, radius: 32, level: "high"    },
      { name: "Marina Coastal Belt",lat:13.06, lon: 80.29, radius: 26, level: "high"    },
    ],
    safeZones: [
      { name: "Anna Nagar Shelter", lat: 13.09, lon: 80.21 },
      { name: "T.Nagar Camp",       lat: 13.04, lon: 80.23 },
      { name: "Guindy Stadium",     lat: 13.01, lon: 80.22 },
    ],
    tweets: [
      { user: "ravi_chennai",  text: "Water rising in Adyar! Roads flooded near bridge. #ChennaiFloods", panic: true,  time: "2m" },
      { user: "news_tn",       text: "RED ALERT: 15cm rainfall in next 6hrs. Evacuate low-lying areas.", panic: true,  time: "5m" },
      { user: "priya_vlogs",   text: "Cooum water levels rising fast. Ground floor apartments at risk!", panic: true,  time: "8m" },
      { user: "weather_ind",   text: "Cyclonic system intensifying Bay of Bengal. Coastal areas on alert.", panic: true, time: "12m" },
      { user: "gk_krishnan",   text: "Need help at Besant Nagar! Water entering ground floor now.", panic: true,  time: "15m" },
      { user: "metro_che",     text: "Metro ops normal. Please avoid low-lying roads.", panic: false, time: "20m" },
    ],
  },
  Mumbai: {
    vulnerability: 79,
    weather: { rainfall: 72, windSpeed: 48, humidity: 88, temp: 29, condition: "ORANGE ALERT ACTIVE" },
    threats: ["FLOOD", "LANDSLIDE"],
    dangerZones: [
      { name: "Mithi River Zone",  lat: 19.07, lon: 72.87, radius: 36, level: "high"   },
      { name: "Dharavi Low-Lying", lat: 19.04, lon: 72.85, radius: 26, level: "high"   },
      { name: "Kurla Waterlogging",lat: 19.07, lon: 72.88, radius: 20, level: "medium" },
    ],
    safeZones: [
      { name: "BKC Evacuation Pt",    lat: 19.07, lon: 72.87 },
      { name: "Andheri Sports Complex",lat:19.12, lon: 72.84 },
      { name: "Bandra Relief Camp",   lat: 19.05, lon: 72.83 },
    ],
    tweets: [
      { user: "mum_floods",    text: "Mithi river overflowing! Kurla residents being evacuated now.", panic: true,  time: "3m"  },
      { user: "bmc_mum",       text: "Orange alert: avoid G/N ward low-lying areas. Pumping active.",  panic: false, time: "7m"  },
      { user: "reporter_local",text: "Waterlogging at CST, trains delayed. Avoid Sion-Dharavi road!",  panic: true,  time: "11m" },
      { user: "vijay_m",       text: "Stuck in flooding near Powai! Send help – water in cars.",        panic: true,  time: "14m" },
      { user: "ndrf_official", text: "3 NDRF teams deployed in Mumbai. Helpline: 1078",                panic: false, time: "19m" },
    ],
  },
  Delhi: {
    vulnerability: 55,
    weather: { rainfall: 22, windSpeed: 18, humidity: 58, temp: 38, condition: "HEATWAVE ADVISORY" },
    threats: ["HEATWAVE", "FLASH FLOOD"],
    dangerZones: [
      { name: "Yamuna Floodplain", lat: 28.65, lon: 77.25, radius: 30, level: "medium" },
      { name: "Old Delhi Low Zone",lat: 28.66, lon: 77.23, radius: 18, level: "medium" },
    ],
    safeZones: [
      { name: "Civil Lines Shelter", lat: 28.68, lon: 77.22 },
      { name: "Connaught Hub",       lat: 28.63, lon: 77.22 },
    ],
    tweets: [
      { user: "delhi_wx",     text: "Temperature: 44°C. Severe heat stroke risk. Avoid outdoors.",    panic: true,  time: "5m"  },
      { user: "yamuna_watch", text: "Yamuna levels rising. Floodplain residents warned.",              panic: true,  time: "9m"  },
      { user: "ndmc_delhi",   text: "Water shortage E.Delhi. Tankers deployed in affected wards.",    panic: false, time: "16m" },
      { user: "rk_news",      text: "Evening drizzle may trigger flash floods in low areas.",         panic: false, time: "21m" },
    ],
  },
  Kolkata: {
    vulnerability: 72,
    weather: { rainfall: 65, windSpeed: 55, humidity: 86, temp: 31, condition: "CYCLONE WARNING ZONE" },
    threats: ["CYCLONE", "FLOOD"],
    dangerZones: [
      { name: "Sundarbans Belt",    lat: 22.40, lon: 88.60, radius: 42, level: "extreme" },
      { name: "S.Kolkata Low Zone", lat: 22.53, lon: 88.35, radius: 28, level: "high"    },
      { name: "Hooghly Riverside",  lat: 22.58, lon: 88.34, radius: 22, level: "medium"  },
    ],
    safeZones: [
      { name: "Salt Lake Stadium",  lat: 22.58, lon: 88.40 },
      { name: "New Town Relief Hub",lat: 22.59, lon: 88.47 },
    ],
    tweets: [
      { user: "kol_live",    text: "Cyclone JAWAD: Sundarbans RED ALERT. Evacuate coastal areas NOW.", panic: true,  time: "1m"  },
      { user: "wb_disaster", text: "340 cyclone shelters open. 2 lakh people already evacuated.",     panic: false, time: "6m"  },
      { user: "tapas_local", text: "Wind speed rising fast in Diamond Harbour. Trees falling!",        panic: true,  time: "10m" },
      { user: "river_alert", text: "Hooghly breaches embankment at 2 points. Water rising fast!",     panic: true,  time: "13m" },
    ],
  },
  Bangalore: {
    vulnerability: 38,
    weather: { rainfall: 18, windSpeed: 14, humidity: 64, temp: 26, condition: "LIGHT SHOWERS" },
    threats: ["MINOR FLOODING"],
    dangerZones: [
      { name: "Bellandur Lake Area", lat: 12.93, lon: 77.66, radius: 14, level: "low" },
    ],
    safeZones: [
      { name: "Cubbon Park Rally",    lat: 12.98, lon: 77.59 },
      { name: "Banashankari Center",  lat: 12.92, lon: 77.57 },
    ],
    tweets: [
      { user: "blr_rains",    text: "Light showers across city. Outer Ring Rd has minor puddles.",  panic: false, time: "8m"  },
      { user: "bbmp_official",text: "Drains cleared. Minor waterlogging possible in low areas only.",panic: false, time: "15m" },
      { user: "tech_blr",     text: "IT corridor roads clear. Normal commute today.",               panic: false, time: "23m" },
    ],
  },
};

// ─── RISK ENGINE ───────────────────────────────────────────────────────────
function calcRisk(city) {
  const d = CITIES[city];
  const wS = Math.min(100, (d.weather.rainfall * 0.5) + (d.weather.windSpeed * 0.3) + (d.weather.humidity * 0.2));
  const keywords = ["flood","help","water rising","evacuate","danger","rising","breach","cyclone","emergency","stuck","alert"];
  const panicCount = d.tweets.reduce((a, t) => a + keywords.filter(k => t.text.toLowerCase().includes(k)).length, 0);
  const sS = Math.min(100, panicCount * 8);
  const score = Math.round((wS * 0.5) + (sS * 0.3) + (d.vulnerability * 0.2));
  const level = score < 30 ? "LOW" : score < 70 ? "MEDIUM" : "HIGH";
  return { score, level, wS: Math.round(wS), sS: Math.round(sS), lV: d.vulnerability };
}
const riskColor = (lv) => lv === "LOW" ? "#4ade80" : lv === "MEDIUM" ? "#f59e0b" : "#f43f5e";

// ─── CANVAS BACKGROUND ─────────────────────────────────────────────────────
function CanvasBackground() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const spacing = 42;
    const dots = [];
    for (let x = spacing / 2; x < canvas.width; x += spacing)
      for (let y = spacing / 2; y < canvas.height; y += spacing)
        dots.push({ x, y, phase: Math.random() * Math.PI * 2, speed: 0.008 + Math.random() * 0.006 });
    let t = 0;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        const op = 0.028 + 0.022 * Math.sin(t * d.speed + d.phase);
        ctx.beginPath(); ctx.arc(d.x, d.y, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${op})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.6 }} />;
}

// ─── SPLIT-TEXT HERO ───────────────────────────────────────────────────────
function SplitText({ text, baseDelay = 0, color }) {
  return (
    <span style={{ fontFamily: "var(--D)", letterSpacing: "0.04em", lineHeight: 0.92, display: "inline-block" }}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", lineHeight: 0.92 }}>
          <span style={{
            display: "inline-block",
            color: color || "var(--text)",
            animation: `char-up 0.7s cubic-bezier(.16,1,.3,1) ${baseDelay + i * 0.04}s both`,
          }}>{ch === " " ? "\u00A0" : ch}</span>
        </span>
      ))}
    </span>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────
function LandingPage({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <CanvasBackground />
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 28px", borderBottom: "1px solid var(--b1)", background: "rgba(7,7,12,.94)", backdropFilter: "blur(18px)", position: "relative", zIndex: 10 }}>
        <div style={{ fontFamily: "var(--D)", fontSize: 17, letterSpacing: "0.1em", color: "var(--text)" }}>
          CRISIS<span style={{ color: "var(--c)" }}>SENSE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="cs-live-dot" />
          <span style={{ fontFamily: "var(--M)", fontSize: 9, color: "#4ade80", letterSpacing: "0.12em" }}>LIVE MONITORING</span>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px 24px", position: "relative", zIndex: 2 }}>
        <div style={{ overflow: "hidden", marginBottom: 20, animation: "slide-sm .5s .1s both", opacity: 0 }}>
          <span style={{ fontFamily: "var(--M)", fontSize: 9, letterSpacing: "0.28em", color: "var(--c)", opacity: 0.75 }}>
            ◈ AI-POWERED DISASTER INTELLIGENCE PLATFORM
          </span>
        </div>
        <div style={{ marginBottom: 24, lineHeight: 0.92 }}>
          <div style={{ fontSize: "clamp(52px,13vw,96px)" }}>
            <SplitText text="CRISIS" baseDelay={0} />
          </div>
          <div style={{ fontSize: "clamp(52px,13vw,96px)" }}>
            <SplitText text="SENSE" baseDelay={0.28} />
            <SplitText text=" AI" baseDelay={0.48} color="var(--c)" />
          </div>
        </div>
        <div style={{ height: 1, background: "var(--b2)", transformOrigin: "left", animation: "draw-x .7s .8s cubic-bezier(.16,1,.3,1) both", marginBottom: 22 }} />
        <div style={{ animation: "slide-sm .5s .9s both", opacity: 0, marginBottom: 32 }}>
          <span style={{ fontFamily: "var(--M)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.22em" }}>PREDICT &nbsp;·&nbsp; PREPARE &nbsp;·&nbsp; PROTECT</span>
        </div>
        <div style={{ animation: "slide-sm .5s 1s both", opacity: 0, display: "flex", gap: 12, alignItems: "center" }}>
          <button className="cs-btn" onClick={onStart}><span>START ANALYSIS →</span></button>
          <span style={{ fontFamily: "var(--M)", fontSize: 9, color: "var(--ghost)", letterSpacing: "0.12em" }}>NO API KEY REQUIRED TO DEMO</span>
        </div>
      </main>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid var(--b1)", animation: "fade-in .5s 1.2s both", opacity: 0, position: "relative", zIndex: 2 }}>
        {[["847","SENSORS ACTIVE"],["12.4K","SIGNALS / HOUR"],["99.2%","UPTIME SLA"],["<2s","RESPONSE TIME"]].map(([v, l]) => (
          <div key={l} style={{ padding: "13px 20px", borderRight: "1px solid var(--b1)" }}>
            <div style={{ fontFamily: "var(--D)", fontSize: 20, letterSpacing: "0.02em" }}>{v}</div>
            <div style={{ fontFamily: "var(--M)", fontSize: 8, color: "var(--ghost)", letterSpacing: "0.2em", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RISK GAUGE (SVG) ──────────────────────────────────────────────────────
function RiskGauge({ score, level }) {
  const rc = riskColor(level);
  const circumference = 2 * Math.PI * 62;
  const offset = circumference * (1 - score / 100);
  return (
    <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Tick marks */}
        {Array.from({ length: 36 }, (_, i) => {
          const ang = (i / 36) * 360 * (Math.PI / 180);
          const big = i % 9 === 0;
          const r1 = big ? 70 : 72, r2 = big ? 77 : 75;
          return <line key={i} x1={80 + r1 * Math.cos(ang - Math.PI / 2)} y1={80 + r1 * Math.sin(ang - Math.PI / 2)} x2={80 + r2 * Math.cos(ang - Math.PI / 2)} y2={80 + r2 * Math.sin(ang - Math.PI / 2)} stroke={big ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.07)"} strokeWidth={big ? ".8" : ".5"} />;
        })}
        <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth=".8" />
        <circle cx="80" cy="80" r="62" fill="none" stroke={rc} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ filter: `drop-shadow(0 0 4px ${rc}55)`, transition: "stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1), stroke .4s" }}
        />
        <circle cx="80" cy="80" r="52" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth=".4" />
        <text x="80" y="78" textAnchor="middle" dominantBaseline="middle" fontFamily="'Bebas Neue',Impact" fontSize="44" fill={rc} letterSpacing="1">{score}</text>
        <text x="80" y="100" textAnchor="middle" fontFamily="'JetBrains Mono'" fontSize="8.5" fill="var(--muted)" letterSpacing="2">{level} RISK</text>
        <text x="80" y="112" textAnchor="middle" fontFamily="'JetBrains Mono'" fontSize="7" fill="var(--ghost)" letterSpacing="1">/ 100</text>
      </svg>
    </div>
  );
}

// ─── TACTICAL MAP ──────────────────────────────────────────────────────────
function TacticalMap({ cityName, dangerZones, safeZones }) {
  const W = 560, H = 180;
  const allPts = [...dangerZones, ...safeZones];
  const lats = allPts.map(z => z.lat), lons = allPts.map(z => z.lon);
  const minLat = Math.min(...lats) - 0.07, maxLat = Math.max(...lats) + 0.07;
  const minLon = Math.min(...lons) - 0.07, maxLon = Math.max(...lons) + 0.07;
  const xy = (lat, lon) => ({ x: ((lon - minLon) / (maxLon - minLon)) * (W - 80) + 40, y: ((maxLat - lat) / (maxLat - minLat)) * (H - 50) + 25 });
  const lc = { extreme: "#f43f5e", high: "#f97316", medium: "#f59e0b", low: "#facc15" };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        {dangerZones.map((z, i) => (
          <radialGradient key={i} id={`dg${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lc[z.level] || "#f43f5e"} stopOpacity=".35" />
            <stop offset="100%" stopColor={lc[z.level] || "#f43f5e"} stopOpacity="0" />
          </radialGradient>
        ))}
        {safeZones.map((_, i) => (
          <radialGradient key={i} id={`sg${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity=".25" /><stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <rect width={W} height={H} fill="#050509" />
      {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={i * W / 11} y1="0" x2={i * W / 11} y2={H} stroke="rgba(255,255,255,0.04)" strokeWidth=".4" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * H / 6} x2={W} y2={i * H / 6} stroke="rgba(255,255,255,0.04)" strokeWidth=".4" />)}
      {dangerZones.map((z, i) => { const { x, y } = xy(z.lat, z.lon); const r = z.radius * 0.9; return (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={`url(#dg${i})`} />
          <circle cx={x} cy={y} r={r} fill="none" stroke={lc[z.level] || "#f43f5e"} strokeWidth=".6" strokeDasharray="4 3" opacity=".7" />
          <circle cx={x} cy={y} r="4.5" fill={lc[z.level] || "#f43f5e"} opacity=".92" />
          <text x={x + 8} y={y - 5} fontFamily="'JetBrains Mono'" fontSize="7.5" fill={lc[z.level] || "#f43f5e"} opacity=".8">{z.name.slice(0, 17)}</text>
        </g>
      ); })}
      {safeZones.map((z, i) => { const { x, y } = xy(z.lat, z.lon); return (
        <g key={i}>
          <circle cx={x} cy={y} r="18" fill={`url(#sg${i})`} />
          <polygon points={`${x},${y - 8} ${x - 6},${y + 5} ${x + 6},${y + 5}`} fill="#4ade80" opacity=".88" />
          <text x={x + 9} y={y + 3} fontFamily="'JetBrains Mono'" fontSize="7" fill="#4ade80" opacity=".7">{z.name.slice(0, 15)}</text>
        </g>
      ); })}
      <path d="M4 14 L4 4 L14 4" fill="none" stroke="rgba(34,211,238,.3)" strokeWidth=".8" />
      <path d={`M${W - 4} 14 L${W - 4} 4 L${W - 14} 4`} fill="none" stroke="rgba(34,211,238,.3)" strokeWidth=".8" />
      <path d={`M4 ${H - 14} L4 ${H - 4} L14 ${H - 4}`} fill="none" stroke="rgba(34,211,238,.3)" strokeWidth=".8" />
      <path d={`M${W - 4} ${H - 14} L${W - 4} ${H - 4} L${W - 14} ${H - 4}`} fill="none" stroke="rgba(34,211,238,.3)" strokeWidth=".8" />
      <text x={W / 2} y={H - 6} textAnchor="middle" fontFamily="'JetBrains Mono'" fontSize="7" fill="rgba(255,255,255,0.12)" letterSpacing="3">{cityName.toUpperCase()} — THREAT TOPOLOGY</text>
    </svg>
  );
}

// ─── AI PANEL ──────────────────────────────────────────────────────────────
function AIPanel({ cityName, riskData }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const generate = useCallback(async () => {
    setTriggered(true); setLoading(true); setReady(false); setText("");
    const d = CITIES[cityName];
    const prompt = `You are CrisisSense AI — an emergency response intelligence system. Active threat alert.
LOCATION: ${cityName}, India | RISK: ${riskData.level} (${riskData.score}/100) | THREATS: ${d.threats.join(", ")}
CONDITIONS: ${d.weather.condition} | Rain: ${d.weather.rainfall}mm | Wind: ${d.weather.windSpeed}km/h

Generate a structured emergency briefing:
⚠ IMMEDIATE ACTIONS (3 bullet points — critical right now)
🏠 EVACUATION PROTOCOL (2-3 steps specific to ${cityName})
📦 EMERGENCY KIT (5 essential items)
📞 EMERGENCY CONTACTS (real Indian helpline numbers)
🔴 CRITICAL ALERT (single most urgent warning sentence)
Max 15 words per point. Urgent, direct language.`;

    const fallback = `⚠ IMMEDIATE ACTIONS
• Evacuate all ground-floor and basement areas immediately — do not wait
• Shut main electrical breaker before leaving — prevents electrocution risk
• Alert neighbors and assist mobility-impaired residents to evacuate now

🏠 EVACUATION PROTOCOL
• Use primary arterial roads marked by local disaster authority for ${cityName}
• Register at government shelter with Aadhaar ID and 72-hour supplies
• Never cross flooded roads — even 6 inches of water is lethal in vehicles

📦 EMERGENCY KIT
• Drinking water: 3 liters per person minimum for 72 hours
• All prescription medications — full course plus one week extra
• Waterproof bag: Aadhaar, bank cards, emergency cash (small denominations)
• Torch, charged powerbank, hand-crank or battery-powered radio
• First aid kit with ORS sachets and antiseptic wound dressings

📞 EMERGENCY CONTACTS
• National Disaster Helpline: 1078 (free, 24/7)
• Police: 100  |  Fire: 101  |  Ambulance: 108
• NDRF Control Room: 011-24363260
• State Disaster Management: 1070

🔴 CRITICAL ALERT
${riskData.score > 70 ? "Immediate evacuation required — do NOT shelter in low-lying buildings under any circumstances." : "Stay prepared and monitor alerts — conditions may deteriorate rapidly within hours."}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 900, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const out = data.content?.map(b => b.text || "").join("") || "";
      stream(out || fallback);
    } catch { stream(fallback); }
    finally { setLoading(false); }
  }, [cityName, riskData]);

  const stream = (full) => {
    let i = 0;
    const iv = setInterval(() => {
      i += 4; setText(full.slice(0, i));
      if (i >= full.length) { setText(full); clearInterval(iv); setReady(true); }
    }, 16);
  };

  if (!triggered) return (
    <div style={{ padding: "24px 0", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--M)", fontSize: 9, color: "var(--ghost)", letterSpacing: "0.2em", marginBottom: 18, animation: "float-up 3s ease infinite" }}>CLAUDE AI ENGINE STANDBY</div>
      <button className="cs-btn" onClick={generate}><span>⚡ GENERATE BRIEFING</span></button>
    </div>
  );

  return (
    <div>
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--b1)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c)", animation: "pulse-op .7s ease infinite" }} />
          <span style={{ fontFamily: "var(--M)", fontSize: 9, color: "var(--c)", letterSpacing: "0.14em" }}>ANALYZING THREAT DATA...</span>
        </div>
      )}
      {text && <pre className="cs-ai-pre">{text}{loading && <span style={{ animation: "blink-cur .8s step-end infinite" }}>█</span>}</pre>}
      {ready && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 12, borderTop: "1px solid var(--b1)" }}>
          <span style={{ fontFamily: "var(--M)", fontSize: 7, color: "var(--ghost)", letterSpacing: "0.1em" }}>CLAUDE · {cityName.toUpperCase()} · {new Date().toLocaleTimeString()}</span>
          <button className="cs-btn" style={{ padding: "5px 12px", fontSize: 9 }} onClick={generate}><span>↺ REFRESH</span></button>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ onBack }) {
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const select = (name) => {
    setCity(name); setReady(false); setLoading(true);
    setTimeout(() => { setLoading(false); setReady(true); }, 1500);
  };

  const d = city ? CITIES[city] : null;
  const r = city ? calcRisk(city) : null;
  const rc = r ? riskColor(r.level) : "var(--c)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <CanvasBackground />
      {/* Sticky nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 22px", borderBottom: "1px solid var(--b1)", background: "rgba(7,7,12,.94)", backdropFilter: "blur(18px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ fontFamily: "var(--M)", fontSize: 9, letterSpacing: "0.14em", padding: "5px 10px", border: "1px solid var(--b2)", color: "var(--muted)", background: "transparent", cursor: "pointer" }}>← BACK</button>
          <div style={{ fontFamily: "var(--D)", fontSize: 15, letterSpacing: "0.1em" }}>CRISIS<span style={{ color: "var(--c)" }}>SENSE</span></div>
          <span style={{ fontFamily: "var(--M)", fontSize: 8, color: "var(--ghost)", letterSpacing: "0.12em" }}>/ ANALYSIS</span>
        </div>
        {r && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", border: `1px solid ${rc}`, color: rc, fontFamily: "var(--M)", fontSize: 9, letterSpacing: "0.12em" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: rc, animation: "pulse-op 2s infinite" }} />
            {r.level} RISK · {r.score}/100
          </div>
        )}
      </nav>

      {/* City selector */}
      <div style={{ padding: "14px 22px", borderBottom: "1px solid var(--b1)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 2 }}>
        <span style={{ fontFamily: "var(--M)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ghost)", marginRight: 4 }}>REGION</span>
        {Object.keys(CITIES).map(name => (
          <button key={name} className={`cs-pill${city === name ? " active" : ""}`} onClick={() => select(name)}>{name.toUpperCase()}</button>
        ))}
      </div>

      <div style={{ padding: "18px 22px", position: "relative", zIndex: 2 }}>
        {/* Empty */}
        {!city && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 14 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ opacity: 0.15, animation: "spin-slow 12s linear infinite" }}>
              <circle cx="24" cy="24" r="20" stroke="#22d3ee" strokeWidth=".8" strokeDasharray="5 4" fill="none" />
            </svg>
            <span style={{ fontFamily: "var(--M)", fontSize: 9, letterSpacing: "0.22em", color: "var(--ghost)" }}>SELECT A REGION ABOVE</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 20 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: "spin-slow 1s linear infinite" }}>
              <circle cx="26" cy="26" r="20" fill="none" stroke="var(--b1)" strokeWidth="2" />
              <path d="M26 6 A20 20 0 0 1 46 26" fill="none" stroke="var(--c)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "var(--M)", fontSize: 9, letterSpacing: "0.18em", color: "var(--c)" }}>ANALYZING THREAT DATA...</span>
          </div>
        )}

        {/* Analysis */}
        {ready && d && r && (
          <div style={{ animation: "fade-in .5s ease" }}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div className="cs-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 18px" }}>
                <span className="cs-lbl" style={{ alignSelf: "flex-start" }}>RISK ASSESSMENT</span>
                <RiskGauge score={r.score} level={r.level} />
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 10, marginBottom: 6 }}>
                  {d.threats.map(t => <span key={t} style={{ fontFamily: "var(--M)", fontSize: 8, letterSpacing: "0.12em", padding: "3px 8px", border: `1px solid ${rc}44`, color: rc, background: `${rc}11` }}>{t}</span>)}
                </div>
                <div style={{ fontFamily: "var(--M)", fontSize: 8, letterSpacing: "0.2em", color: "var(--ghost)" }}>{city.toUpperCase()} · INDIA</div>
              </div>

              <div className="cs-card">
                <span className="cs-lbl">WEATHER INTEL</span>
                <div style={{ fontFamily: "var(--D)", fontSize: 18, letterSpacing: "0.06em", color: "var(--amber)", marginBottom: 18, lineHeight: 1 }}>{d.weather.condition}</div>
                {[["RAINFALL", d.weather.rainfall, "mm", "#60a5fa"], ["WIND", d.weather.windSpeed, "km/h", "#22d3ee"], ["HUMIDITY", d.weather.humidity, "%", "#a5f3fc"], ["TEMP", d.weather.temp, "°C", "#fbbf24"]].map(([l, v, u, c], i) => (
                  <div key={l} style={{ marginBottom: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--M)", fontSize: 8, letterSpacing: "0.14em", color: "var(--muted)" }}>{l}</span>
                      <span style={{ fontFamily: "var(--D)", fontSize: 15, color: c, letterSpacing: "0.04em" }}>{v}<span style={{ fontFamily: "var(--M)", fontSize: 8, opacity: 0.6 }}>{u}</span></span>
                    </div>
                    <div className="cs-bar-track"><div className="cs-bar-fill" style={{ width: `${Math.min(100, v)}%`, background: c, animationDelay: `${i * 0.12}s` }} /></div>
                  </div>
                ))}
              </div>

              <div className="cs-card">
                <span className="cs-lbl">SCORE FORMULA</span>
                {[["WEATHER SEVERITY", r.wS, "0.50", "#60a5fa"], ["SOCIAL SIGNALS", r.sS, "0.30", "#f43f5e"], ["LOCATION VULN.", r.lV, "0.20", "#f59e0b"]].map(([l, v, w, c], i) => (
                  <div key={l} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--M)", fontSize: 8, letterSpacing: "0.12em", color: "var(--ghost)" }}>{l}</span>
                      <span style={{ fontFamily: "var(--M)", fontSize: 8, color: "var(--muted)" }}>×{w}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="cs-bar-track" style={{ flex: 1 }}><div className="cs-bar-fill" style={{ width: `${v}%`, background: c, animationDelay: `${0.1 + i * 0.14}s` }} /></div>
                      <span style={{ fontFamily: "var(--D)", fontSize: 17, color: c, minWidth: 24, textAlign: "right" }}>{v}</span>
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: 12, borderTop: "1px solid var(--b1)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <span style={{ fontFamily: "var(--M)", fontSize: 8, letterSpacing: "0.16em", color: "var(--ghost)" }}>TOTAL</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--D)", fontSize: 36, color: rc, letterSpacing: "0.02em", lineHeight: 1, animation: "num-pop .5s .4s both", opacity: 0 }}>{r.score}</div>
                    <div style={{ fontFamily: "var(--M)", fontSize: 7, letterSpacing: "0.16em", color: "var(--ghost)", marginTop: 1 }}>RISK SCORE</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Map */}
            <div className="cs-card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="cs-lbl" style={{ marginBottom: 0 }}>TACTICAL ZONE MAP</span>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["var(--rose)", "DANGER"], ["var(--green)", "SHELTER"]].map(([c, l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block" }} />
                      <span style={{ fontFamily: "var(--M)", fontSize: 8, color: "var(--ghost)", letterSpacing: "0.1em" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <TacticalMap cityName={city} dangerZones={d.dangerZones} safeZones={d.safeZones} />
            </div>

            {/* Row 3: Feed + Indicators */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div className="cs-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="cs-lbl" style={{ marginBottom: 0 }}>SIGNAL FEED</span>
                  <span style={{ fontFamily: "var(--M)", fontSize: 8, color: "var(--rose)", letterSpacing: "0.1em" }}>{d.tweets.filter(t => t.panic).length} PANIC SIGNALS</span>
                </div>
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {d.tweets.map((t, i) => (
                    <div key={i} className="cs-tweet" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontFamily: "var(--M)", fontSize: 9, color: t.panic ? "#f87171" : "var(--c)", letterSpacing: "0.08em" }}>@{t.user}</span>
                        <span style={{ fontFamily: "var(--M)", fontSize: 8, color: "var(--ghost)" }}>{t.time} ago</span>
                      </div>
                      <p style={{ fontSize: 11, color: t.panic ? "rgba(236,234,229,.75)" : "var(--muted)", lineHeight: 1.5 }}>{t.text}</p>
                      {t.panic && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}><span style={{ width: 4, height: 4, borderRadius: "50%", background: "#f43f5e", display: "inline-block", animation: "pulse-op 1s infinite" }} /><span style={{ fontFamily: "var(--M)", fontSize: 8, color: "#f87171", letterSpacing: "0.1em" }}>PANIC KEYWORD</span></div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="cs-card">
                <span className="cs-lbl">THREAT INDICATORS</span>
                {[["FLOOD RISK", r.score > 60 ? "ELEVATED" : "MODERATE", r.score > 60 ? "#f43f5e" : "#f59e0b"], ["EVACUATION", r.score > 70 ? "RECOMMENDED" : "ADVISORY", r.score > 70 ? "#f43f5e" : "#f59e0b"], ["INFRASTRUCTURE", r.score > 50 ? "AT RISK" : "STABLE", r.score > 50 ? "#f59e0b" : "#4ade80"], ["SHELTER CAPACITY", "AVAILABLE", "#4ade80"], ["EMERGENCY SERVICES", r.score > 80 ? "OVERWHELMED" : "ACTIVE", r.score > 80 ? "#f43f5e" : "#4ade80"]].map(([l, s, c]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--b1)" }}>
                    <span style={{ fontFamily: "var(--M)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.08em" }}>{l}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c, display: "inline-block" }} />
                      <span style={{ fontFamily: "var(--M)", fontSize: 8, letterSpacing: "0.1em", color: c }}>{s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 4: AI Briefing */}
            <div className="cs-card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(34,211,238,.18),transparent)", animation: "scan-v 5s linear infinite", top: -1, pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="cs-lbl" style={{ marginBottom: 0 }}>AI EMERGENCY BRIEFING</span>
                <span style={{ fontFamily: "var(--M)", fontSize: 7, color: "var(--ghost)", letterSpacing: "0.1em" }}>CLAUDE AI · {city.toUpperCase()}</span>
              </div>
              <AIPanel key={city} cityName={city} riskData={r} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ───────────────────────────────────────────────────────────────────
export default function CrisisSenseApp() {
  useEffect(() => { injectStyles(); }, []);
  const [view, setView] = useState("landing");
  return view === "landing"
    ? <LandingPage onStart={() => setView("dashboard")} />
    : <Dashboard onBack={() => setView("landing")} />;
}
