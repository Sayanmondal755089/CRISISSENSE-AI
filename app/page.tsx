"use client";
import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");

  return view === "landing" ? (
    <LandingPage onStart={() => setView("dashboard")} />
  ) : (
    <Dashboard onBack={() => setView("landing")} />
  );
}
