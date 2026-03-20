"use client";
import { useState } from "react";
import { CITIES } from "@/lib/cities";
import { calculateRisk, riskColor, getIndicators } from "@/lib/risk";
import CanvasBackground from "./CanvasBackground";
import RiskGauge from "./RiskGauge";
import TacticalMap from "./TacticalMap";
import SocialFeed from "./SocialFeed";
import AIPanel from "./AIPanel";

interface Props {
  onBack: () => void;
}

const LOADING_MSGS = [
  "FETCHING WEATHER DATA...",
  "SCANNING SOCIAL SIGNALS...",
  "COMPUTING RISK SCORE...",
  "LOADING MAP DATA...",
];

export default function Dashboard({ onBack }: Props) {
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadMsg, setLoadMsg] = useState(LOADING_MSGS[0]);

  const select = (name: string) => {
    setCity(name);
    setReady(false);
    setLoading(true);
    let mi = 0;
    const iv = setInterval(() => {
      mi++;
      if (mi < LOADING_MSGS.length) setLoadMsg(LOADING_MSGS[mi]);
    }, 360);
    setTimeout(() => {
      clearInterval(iv);
      setLoading(false);
      setReady(true);
    }, 1550);
  };

  const d = city ? CITIES[city] : null;
  const r = city ? calculateRisk(CITIES[city]) : null;
  const rc = r ? riskColor(r.level) : "#22d3ee";

  const wxRows = d ? [
    { label: "RAINFALL", value: d.weather.rainfall, unit: "mm", color: "#60a5fa" },
    { label: "WIND", value: d.weather.windSpeed, unit: "km/h", color: "#22d3ee" },
    { label: "HUMIDITY", value: d.weather.humidity, unit: "%", color: "#a5f3fc" },
    { label: "TEMP", value: d.weather.temp, unit: "°C", color: "#fbbf24" },
  ] : [];

  const scoreItems = r ? [
    { label: "WEATHER SEVERITY", value: r.weatherSeverity, weight: "0.50", color: "#60a5fa" },
    { label: "SOCIAL SIGNALS", value: r.socialSignals, weight: "0.30", color: "#f43f5e" },
    { label: "LOCATION VULN.", value: r.locationVulnerability, weight: "0.20", color: "#f59e0b" },
  ] : [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--cs-bg)", position: "relative" }}>
      <CanvasBackground />

      {/* Sticky nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 22px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(7,7,12,0.94)",
        backdropFilter: "blur(18px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={onBack}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em",
              padding: "5px 10px", border: "1px solid rgba(255,255,255,0.13)",
              color: "rgba(236,234,229,0.45)", background: "transparent", cursor: "pointer",
            }}
          >
            ← BACK
          </button>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: "0.1em" }}>
            CRISIS<span style={{ color: "var(--cs-cyan)" }}>SENSE</span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(236,234,229,0.14)", letterSpacing: "0.12em" }}>
            / ANALYSIS
          </span>
        </div>
        {r && (
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "5px 12px", border: `1px solid ${rc}`,
            color: rc, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: rc, display: "inline-block", animation: "pulseOp 2s infinite" }} />
            {r.level} RISK · {r.score}/100
          </div>
        )}
      </nav>

      {/* City selector */}
      <div style={{
        padding: "14px 22px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
        position: "relative", zIndex: 2,
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(236,234,229,0.14)", marginRight: 4 }}>
          REGION
        </span>
        {Object.keys(CITIES).map((name) => (
          <button
            key={name}
            onClick={() => select(name)}
            className={`city-pill${city === name ? " active" : ""}`}
          >
            {name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "18px 22px", position: "relative", zIndex: 2 }}>

        {/* Empty state */}
        {!city && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 14 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ opacity: 0.15, animation: "spinSlow 12s linear infinite" }}>
              <circle cx="24" cy="24" r="20" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="5 4" fill="none" />
              <circle cx="24" cy="24" r="12" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3 5" fill="none" />
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.22em", color: "rgba(236,234,229,0.14)" }}>
              SELECT A REGION ABOVE
            </span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 20 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ animation: "spinSlow 1s linear infinite" }}>
              <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
              <path d="M26 6 A20 20 0 0 1 46 26" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.18em", color: "#22d3ee" }}>
              {loadMsg}
            </span>
          </div>
        )}

        {/* Analysis */}
        {ready && d && r && (
          <div style={{ animation: "fadeIn .5s ease" }}>

            {/* Row 1: Gauge + Weather + Score */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 12, marginBottom: 12 }}>

              {/* Gauge card */}
              <div className="cs-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "22px 18px" }}>
                <span className="cs-lbl">RISK ASSESSMENT</span>
                <RiskGauge score={r.score} level={r.level} />
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 10, marginBottom: 6 }}>
                  {d.threats.map((t) => (
                    <span key={t} style={{
                      fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em",
                      padding: "3px 8px", border: `1px solid ${rc}44`, color: rc, background: `${rc}11`,
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.2em", color: "rgba(236,234,229,0.14)" }}>
                  {city?.toUpperCase()} · INDIA
                </div>
              </div>

              {/* Weather card */}
              <div className="cs-card">
                <span className="cs-lbl">WEATHER INTEL</span>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, letterSpacing: "0.06em", color: "var(--cs-amber)", marginBottom: 18, lineHeight: 1 }}>
                  {d.weather.condition}
                </div>
                {wxRows.map(({ label, value, unit, color }, i) => (
                  <div key={label} style={{ marginBottom: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.14em", color: "rgba(236,234,229,0.45)" }}>
                        {label}
                      </span>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 15, color, letterSpacing: "0.04em" }}>
                        {value}<span style={{ fontFamily: "var(--font-mono)", fontSize: 8, opacity: 0.6 }}>{unit}</span>
                      </span>
                    </div>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${Math.min(100, value)}%`,
                        background: color,
                        animation: `barGrow 0.9s ${i * 0.12}s cubic-bezier(.16,1,.3,1) both`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Score breakdown */}
              <div className="cs-card">
                <span className="cs-lbl">SCORE FORMULA</span>
                {scoreItems.map(({ label, value, weight, color }, i) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em", color: "rgba(236,234,229,0.14)" }}>
                        {label}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(236,234,229,0.45)" }}>
                        ×{weight}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)" }}>
                        <div style={{
                          height: "100%", width: `${value}%`, background: color,
                          animation: `barGrow 0.9s ${0.1 + i * 0.14}s cubic-bezier(.16,1,.3,1) both`,
                        }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 17, color, minWidth: 24, textAlign: "right" }}>
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em", color: "rgba(236,234,229,0.14)" }}>TOTAL</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 36, color: rc, letterSpacing: "0.02em", lineHeight: 1, animation: "numPop .5s .4s both" }}>
                      {r.score}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, letterSpacing: "0.16em", color: "rgba(236,234,229,0.14)", marginTop: 1 }}>
                      RISK SCORE
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(236,234,229,0.14)", marginTop: 8, letterSpacing: "0.06em" }}>
                  (W×0.5)+(S×0.3)+(L×0.2)
                </div>
              </div>
            </div>

            {/* Row 2: Map */}
            <div className="cs-card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="cs-lbl" style={{ marginBottom: 0 }}>TACTICAL ZONE MAP</span>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["var(--cs-rose)", "DANGER"], ["var(--cs-green)", "SHELTER"]].map(([c, l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, display: "inline-block" }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(236,234,229,0.14)", letterSpacing: "0.1em" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <TacticalMap cityName={city!} dangerZones={d.dangerZones} safeZones={d.safeZones} />
            </div>

            {/* Row 3: Feed + Indicators */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div className="cs-card">
                <SocialFeed tweets={d.tweets} />
              </div>
              <div className="cs-card">
                <span className="cs-lbl">THREAT INDICATORS</span>
                {getIndicators(r.score).map(({ label, status, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(236,234,229,0.45)", letterSpacing: "0.08em" }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.1em", color }}>{status}</span>
                    </div>
                  </div>
                ))}

                {/* Evacuation stats if available */}
                {d.evacuationStats && (
                  <>
                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <span className="cs-lbl" style={{ marginBottom: 10 }}>EVACUATION STATUS</span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          [d.evacuationStats.evacuated.toLocaleString(), "EVACUATED", "var(--cs-green)"],
                          [d.evacuationStats.pending.toLocaleString(), "PENDING", "var(--cs-amber)"],
                          [d.evacuationStats.sheltersOpen.toString(), "SHELTERS OPEN", "var(--cs-cyan)"],
                          [d.evacuationStats.ndrfTeams.toString(), "NDRF TEAMS", "var(--cs-rose)"],
                        ].map(([v, l, c]) => (
                          <div key={l} style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: c }}>{v}</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(236,234,229,0.45)", letterSpacing: "0.1em", marginTop: 1 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Row 4: AI Briefing */}
            <div className="cs-card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", left: 0, right: 0, height: 1,
                background: "linear-gradient(90deg,transparent,rgba(34,211,238,0.18),transparent)",
                animation: "scanV 5s linear infinite", top: -1, pointerEvents: "none",
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="cs-lbl" style={{ marginBottom: 0 }}>AI EMERGENCY BRIEFING</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(236,234,229,0.14)", letterSpacing: "0.1em" }}>
                  POWERED BY CLAUDE · {city?.toUpperCase()}
                </span>
              </div>
              <AIPanel key={city} cityName={city!} cityData={d} riskData={r} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
