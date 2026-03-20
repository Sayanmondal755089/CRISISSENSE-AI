import type { CityData } from "./cities";

export interface RiskResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  weatherSeverity: number;
  socialSignals: number;
  locationVulnerability: number;
}

export const PANIC_KEYWORDS = [
  "flood", "help", "water rising", "evacuate", "danger",
  "rising", "breach", "cyclone", "emergency", "stuck",
  "alert", "rescue", "inundated", "stranded", "overflow",
];

export function riskColor(level: "LOW" | "MEDIUM" | "HIGH"): string {
  if (level === "LOW") return "#4ade80";
  if (level === "MEDIUM") return "#f59e0b";
  return "#f43f5e";
}

export function riskBg(level: "LOW" | "MEDIUM" | "HIGH"): string {
  if (level === "LOW") return "rgba(74,222,128,0.08)";
  if (level === "MEDIUM") return "rgba(245,158,11,0.08)";
  return "rgba(244,63,94,0.08)";
}

export function calculateRisk(city: CityData): RiskResult {
  const { weather, vulnerability, tweets } = city;

  // Weather severity (0–100)
  const weatherSeverity = Math.min(
    100,
    weather.rainfall * 0.5 + weather.windSpeed * 0.3 + weather.humidity * 0.2
  );

  // Social panic signal score (0–100)
  const panicCount = tweets.reduce((acc, tweet) => {
    const lower = tweet.text.toLowerCase();
    return acc + PANIC_KEYWORDS.filter((k) => lower.includes(k)).length;
  }, 0);
  const socialSignals = Math.min(100, panicCount * 8);

  // Final weighted score
  const score = Math.round(
    weatherSeverity * 0.5 + socialSignals * 0.3 + vulnerability * 0.2
  );

  const level: "LOW" | "MEDIUM" | "HIGH" =
    score < 30 ? "LOW" : score < 70 ? "MEDIUM" : "HIGH";

  return {
    score,
    level,
    weatherSeverity: Math.round(weatherSeverity),
    socialSignals: Math.round(socialSignals),
    locationVulnerability: vulnerability,
  };
}

export function getIndicators(score: number) {
  return [
    { label: "FLOOD RISK", status: score > 60 ? "ELEVATED" : "MODERATE", color: score > 60 ? "#f43f5e" : "#f59e0b" },
    { label: "EVACUATION", status: score > 70 ? "RECOMMENDED" : "ADVISORY", color: score > 70 ? "#f43f5e" : "#f59e0b" },
    { label: "INFRASTRUCTURE", status: score > 50 ? "AT RISK" : "STABLE", color: score > 50 ? "#f59e0b" : "#4ade80" },
    { label: "SHELTER CAPACITY", status: "AVAILABLE", color: "#4ade80" },
    { label: "EMERGENCY SERVICES", status: score > 80 ? "OVERWHELMED" : "ACTIVE", color: score > 80 ? "#f43f5e" : "#4ade80" },
  ];
}
