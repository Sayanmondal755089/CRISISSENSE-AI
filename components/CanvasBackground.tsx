"use client";
import { useEffect, useRef } from "react";

export default function CanvasBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    type Dot = { x: number; y: number; phase: number; speed: number };
    const dots: Dot[] = [];
    const spacing = 42;
    for (let x = spacing / 2; x < canvas.width; x += spacing)
      for (let y = spacing / 2; y < canvas.height; y += spacing)
        dots.push({ x, y, phase: Math.random() * Math.PI * 2, speed: 0.008 + Math.random() * 0.006 });

    let t = 0;
    const draw = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach((d) => {
        const op = 0.028 + 0.022 * Math.sin(t * d.speed + d.phase);
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${op})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
  );
}
