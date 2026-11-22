"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { createRandom } from "./random";

// D:\claude-book\my-intro\index.html 의 배경(밤하늘·별·빛 점·불꽃놀이·광안대교)을 그대로 옮긴 장면

const rand = createRandom(20261122);
const hue = (x: number) => 190 + (x / 1600) * 130; // 하늘색 → 보라 → 분홍

/* ---------- 별 ---------- */
const STARS = Array.from({ length: 90 }, () => {
  const size = rand(1, 2.4);
  return {
    left: `${rand(0, 100)}%`,
    top: `${rand(0, 62)}%`,
    width: size,
    height: size,
    "--dur": `${rand(2, 5).toFixed(2)}s`,
    "--delay": `${rand(-5, 0).toFixed(2)}s`,
  } as CSSProperties;
});

/* ---------- 떠다니는 빛 점 ---------- */
const FLOATERS = Array.from({ length: 18 }, () => {
  const size = rand(3, 7);
  return {
    left: `${rand(0, 100)}%`,
    top: `${rand(25, 78)}%`,
    width: size,
    height: size,
    "--dx": `${rand(-40, 40).toFixed(0)}px`,
    "--dur": `${rand(10, 20).toFixed(1)}s`,
    "--delay": `${rand(-20, 0).toFixed(1)}s`,
  } as CSSProperties;
});

/* ---------- 스카이라인 ---------- */
type Rect = { x: number; y: number; width: number; height: number; fill: string; opacity?: number };
const SKYLINE: Rect[] = [];
for (let x = 0; x < 1600; ) {
  const w = rand(18, 46);
  const h = rand(15, 80) * (x > 450 && x < 1150 ? 0.6 : 1);
  SKYLINE.push({ x, y: 200 - h, width: w, height: h, fill: "#0A1630" });
  for (let k = 0; k < Math.floor(h / 12); k++) {
    if (rand(0, 1) < 0.55) {
      SKYLINE.push({
        x: x + rand(3, w - 5),
        y: 200 - h + rand(4, h - 4),
        width: 2,
        height: 2,
        fill: rand(0, 1) < 0.7 ? "#FDE68A" : "#BAE6FD",
        opacity: Number(rand(0.4, 0.9).toFixed(2)),
      });
    }
  }
  x += w + rand(1, 6);
}

/* ---------- 광안대교 케이블 · 조명 ---------- */
// 2차 베지어 (제어점 x가 양 끝 중간이므로 x는 t에 선형)
const SPANS = [
  { x0: 130, y0: 222, cy: 185, x1: 600, y1: 66 },
  { x0: 600, y0: 66, cy: 364, x1: 1000, y1: 66 },
  { x0: 1000, y0: 66, cy: 185, x1: 1470, y1: 222 },
];
const cableY = (s: (typeof SPANS)[number], x: number) => {
  const t = (x - s.x0) / (s.x1 - s.x0);
  return (1 - t) ** 2 * s.y0 + 2 * t * (1 - t) * s.cy + t * t * s.y1;
};

type Dot = { cx: number; cy: number; r: number; fill: string };
const HANGERS: { x: number; y: number }[] = [];
const CABLE_LIGHTS: Dot[] = [];
const DECK_LIGHTS: Dot[] = [];

SPANS.forEach((s) => {
  for (let x = s.x0 + 12; x < s.x1 - 6; x += 18) {
    const y = cableY(s, x);
    if (y < 222) HANGERS.push({ x, y });
    CABLE_LIGHTS.push({ cx: x, cy: y, r: 1.8, fill: `hsl(${hue(x)},90%,70%)` });
  }
});
for (let x = 6; x < 1600; x += 14) {
  DECK_LIGHTS.push({ cx: x, cy: 227, r: 1.4, fill: `hsl(${hue(x)},90%,72%)` });
  if (x % 28 === 6) DECK_LIGHTS.push({ cx: x, cy: 238, r: 1, fill: "#FDE68A" });
}
[602, 998].forEach((x) => {
  for (let y = 72; y < 235; y += 16) DECK_LIGHTS.push({ cx: x, cy: y, r: 1.6, fill: "#E0F2FE" });
});

/* ---------- 물 위 반사광 ---------- */
const REFLECTIONS: (Rect & { style: CSSProperties })[] = [];
for (let x = 10; x < 1600; x += rand(14, 30)) {
  REFLECTIONS.push({
    x,
    y: 244,
    width: rand(2, 5),
    height: rand(40, 130),
    fill: `hsl(${hue(x)},90%,70%)`,
    opacity: 0.3,
    style: {
      "--dur": `${rand(1.8, 4).toFixed(2)}s`,
      "--delay": `${rand(-4, 0).toFixed(2)}s`,
    } as CSSProperties,
  });
}

/* ---------- 불꽃놀이 ---------- */
function useFireworks(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const r = Math.random;
    const between = (min: number, max: number) => min + r() * (max - min);
    const COLORS = ["#38BDF8", "#F472B6", "#FBBF24", "#A78BFA", "#34D399", "#F8FAFC"];
    const GRAVITY = 0.06;
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    type Rocket = { x: number; y: number; vx: number; vy: number; color: string };
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; decay: number; color: string };
    let W = 0;
    let H = 0;
    let rockets: Rocket[] = [];
    let sparks: Spark[] = [];
    let rafId: number | null = null;
    let nextLaunch = 0;

    const isDark = () => root.classList.contains("dark");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMq.matches) renderStatic();
    }

    function launch() {
      const startY = H * 0.78;
      const targetY = H * between(0.1, 0.42);
      rockets.push({
        x: W * between(0.08, 0.92),
        y: startY,
        vx: between(-0.6, 0.6),
        vy: -Math.sqrt(2 * GRAVITY * (startY - targetY)),
        color: COLORS[(r() * COLORS.length) | 0],
      });
    }

    function explode(x: number, y: number, color: string, into: Spark[]) {
      const n = 60 + ((r() * 30) | 0);
      const scale = W < 500 ? 0.65 : 1;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + between(-0.05, 0.05);
        const sp = between(1.2, 3.6) * scale;
        into.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          decay: between(0.01, 0.02),
          color: r() < 0.15 ? "#FFFFFF" : color,
        });
      }
    }

    function stepSpark(p: Spark) {
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + 0.035;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
    }

    function drawDot(x: number, y: number, rad: number, color: string, alpha: number) {
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = color;
      ctx!.beginPath();
      ctx!.arc(x, y, rad, 0, Math.PI * 2);
      ctx!.fill();
    }

    function frame(t: number) {
      // 잔상: 기존 픽셀을 조금씩 지움 (투명 캔버스 유지)
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = "rgba(0,0,0,0.18)";
      ctx!.fillRect(0, 0, W, H);
      ctx!.globalCompositeOperation = "lighter";

      if (t > nextLaunch) {
        launch();
        if (r() < 0.25) launch();
        nextLaunch = t + between(600, 1600);
      }

      rockets = rockets.filter((rk) => {
        rk.x += rk.vx;
        rk.y += rk.vy;
        rk.vy += GRAVITY;
        drawDot(rk.x, rk.y, 1.8, "#FDE68A", 0.9);
        if (rk.vy >= -0.3) {
          explode(rk.x, rk.y, rk.color, sparks);
          return false;
        }
        return true;
      });

      sparks = sparks.filter((p) => {
        stepSpark(p);
        if (p.life <= 0) return false;
        drawDot(p.x, p.y, 1.6, p.color, p.life);
        return true;
      });

      ctx!.globalAlpha = 1;
      rafId = requestAnimationFrame(frame);
    }

    // 모션 최소화 시: 애니메이션 없이 불꽃 몇 개를 정지 상태로 그림
    function renderStatic() {
      ctx!.globalCompositeOperation = "source-over";
      ctx!.clearRect(0, 0, W, H);
      ctx!.globalCompositeOperation = "lighter";
      const bursts: [number, number, string][] = [
        [0.2, 0.22, COLORS[0]],
        [0.78, 0.18, COLORS[1]],
        [0.55, 0.34, COLORS[2]],
      ];
      bursts.forEach(([fx, fy, color]) => {
        const ps: Spark[] = [];
        explode(W * fx, H * fy, color, ps);
        for (let step = 0; step < 32; step++) {
          ps.forEach((p) => {
            stepSpark(p);
            if (step % 4 === 0 && p.life > 0) drawDot(p.x, p.y, 1.2, p.color, p.life * 0.5);
          });
        }
        ps.forEach((p) => p.life > 0 && drawDot(p.x, p.y, 1.6, p.color, Math.max(p.life, 0.3)));
      });
      ctx!.globalAlpha = 1;
    }

    function start() {
      // 밝은 모드이거나 탭이 숨겨져 있으면 돌리지 않는다
      if (rafId || reducedMq.matches || document.hidden || !isDark()) return;
      ctx!.globalCompositeOperation = "source-over";
      ctx!.clearRect(0, 0, W, H);
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      rockets = [];
      sparks = [];
    }

    function apply() {
      if (reducedMq.matches) {
        stop();
        renderStatic();
      } else if (isDark() && !document.hidden) {
        start();
      } else {
        stop();
      }
    }

    const themeObserver = new MutationObserver(apply);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", apply);
    reducedMq.addEventListener("change", apply);

    resize();
    apply();

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", apply);
      reducedMq.removeEventListener("change", apply);
    };
  }, [canvasRef]);
}

export default function NightScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFireworks(canvasRef);

  return (
    <div className="scene-bg night-bg" aria-hidden="true">
      <div className="scene-layer">
        {STARS.map((style, i) => (
          <span key={i} className="night-star" style={style} />
        ))}
      </div>
      <div className="scene-layer">
        {FLOATERS.map((style, i) => (
          <span key={i} className="night-floater" style={style} />
        ))}
      </div>
      <canvas ref={canvasRef} className="scene-layer h-full w-full" />

      <svg className="night-scene" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="night-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16325A" />
            <stop offset="35%" stopColor="#0B1E3F" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="night-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="night-blur" x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* 원경 도시 스카이라인 */}
        <g>
          {SKYLINE.map((r, i) => (
            <rect key={i} {...r} />
          ))}
        </g>

        {/* 바다 */}
        <rect x="0" y="200" width="1600" height="200" fill="url(#night-sea)" />
        <rect x="0" y="199" width="1600" height="2" fill="#38BDF8" opacity="0.15" />

        {/* 다리 조명의 물 위 반사광 */}
        <g filter="url(#night-blur)">
          {REFLECTIONS.map(({ style, ...r }, i) => (
            <rect key={i} className="night-reflection" style={style} {...r} />
          ))}
        </g>

        {/* 광안대교 */}
        <g fill="#0F1E38" stroke="#0F1E38">
          {/* 교각 */}
          <rect x="596" y="238" width="12" height="40" stroke="none" />
          <rect x="992" y="238" width="12" height="40" stroke="none" />
          <rect x="300" y="238" width="8" height="30" stroke="none" />
          <rect x="1292" y="238" width="8" height="30" stroke="none" />

          {/* 주탑 (2개의 기둥 + 가로보) */}
          <g stroke="none">
            <rect x="590" y="62" width="7" height="178" />
            <rect x="607" y="62" width="7" height="178" />
            <rect x="590" y="62" width="24" height="5" />
            <rect x="590" y="130" width="24" height="4" />
            <rect x="590" y="190" width="24" height="4" />

            <rect x="986" y="62" width="7" height="178" />
            <rect x="1003" y="62" width="7" height="178" />
            <rect x="986" y="62" width="24" height="5" />
            <rect x="986" y="130" width="24" height="4" />
            <rect x="986" y="190" width="24" height="4" />
          </g>

          {/* 수직 행어 케이블 */}
          <g stroke="#1E3A5F" strokeWidth="1" fill="none">
            {HANGERS.map(({ x, y }, i) => (
              <line key={i} x1={x} y1={y} x2={x} y2={224} />
            ))}
          </g>

          {/* 주 케이블 */}
          <g fill="none" stroke="#1E3A5F" strokeWidth="2.5">
            <path d="M130 222 Q365 185 600 66" />
            <path d="M600 66 Q800 364 1000 66" />
            <path d="M1000 66 Q1235 185 1470 222" />
          </g>

          {/* 상판 (복층) */}
          <rect x="0" y="224" width="1600" height="6" stroke="none" />
          <rect x="0" y="236" width="1600" height="4" stroke="none" />
        </g>

        {/* 다리 조명 */}
        <g className="night-bridge-lights" filter="url(#night-glow)">
          {CABLE_LIGHTS.map((d, i) => (
            <circle key={`c${i}`} {...d} />
          ))}
          {DECK_LIGHTS.map((d, i) => (
            <circle key={`d${i}`} {...d} />
          ))}
        </g>
      </svg>
    </div>
  );
}
