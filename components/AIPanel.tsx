"use client";
import { useState, useCallback } from "react";
import { CityData } from "@/lib/cities";
import { RiskResult } from "@/lib/risk";

interface Props {
  cityName: string;
  cityData: CityData;
  riskData: RiskResult;
}

function buildPrompt(cityName: string, city: CityData, risk: RiskResult): string {
  return `You are CrisisSense AI — an emergency response intelligence system. Active threat alert.

LOCATION: ${cityName}, India
RISK SCORE: ${risk.score}/100 (${risk.level})
THREATS: ${city.threats.join(", ")}
CONDITIONS: ${city.weather.condition} | Rain: ${city.weather.rainfall}mm | Wind: ${city.weather.windSpeed}km/h | Humidity: ${city.weather.humidity}%

Generate a structured emergency briefing with these exact sections:

⚠ IMMEDIATE ACTIONS (3 bullet points — critical right now)
🏠 EVACUATION PROTOCOL (2-3 steps specific to ${cityName})
📦 EMERGENCY KIT (5 essential items)
📞 EMERGENCY CONTACTS (real Indian helpline numbers)
🔴 CRITICAL ALERT (single most urgent warning sentence)

Rules: Specific to ${cityName} geography. Each point max 15 words. Urgent, direct language. No filler.`;
}

function getMockResponse(cityName: string, risk: RiskResult): string {
  return `⚠ IMMEDIATE ACTIONS
• Evacuate all ground-floor and basement areas immediately — do not wait
• Shut main electrical breaker before leaving — prevents electrocution risk
• Alert neighbours and assist mobility-impaired residents to evacuate now

🏠 EVACUATION PROTOCOL
• Use primary arterial roads marked by local disaster authority for ${cityName}
• Register at government shelter with Aadhaar ID and 72-hour supplies
• Never cross flooded roads — even 6 inches of water can sweep a vehicle

📦 EMERGENCY KIT
• Drinking water: 3 litres per person minimum for 72 hours
• All prescription medications — full course plus one week extra
• Waterproof bag: Aadhaar, bank cards, emergency cash (small denominations)
• Torch, charged powerbank, hand-crank or battery-powered radio
• First aid kit with ORS sachets and antiseptic wound dressings

📞 EMERGENCY CONTACTS
• National Disaster Helpline: 1078 (free, 24/7)
• Police: 100  |  Fire: 101  |  Ambulance: 108
• NDRF Control Room: 011-24363260
• State Disaster Management: 1070
• Nearest Shelter SMS: 51969

🔴 CRITICAL ALERT
${risk.score > 70
    ? "Immediate evacuation required — do NOT shelter in low-lying buildings under any circumstances."
    : "Stay alert and prepared — conditions may deteriorate rapidly within hours."
  }`;
}

export default function AIPanel({ cityName, cityData, riskData }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  const streamText = useCallback((full: string) => {
    setLoading(false);
    let i = 0;
    const iv = setInterval(() => {
      i += 4;
      setText(full.slice(0, i));
      if (i >= full.length) {
        setText(full);
        clearInterval(iv);
        setDone(true);
        setTimestamp(new Date().toLocaleTimeString());
      }
    }, 16);
  }, []);

  const generate = useCallback(async () => {
    setTriggered(true);
    setLoading(true);
    setDone(false);
    setText("");

    try {
      const res = await fetch("/api/ai-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildPrompt(cityName, cityData, riskData),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      streamText(data.text || getMockResponse(cityName, riskData));
    } catch {
      streamText(getMockResponse(cityName, riskData));
    }
  }, [cityName, cityData, riskData, streamText]);

  if (!triggered) {
    return (
      <div style={{ textAlign: "center", padding: "28px 0" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          color: "rgba(236,234,229,0.14)", letterSpacing: "0.2em",
          marginBottom: 18, animation: "floatUp 3s ease infinite",
        }}>
          CLAUDE AI ENGINE STANDBY
        </div>
        <button
          onClick={generate}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em",
            padding: "13px 30px", border: "1px solid #eceae5", color: "#eceae5",
            background: "transparent", cursor: "pointer", position: "relative", overflow: "hidden",
          }}
          className="hero-btn"
        >
          ⚡ GENERATE BRIEFING
        </button>
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", display: "inline-block", animation: "pulseOp 0.7s ease infinite" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#22d3ee", letterSpacing: "0.14em" }}>
            ANALYZING THREAT DATA...
          </span>
        </div>
      )}

      {text && (
        <pre style={{
          fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.9,
          color: "rgba(34,211,238,0.82)", whiteSpace: "pre-wrap",
          background: "none", border: "none", margin: 0, padding: 0,
        }}>
          {text}
          {loading && <span style={{ animation: "blink 0.8s step-end infinite" }}>█</span>}
        </pre>
      )}

      {done && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 12, marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "rgba(236,234,229,0.14)", letterSpacing: "0.1em" }}>
            CLAUDE AI · {cityName.toUpperCase()} · {timestamp}
          </span>
          <button
            onClick={generate}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, padding: "5px 12px",
              border: "1px solid rgba(255,255,255,0.13)", color: "rgba(236,234,229,0.45)",
              background: "transparent", cursor: "pointer", letterSpacing: "0.1em",
            }}
          >
            ↺ REFRESH
          </button>
        </div>
      )}
    </div>
  );
}
