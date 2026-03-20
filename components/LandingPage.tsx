"use client";
import { useEffect, useState } from "react";
import CanvasBackground from "./CanvasBackground";

interface Props {
  onStart: () => void;
}

function SplitText({ text, baseDelay = 0, color }: { text: string; baseDelay?: number; color?: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            lineHeight: 0.92,
          }}
        >
          <span
            style={{
              display: "inline-block",
              color: color ?? "var(--cs-text)",
              animation: `charUp 0.7s cubic-bezier(.16,1,.3,1) ${baseDelay + i * 0.04}s both`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      ))}
    </>
  );
}

const TICKERS = [
  "◈ MONITORING 847 SENSORS ACTIVE",
  "◈ ANALYZING SOCIAL MEDIA SIGNALS",
  "◈ SATELLITE WEATHER FEED CONNECTED",
  "◈ AI THREAT MODEL ONLINE",
];

export default function LandingPage({ onStart }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => (t + 1) % TICKERS.length), 2800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--cs-bg)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      <CanvasBackground />

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 28px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(7,7,12,0.94)",
        backdropFilter: "blur(18px)",
        position: "relative", zIndex: 10,
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, letterSpacing: "0.1em", color: "var(--cs-text)" }}>
          CRISIS<span style={{ color: "var(--cs-cyan)" }}>SENSE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--cs-green)", boxShadow: "0 0 6px var(--cs-green)", display: "inline-block", animation: "pulseOp 2.2s ease infinite" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--cs-green)", letterSpacing: "0.12em" }}>
            LIVE MONITORING
          </span>
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px 24px", position: "relative", zIndex: 2 }}>
        {/* Eyebrow */}
        <div style={{ overflow: "hidden", marginBottom: 20, animation: "slideSm .5s .1s both" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.28em", color: "var(--cs-cyan)", opacity: 0.75 }}>
            ◈ AI-POWERED DISASTER INTELLIGENCE PLATFORM
          </span>
        </div>

        {/* Giant title */}
        <div style={{ marginBottom: 24, lineHeight: 0.92 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(52px,13vw,96px)", letterSpacing: "0.04em" }}>
            <SplitText text="CRISIS" baseDelay={0} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(52px,13vw,96px)", letterSpacing: "0.04em" }}>
            <SplitText text="SENSE" baseDelay={0.28} />
            <SplitText text=" AI" baseDelay={0.48} color="var(--cs-cyan)" />
          </div>
        </div>

        {/* Rule */}
        <div style={{
          height: 1, background: "rgba(255,255,255,0.13)",
          transformOrigin: "left",
          animation: "drawX .7s .8s cubic-bezier(.16,1,.3,1) both",
          marginBottom: 22,
        }} />

        {/* Tagline */}
        <div style={{ animation: "slideSm .5s .9s both", marginBottom: 32 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(236,234,229,0.42)", letterSpacing: "0.22em" }}>
            PREDICT &nbsp;·&nbsp; PREPARE &nbsp;·&nbsp; PROTECT
          </span>
        </div>

        {/* CTA */}
        <div style={{ animation: "slideSm .5s 1s both", display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={onStart} className="hero-btn">
            START ANALYSIS →
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(236,234,229,0.13)", letterSpacing: "0.12em" }}>
            NO API KEY REQUIRED TO DEMO
          </span>
        </div>
      </main>

      {/* Stats strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        animation: "fadeIn .5s 1.2s both",
        position: "relative", zIndex: 2,
      }}>
        {[
          ["847", "SENSORS ACTIVE"],
          ["12.4K", "SIGNALS / HOUR"],
          ["99.2%", "UPTIME SLA"],
          ["<2s", "RESPONSE TIME"],
        ].map(([v, l], i) => (
          <div key={i} style={{ padding: "13px 20px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: "0.02em" }}>{v}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(236,234,229,0.14)", letterSpacing: "0.2em", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <div style={{
        padding: "8px 28px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(7,7,12,0.8)",
        position: "relative", zIndex: 2,
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(34,211,238,0.4)", letterSpacing: "0.2em" }}>
          {TICKERS[tick]}
        </span>
      </div>
    </div>
  );
}
