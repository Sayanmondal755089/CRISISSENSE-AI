export interface DangerZone {
  name: string;
  lat: number;
  lon: number;
  radius: number;
  level: "extreme" | "high" | "medium" | "low";
  depthM?: number;
  affectedPop?: number;
  note?: string;
}

export interface SafeZone {
  name: string;
  lat: number;
  lon: number;
  capacity?: number;
  occupied?: number;
}

export interface Tweet {
  user: string;
  text: string;
  panic: boolean;
  verified?: boolean;
  retweets?: number;
  time: string;
  location?: string;
}

export interface WeatherData {
  rainfall: number;
  windSpeed: number;
  humidity: number;
  temp: number;
  condition: string;
  pressureHpa?: number;
  visibilityKm?: number;
  chembarambakkamPct?: number;
  adyarLevelM?: number;
  cooumLevelM?: number;
}

export interface CityData {
  vulnerability: number;
  incidentLabel?: string;
  issuedAt?: string;
  weather: WeatherData;
  threats: string[];
  dangerZones: DangerZone[];
  safeZones: SafeZone[];
  tweets: Tweet[];
  evacuationStats?: {
    evacuated: number;
    pending: number;
    sheltersOpen: number;
    ndrfTeams: number;
    sdrfTeams?: number;
    fireboatsDeployed?: number;
  };
  infrastructureStatus?: { name: string; status: string; level: "danger" | "warning" | "safe" }[];
}

export const CITIES: Record<string, CityData> = {
  Chennai: {
    vulnerability: 92,
    incidentLabel: "NORTHEAST MONSOON FLOOD EVENT — IMD RED ALERT",
    issuedAt: "03:47 IST · 04 DEC 2024",
    weather: {
      rainfall: 194,
      windSpeed: 74,
      humidity: 97,
      temp: 28,
      condition: "EXTREMELY HEAVY RAIN — RED ALERT",
      pressureHpa: 994,
      visibilityKm: 1.2,
      chembarambakkamPct: 97,
      adyarLevelM: 4.8,
      cooumLevelM: 3.2,
    },
    threats: ["FLOOD", "CYCLONIC SURGE", "RESERVOIR DISCHARGE"],
    evacuationStats: {
      evacuated: 24830,
      pending: 6240,
      sheltersOpen: 147,
      ndrfTeams: 38,
      sdrfTeams: 22,
      fireboatsDeployed: 54,
    },
    infrastructureStatus: [
      { name: "Chennai Airport", status: "Ops suspended — runways safe", level: "warning" },
      { name: "Chennai Central Station", status: "Services delayed, no cancellations", level: "warning" },
      { name: "Adyar Bridge", status: "CLOSED — water overtopping", level: "danger" },
      { name: "Saidapet Underpass", status: "CLOSED — fully submerged", level: "danger" },
      { name: "OMR Perungudi–Sholinganallur", status: "Open — use caution", level: "safe" },
      { name: "Power (Velachery-Adyar)", status: "OUTAGE — generator backup", level: "danger" },
      { name: "Chembarambakkam Dam", status: "Discharging 15,000 cusecs", level: "warning" },
      { name: "Mobile Networks", status: "Congested — intermittent signal", level: "warning" },
    ],
    dangerZones: [
      {
        name: "Adyar Delta / Thiruvanmiyur",
        lat: 12.985, lon: 80.255, radius: 52, level: "extreme",
        depthM: 1.8, affectedPop: 45000,
        note: "River 0.7m above danger — overtopping embankments",
      },
      {
        name: "Velachery Basin",
        lat: 12.978, lon: 80.221, radius: 46, level: "extreme",
        depthM: 1.4, affectedPop: 62000,
        note: "1.4m above road level — worst-hit zone",
      },
      {
        name: "Kotturpuram",
        lat: 13.015, lon: 80.249, radius: 34, level: "high",
        depthM: 0.9, affectedPop: 18000,
        note: "Adyar backflow — 40+ families stranded",
      },
      {
        name: "Saidapet",
        lat: 13.020, lon: 80.221, radius: 30, level: "high",
        depthM: 0.7, affectedPop: 21000,
        note: "Underpass submerged, 2 cars rescued",
      },
      {
        name: "Marina–Royapuram Coastal",
        lat: 13.087, lon: 80.292, radius: 28, level: "high",
        depthM: 0.6, affectedPop: 14000,
        note: "Sea surge + storm drain overflow",
      },
      {
        name: "Nungambakkam",
        lat: 13.057, lon: 80.242, radius: 24, level: "medium",
        depthM: 0.3, affectedPop: 9000,
        note: "Cooum overflow into low streets",
      },
      {
        name: "Perambur",
        lat: 13.116, lon: 80.242, radius: 22, level: "medium",
        depthM: 0.3, affectedPop: 7500,
        note: "Storm drain capacity exceeded",
      },
      {
        name: "Egmore–Central",
        lat: 13.079, lon: 80.262, radius: 16, level: "low",
        depthM: 0.1, affectedPop: 3200,
        note: "Pedestrian-level waterlogging",
      },
    ],
    safeZones: [
      { name: "Kalaivanar Arangam (Anna Nagar)", lat: 13.090, lon: 80.210, capacity: 12000, occupied: 8400 },
      { name: "Guindy Industrial Campus", lat: 13.010, lon: 80.218, capacity: 8000, occupied: 5200 },
      { name: "Ambattur OT Ground", lat: 13.114, lon: 80.158, capacity: 10000, occupied: 6300 },
      { name: "IIT Madras (Elevated Campus)", lat: 12.992, lon: 80.233, capacity: 4000, occupied: 1800 },
      { name: "Jawaharlal Nehru Stadium", lat: 13.072, lon: 80.250, capacity: 15000, occupied: 9100 },
    ],
    tweets: [
      { user: "Ravi_Narayanan_chn", text: "Water in Velachery is NOW at knee level and rising fast. Evacuate IMMEDIATELY if you're in B-block apartments. Roads completely submerged #ChennaiFloods", panic: true, verified: false, retweets: 847, time: "4m", location: "Velachery" },
      { user: "NDRF_Official", text: "NDRF teams deployed at Adyar Bridge, Velachery, Kotturpuram. Rescue boats operational. Call 1078 for assistance. Do NOT wade through floodwater.", panic: false, verified: true, retweets: 3200, time: "6m", location: "Chennai HQ" },
      { user: "GreaterChennaiCorp", text: "ADVISORY: 38 road segments inundated as of 03:30 IST. Saidapet underpass CLOSED. Alternate route: OMR via Perungudi. Avoid Adyar bridge approach.", panic: false, verified: true, retweets: 5600, time: "8m", location: "GCC" },
      { user: "priya_vlgs", text: "Ground floor of our apartment in Kotturpuram completely flooded. 40+ families stranded on upper floors. Please send boats to Gandhi Street. #ChennaiRains", panic: true, verified: false, retweets: 1240, time: "9m", location: "Kotturpuram" },
      { user: "IMD_Chennai", text: "RED ALERT continues for Chennai. Extremely heavy rainfall forecast next 6 hours. Chembarambakkam reservoir discharge ongoing at 15,000 cusecs.", panic: false, verified: true, retweets: 8900, time: "11m", location: "IMD" },
      { user: "senthil_kumar_vlchry", text: "HELP! My elderly parents are stuck at 14, 3rd Cross Street Velachery. Water is 4 feet high. No power since midnight. Please RT! #ChennaiFloods", panic: true, verified: false, retweets: 4320, time: "13m", location: "Velachery" },
      { user: "chennaimetrorail", text: "Metro services suspended between Guindy–Chennai Airport due to flooding at Kathipara junction. All trains completed safely. Service resumes post-water recession.", panic: false, verified: true, retweets: 2100, time: "15m", location: "Metro" },
      { user: "arun_sundaram_ch", text: "Saidapet underpass completely submerged. Saw 2 cars stalled — occupants rescued by fire brigade. NEVER drive through underpasses in heavy rain. #ChennaiRains", panic: true, verified: false, retweets: 3870, time: "22m", location: "Saidapet" },
      { user: "tn_disaster_mgmt", text: "30,000 meals dispatched to relief camps. 147 government shelters operational for 45,000 people. SMS 51969 for nearest shelter location.", panic: false, verified: true, retweets: 4100, time: "20m", location: "TNSDMA" },
    ],
  },

  Mumbai: {
    vulnerability: 79,
    weather: { rainfall: 72, windSpeed: 48, humidity: 88, temp: 29, condition: "ORANGE ALERT ACTIVE" },
    threats: ["FLOOD", "LANDSLIDE"],
    dangerZones: [
      { name: "Mithi River Zone", lat: 19.07, lon: 72.87, radius: 36, level: "high" },
      { name: "Dharavi Low-Lying", lat: 19.04, lon: 72.85, radius: 26, level: "high" },
      { name: "Kurla Waterlogging", lat: 19.07, lon: 72.88, radius: 20, level: "medium" },
    ],
    safeZones: [
      { name: "BKC Evacuation Pt", lat: 19.07, lon: 72.87, capacity: 8000 },
      { name: "Andheri Sports Complex", lat: 19.12, lon: 72.84, capacity: 6000 },
      { name: "Bandra Relief Camp", lat: 19.05, lon: 72.83, capacity: 5000 },
    ],
    tweets: [
      { user: "mum_floods", text: "Mithi river overflowing! Kurla residents being evacuated now. #MumbaiRains", panic: true, verified: false, retweets: 2100, time: "3m", location: "Kurla" },
      { user: "bmc_mum", text: "Orange alert: avoid G/N ward low-lying areas. Pumping active.", panic: false, verified: true, retweets: 4500, time: "7m", location: "BMC" },
      { user: "reporter_local", text: "Waterlogging at CST, trains delayed. Avoid Sion-Dharavi road!", panic: true, verified: false, retweets: 980, time: "11m", location: "CST" },
      { user: "vijay_m", text: "Stuck in flooding near Powai! Send help – water in cars.", panic: true, verified: false, retweets: 1340, time: "14m", location: "Powai" },
      { user: "ndrf_official", text: "3 NDRF teams deployed in Mumbai. Helpline: 1078", panic: false, verified: true, retweets: 3200, time: "19m", location: "NDRF" },
    ],
  },

  Delhi: {
    vulnerability: 55,
    weather: { rainfall: 22, windSpeed: 18, humidity: 58, temp: 38, condition: "HEATWAVE ADVISORY" },
    threats: ["HEATWAVE", "FLASH FLOOD"],
    dangerZones: [
      { name: "Yamuna Floodplain", lat: 28.65, lon: 77.25, radius: 30, level: "medium" },
      { name: "Old Delhi Low Zone", lat: 28.66, lon: 77.23, radius: 18, level: "medium" },
    ],
    safeZones: [
      { name: "Civil Lines Shelter", lat: 28.68, lon: 77.22, capacity: 5000 },
      { name: "Connaught Hub", lat: 28.63, lon: 77.22, capacity: 4000 },
    ],
    tweets: [
      { user: "delhi_wx", text: "Temperature: 44°C. Severe heat stroke risk. Avoid outdoors.", panic: true, verified: false, retweets: 3100, time: "5m", location: "Delhi" },
      { user: "yamuna_watch", text: "Yamuna levels rising. Floodplain residents warned.", panic: true, verified: false, retweets: 880, time: "9m", location: "Yamuna" },
      { user: "ndmc_delhi", text: "Water shortage E.Delhi. Tankers deployed in affected wards.", panic: false, verified: true, retweets: 1200, time: "16m", location: "NDMC" },
      { user: "rk_news", text: "Evening drizzle may trigger flash floods in low areas.", panic: false, verified: false, retweets: 340, time: "21m", location: "Delhi" },
    ],
  },

  Kolkata: {
    vulnerability: 72,
    weather: { rainfall: 65, windSpeed: 55, humidity: 86, temp: 31, condition: "CYCLONE WARNING ZONE" },
    threats: ["CYCLONE", "FLOOD"],
    dangerZones: [
      { name: "Sundarbans Belt", lat: 22.40, lon: 88.60, radius: 42, level: "extreme" },
      { name: "S.Kolkata Low Zone", lat: 22.53, lon: 88.35, radius: 28, level: "high" },
      { name: "Hooghly Riverside", lat: 22.58, lon: 88.34, radius: 22, level: "medium" },
    ],
    safeZones: [
      { name: "Salt Lake Stadium", lat: 22.58, lon: 88.40, capacity: 10000 },
      { name: "New Town Relief Hub", lat: 22.59, lon: 88.47, capacity: 8000 },
    ],
    tweets: [
      { user: "kol_live", text: "Cyclone JAWAD: Sundarbans RED ALERT. Evacuate coastal areas NOW.", panic: true, verified: false, retweets: 5400, time: "1m", location: "Sundarbans" },
      { user: "wb_disaster", text: "340 cyclone shelters open. 2 lakh people already evacuated.", panic: false, verified: true, retweets: 6200, time: "6m", location: "WBDMA" },
      { user: "tapas_local", text: "Wind speed rising fast in Diamond Harbour. Trees falling!", panic: true, verified: false, retweets: 1100, time: "10m", location: "Diamond Harbour" },
      { user: "river_alert", text: "Hooghly breaches embankment at 2 points. Water rising fast!", panic: true, verified: false, retweets: 2800, time: "13m", location: "Hooghly" },
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
      { name: "Cubbon Park Rally", lat: 12.98, lon: 77.59, capacity: 6000 },
      { name: "Banashankari Center", lat: 12.92, lon: 77.57, capacity: 4000 },
    ],
    tweets: [
      { user: "blr_rains", text: "Light showers across city. Outer Ring Rd has minor puddles.", panic: false, verified: false, retweets: 210, time: "8m", location: "Bangalore" },
      { user: "bbmp_official", text: "Drains cleared. Minor waterlogging possible in low areas only.", panic: false, verified: true, retweets: 890, time: "15m", location: "BBMP" },
      { user: "tech_blr", text: "IT corridor roads clear. Normal commute today.", panic: false, verified: false, retweets: 120, time: "23m", location: "ORR" },
    ],
  },
};
