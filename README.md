# CrisisSense AI 🌊⚡

> **Predict. Prepare. Protect.**
> AI-powered disaster prediction and emergency response platform — built for the AI & Disaster Tech Hackathon.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-crisissense--ai.vercel.app-22d3ee?style=for-the-badge&logo=vercel&logoColor=white)](https://crisissense-ai.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Sayanmondal755089-181717?style=for-the-badge&logo=github)](https://github.com/Sayanmondal755089/CRISISSENSE-AI)
[![License](https://img.shields.io/badge/License-MIT-4ade80?style=for-the-badge)](LICENSE)

---

## What is CrisisSense AI?

CrisisSense AI is a real-time disaster intelligence platform that predicts flood, cyclone, and earthquake risk **before** they become a crisis. It combines three data streams into a single weighted risk score and generates AI-powered emergency briefings in under 2 seconds.

```
RISK SCORE = (Weather Severity × 0.50) + (Social Panic Signals × 0.30) + (Location Vulnerability × 0.20)

  0 – 30  →  LOW
 31 – 70  →  MEDIUM
 71 – 100 →  HIGH
```

---

## Live Demo

**[crisissense-ai.vercel.app](https://crisissense-ai.vercel.app/)**

Select any city on the dashboard to see:
- Real-time risk score with animated gauge
- Tactical flood zone map (danger zones + shelters)
- Live social media panic signal feed
- AI-generated emergency briefing (Claude API)

> No API key needed to demo — mock fallback is included for all AI responses.

---

## Screenshots

| Landing Page | Risk Dashboard | Chennai Flood Scenario |
|---|---|---|
| Dark hero with animated dot grid | Risk gauge, weather intel, score breakdown | 194mm rainfall, 8 flood zones, 24K evacuated |

---

## Features

### Risk Engine
- **Weather Severity** — rainfall (mm), wind speed (km/h), humidity (%) fed into a weighted formula
- **Social Signal NLP** — scans simulated tweets for panic keywords: `flood`, `evacuate`, `water rising`, `help`, `breach`, `cyclone`, `emergency`, `stuck`, `alert`, `rising`, `danger`, `rescue`
- **Location Vulnerability** — hardcoded index per city based on historical flood/disaster data

### Dashboard
- City selector: Chennai, Mumbai, Delhi, Kolkata, Bangalore
- Animated SVG risk gauge (0–100 score)
- Color-coded risk levels: 🟢 LOW / 🟡 MEDIUM / 🔴 HIGH
- Weather cards with animated bar indicators
- Score breakdown with per-component bars

### Tactical Map
- Custom SVG map rendered per city — no external map API required
- Danger zones: color-coded by severity (extreme / high / medium / low) with radial gradient fills
- Safe zones: shelter triangles with name labels and capacity data
- Pulsing animation on extreme-level zones

### Social Signal Feed
- 6–14 curated signals per city modelled on real crisis Twitter behaviour
- Verified accounts (NDRF, IMD, GCC) vs civilian panic signals
- Retweet counts, location tags, timestamp
- NLP keyword detection highlighted with "PANIC SIGNAL DETECTED" badge

### AI Emergency Briefing (Claude)
- One-click generation via Anthropic API (`claude-sonnet-4-20250514`)
- City-specific: evacuation routes, survival kit, emergency contacts (real Indian helplines)
- Sections: ⚠ Immediate Actions · 🏠 Evacuation Protocol · 📦 Emergency Kit · 📞 Contacts · 🔴 Critical Alert
- Streams response character-by-character for live terminal effect
- Full mock fallback if no API key is set

### Chennai Flood Scenario (Live Demo Data)
Based on the Northeast Monsoon Flood Event (Dec 2024):

| Metric | Value |
|---|---|
| 24-hour rainfall | 194 mm (335% above normal) |
| Adyar River level | 4.8 m (danger: 4.1 m) |
| Chembarambakkam reservoir | 97% capacity, discharging 15,000 cusecs |
| Road closures | 38 segments inundated |
| Residents evacuated | 24,830 |
| NDRF teams deployed | 38 |
| Shelters open | 147 (capacity: 45,000) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Next.js 14 App Router) |
| Styling | Tailwind CSS + custom CSS animations |
| Maps | Custom SVG — zero external map dependency |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| NLP | Keyword scoring engine (vanilla JS) |
| Fonts | Bebas Neue · JetBrains Mono · Inter |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (optional — mock fallback works without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/Sayanmondal755089/CRISISSENSE-AI.git
cd CRISISSENSE-AI

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local
# Add your Anthropic API key to .env.local:
# ANTHROPIC_API_KEY=sk-ant-...

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-your-key-here   # Optional — app works without it
```

> If `ANTHROPIC_API_KEY` is not set, the AI briefing panel uses a built-in mock response that demonstrates the full output format.

### Deployment

The project deploys in one click on Vercel:

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deployments on every push.

---

## Project Structure

```
CRISISSENSE-AI/
├── app/
│   ├── page.tsx              # Main app entry (Landing + Dashboard)
│   ├── layout.tsx            # Root layout with font imports
│   └── globals.css           # Global styles + keyframe animations
├── components/
│   ├── LandingPage.tsx       # Hero with split-text animation + stats
│   ├── Dashboard.tsx         # City selector + analysis layout
│   ├── RiskGauge.tsx         # SVG animated semicircle gauge
│   ├── TacticalMap.tsx       # Per-city SVG flood zone map
│   ├── SocialFeed.tsx        # Tweet list with panic detection
│   ├── AIPanel.tsx           # Claude API integration + mock fallback
│   └── CanvasBackground.tsx  # Animated dot-grid canvas
├── lib/
│   ├── cities.ts             # All city data (weather, zones, tweets)
│   └── risk.ts               # Risk score calculation engine
├── public/
└── README.md
```

---

## Risk Formula — Deep Dive

```typescript
function calculateRisk(city: CityData): RiskResult {
  // 1. Weather Severity (0–100)
  const weatherSeverity = Math.min(100,
    (rainfall * 0.50) + (windSpeed * 0.30) + (humidity * 0.20)
  );

  // 2. Social Panic Signals (0–100)
  const PANIC_KEYWORDS = [
    "flood", "help", "water rising", "evacuate", "danger",
    "rising", "breach", "cyclone", "emergency", "stuck", "alert", "rescue"
  ];
  const panicCount = tweets.reduce((acc, tweet) =>
    acc + PANIC_KEYWORDS.filter(k => tweet.text.toLowerCase().includes(k)).length, 0
  );
  const socialSignals = Math.min(100, panicCount * 8);

  // 3. Location Vulnerability (hardcoded per city, 0–100)
  // Chennai: 92 | Mumbai: 79 | Kolkata: 72 | Delhi: 55 | Bangalore: 38

  // 4. Final weighted score
  const score = Math.round(
    (weatherSeverity * 0.50) + (socialSignals * 0.30) + (locationVulnerability * 0.20)
  );

  return {
    score,
    level: score < 30 ? "LOW" : score < 70 ? "MEDIUM" : "HIGH",
    weatherSeverity,
    socialSignals,
    locationVulnerability,
  };
}
```

---

## City Data

| City | Vulnerability Index | Primary Threats | Demo Risk Score |
|---|---|---|---|
| Chennai | 92 | Flood, Cyclonic Surge, Reservoir Discharge | **82 — HIGH** |
| Mumbai | 79 | Flood, Landslide | **74 — HIGH** |
| Kolkata | 72 | Cyclone, Flood | **71 — HIGH** |
| Delhi | 55 | Heatwave, Flash Flood | **48 — MEDIUM** |
| Bangalore | 38 | Minor Flooding | **22 — LOW** |

---

## Roadmap

- [x] 5-city India coverage with full mock datasets
- [x] Claude AI emergency briefings
- [x] Real Chennai flood scenario (Dec 2024 data)
- [x] Custom SVG tactical maps
- [x] Social NLP panic signal detection
- [ ] IMD live API integration
- [ ] Mapbox interactive maps
- [ ] SMS alerts via 51969 shortcode
- [ ] Mobile PWA with offline support
- [ ] All 36 Indian states
- [ ] SDMA / NDMA government integration
- [ ] Satellite imagery overlay
- [ ] Predictive ML model (rainfall forecasting)

---

## Emergency Contacts (India)

These real numbers are embedded in every AI briefing:

| Service | Number |
|---|---|
| National Disaster Helpline | **1078** |
| Police | 100 |
| Fire | 101 |
| Ambulance | 108 |
| NDRF Control Room | 011-24363260 |
| State Disaster Management | 1070 |
| Shelter Locator SMS | 51969 |

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a pull request
```

---

## License

MIT © [Sayanmondal755089](https://github.com/Sayanmondal755089)

---

## Contact

**Sayan Mondal**
- Email: [sanynmandal@gmail.com](mailto:sanynmandal@gmail.com)
- GitHub: [@Sayanmondal755089](https://github.com/Sayanmondal755089)
- Live App: [crisissense-ai.vercel.app](https://crisissense-ai.vercel.app/)

---

<div align="center">
  <strong>Built for the AI & Disaster Tech Hackathon · Dec 2024</strong><br/>
  <em>Predict. Prepare. Protect.</em>
</div>
