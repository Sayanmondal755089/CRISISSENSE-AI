import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrisisSense AI — Predict. Prepare. Protect.",
  description:
    "AI-powered disaster prediction and emergency response platform. Real-time risk scoring using weather data, social signals, and geospatial intelligence.",
  keywords: ["disaster prediction", "flood warning", "AI emergency", "cyclone alert", "India disaster management"],
  authors: [{ name: "Sayan Mondal", url: "https://github.com/Sayanmondal755089" }],
  openGraph: {
    title: "CrisisSense AI",
    description: "Predict. Prepare. Protect. — AI-powered disaster intelligence platform.",
    url: "https://crisissense-ai.vercel.app",
    siteName: "CrisisSense AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrisisSense AI",
    description: "AI-powered disaster prediction and emergency response platform.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
