import type { CSSProperties } from "react";
import { createRandom } from "./random";

// 밝은 모드 배경: 눈 덮인 산속 오두막, 창 너머 모닥불, 화면 전체에 내리는 눈
// viewBox 1600x600을 화면 아래쪽에 xMidYMax slice로 깔기 때문에,
// 세로로 긴 휴대폰 화면에서는 가운데(대략 x 570~1030)만 보인다 → 오두막은 가운데에 둔다.

const rand = createRandom(1225);

type Pt = [number, number];

const toPath = (pts: Pt[], bottom = 600) =>
  `M0 ${bottom} ` + pts.map(([x, y]) => `L${x} ${y}`).join(" ") + ` L1600 ${bottom} Z`;

// 봉우리마다 눈 모자(아래쪽이 들쭉날쭉한 흰 다각형)를 만든다
function snowCaps(pts: Pt[], depth: number) {
  const caps: string[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i + 1];
    if (py >= ay || py >= by) continue;
    const d = Math.min(depth, (ay - py) * 0.6, (by - py) * 0.6);
    const lx = px + (ax - px) * (d / (ay - py));
    const rx = px + (bx - px) * (d / (by - py));
    const teeth = 5;
    let path = `M${px} ${py} L${lx.toFixed(1)} ${(py + d).toFixed(1)}`;
    for (let k = 1; k < teeth; k++) {
      const x = lx + ((rx - lx) * k) / teeth;
      const y = py + d * (k % 2 ? 0.55 : 1.05);
      path += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    path += ` L${rx.toFixed(1)} ${(py + d).toFixed(1)} Z`;
    caps.push(path);
  }
  return caps;
}

const FAR: Pt[] = [
  [0, 250], [120, 180], [210, 225], [330, 110], [450, 205], [560, 150], [690, 225],
  [820, 95], [960, 215], [1080, 135], [1200, 205], [1330, 105], [1460, 195], [1600, 150],
];
const MID: Pt[] = [
  [0, 330], [140, 255], [260, 305], [400, 215], [520, 295], [640, 245], [760, 320],
  [900, 225], [1040, 305], [1150, 240], [1290, 315], [1420, 245], [1600, 300],
];

/* ---------- 전나무 ---------- */
type Tree = { x: number; y: number; h: number; fill: string };

function treePaths({ x, y, h }: Tree) {
  // 3단 삼각형 + 각 단 위에 쌓인 눈
  const tiers = [
    { top: y - h, base: y - h * 0.55, w: h * 0.32 },
    { top: y - h * 0.75, base: y - h * 0.3, w: h * 0.42 },
    { top: y - h * 0.5, base: y - h * 0.08, w: h * 0.52 },
  ];
  const body = tiers.map(({ top, base, w }) => `M${x} ${top} L${x - w / 2} ${base} L${x + w / 2} ${base} Z`).join(" ");
  const snow = tiers
    .map(({ top, base, w }) => {
      const sh = (base - top) * 0.45;
      const sw = (w / 2) * 0.45;
      return `M${x} ${top} L${x - sw} ${top + sh} Q${x - sw / 2} ${top + sh * 0.75} ${x} ${top + sh * 0.95} Q${x + sw / 2} ${top + sh * 0.75} ${x + sw} ${top + sh} Z`;
    })
    .join(" ");
  const trunk = { x: x - h * 0.04, y: y - h * 0.1, width: h * 0.08, height: h * 0.12 };
  return { body, snow, trunk };
}

const BACK_TREES: Tree[] = [];
for (let x = 10; x < 1600; x += rand(22, 40)) {
  BACK_TREES.push({ x, y: 420 + rand(-12, 12), h: rand(38, 62), fill: "#5b7186" });
}
const FRONT_TREES: Tree[] = [];
for (let x = 0; x < 1600; x += rand(40, 75)) {
  if (x > 640 && x < 980) continue; // 오두막 주변은 비워 둔다
  FRONT_TREES.push({ x, y: 500 + rand(-10, 18), h: rand(85, 140), fill: "#3d5568" });
}
// 오두막 양옆 가까운 나무
FRONT_TREES.push({ x: 650, y: 505, h: 120, fill: "#3d5568" }, { x: 975, y: 508, h: 135, fill: "#3d5568" });

/* ---------- 눈송이 ---------- */
const FLAKES = Array.from({ length: 90 }, () => {
  const size = rand(2, 6);
  return {
    left: `${rand(0, 100)}%`,
    width: size,
    height: size,
    opacity: Number(rand(0.55, 1).toFixed(2)),
    "--dx": `${rand(-60, 60).toFixed(0)}px`,
    "--dur": `${rand(8, 18).toFixed(1)}s`,
    "--delay": `${rand(-18, 0).toFixed(1)}s`,
  } as CSSProperties;
});

/* ---------- 굴뚝 연기 ---------- */
const SMOKE = [0, 1, 2, 3].map((i) => ({ "--delay": `${-i * 1.5}s` }) as CSSProperties);

function TreeGroup({ trees }: { trees: Tree[] }) {
  return (
    <g>
      {trees.map((t, i) => {
        const { body, snow, trunk } = treePaths(t);
        return (
          <g key={i}>
            <rect {...trunk} fill="#4a3728" />
            <path d={body} fill={t.fill} />
            <path d={snow} fill="#f8fafc" />
          </g>
        );
      })}
    </g>
  );
}

export default function SnowScene() {
  return (
    <div className="scene-bg snow-bg" aria-hidden="true">
      <svg className="snow-scene" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="snow-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dbe4ee" />
          </linearGradient>
          <radialGradient id="snow-window" cx="50%" cy="80%" r="75%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>
          <radialGradient id="snow-spill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="snow-haze" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="snow-window-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 먼 산맥 */}
        <g filter="url(#snow-haze)">
          <path d={toPath(FAR)} fill="#b4c3d4" />
          {snowCaps(FAR, 55).map((d, i) => (
            <path key={i} d={d} fill="#f1f5f9" />
          ))}
        </g>

        {/* 가까운 산맥 */}
        <path d={toPath(MID)} fill="#8ea3b9" />
        {snowCaps(MID, 45).map((d, i) => (
          <path key={i} d={d} fill="#f8fafc" />
        ))}

        {/* 산 아래 눈 덮인 언덕 + 뒷줄 전나무 */}
        <path d="M0 410 C 250 380, 450 430, 800 415 S 1350 385, 1600 405 L1600 600 L0 600 Z" fill="#e8eef5" />
        <TreeGroup trees={BACK_TREES} />

        {/* 눈밭 */}
        <path
          d="M0 480 C 300 445, 500 500, 800 505 S 1300 455, 1600 470 L1600 600 L0 600 Z"
          fill="url(#snow-ground)"
        />

        {/* 창에서 눈밭으로 번지는 불빛 */}
        <ellipse className="snow-flicker" cx="764" cy="522" rx="95" ry="16" fill="url(#snow-spill)" />

        {/* ---------- 오두막 ---------- */}
        <g>
          {/* 굴뚝 + 연기 */}
          <rect x="845" y="378" width="20" height="48" fill="#78716c" />
          <rect x="841" y="372" width="28" height="9" rx="4" fill="#f8fafc" />
          {SMOKE.map((style, i) => (
            <circle key={i} className="snow-smoke" style={style} cx="855" cy="366" r="9" fill="#e2e8f0" />
          ))}

          {/* 통나무 벽 */}
          <rect x="720" y="432" width="160" height="80" fill="#7a4e2d" />
          {[442, 452, 462, 472, 482, 492, 502].map((y) => (
            <line key={y} x1="720" y1={y} x2="880" y2={y} stroke="#5a3820" strokeWidth="2" />
          ))}
          {[437, 447, 457, 467, 477, 487, 497, 507].map((y) => (
            <g key={y} fill="#a16b3f">
              <circle cx="718" cy={y} r="4.5" />
              <circle cx="882" cy={y} r="4.5" />
            </g>
          ))}

          {/* 지붕 + 쌓인 눈 */}
          <path d="M700 440 L800 378 L900 440 Z" fill="#4a2e1b" />
          <path
            d="M688 444 L800 366 L912 444 Q 918 455 904 453 Q 896 462 888 452 L800 390 L712 452 Q 702 463 696 452 Q 682 455 688 444 Z"
            fill="#ffffff"
          />
          <path d="M752 418 L800 386 L848 418" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />

          {/* 창문: 안쪽에 모닥불 */}
          <g filter="url(#snow-window-glow)">
            <rect x="738" y="450" width="54" height="40" fill="url(#snow-window)" />
          </g>
          {/* 장작 */}
          <g stroke="#3b2414" strokeWidth="4" strokeLinecap="round">
            <line x1="752" y1="487" x2="778" y2="481" />
            <line x1="752" y1="481" x2="778" y2="487" />
          </g>
          {/* 불꽃 */}
          <path className="snow-flame snow-flame-1" d="M765 484 C 754 474, 760 466, 764 458 C 766 466, 776 470, 765 484 Z" fill="#f97316" />
          <path className="snow-flame snow-flame-2" d="M759 485 C 752 478, 755 472, 758 468 C 760 474, 765 478, 759 485 Z" fill="#fb923c" />
          <path className="snow-flame snow-flame-3" d="M771 485 C 765 479, 768 473, 772 469 C 773 475, 778 479, 771 485 Z" fill="#fb923c" />
          <path className="snow-flame snow-flame-2" d="M765 484 C 760 478, 763 473, 765 468 C 767 473, 771 478, 765 484 Z" fill="#fde68a" />
          {/* 창틀 */}
          <rect x="738" y="450" width="54" height="40" fill="none" stroke="#3f2616" strokeWidth="4" />
          <line x1="765" y1="450" x2="765" y2="476" stroke="#3f2616" strokeWidth="3" />
          <line x1="738" y1="468" x2="792" y2="468" stroke="#3f2616" strokeWidth="3" />
          <rect x="734" y="489" width="62" height="6" rx="2" fill="#ffffff" />

          {/* 문 */}
          <rect x="818" y="462" width="34" height="50" rx="3" fill="#4a2e1b" />
          <line x1="835" y1="464" x2="835" y2="510" stroke="#3b2414" strokeWidth="1.5" />
          <circle cx="846" cy="489" r="2.2" fill="#fbbf24" />
          <rect x="814" y="456" width="42" height="7" rx="3" fill="#ffffff" />
        </g>

        {/* 앞쪽 전나무 */}
        <TreeGroup trees={FRONT_TREES} />

        {/* 맨 앞 눈 더미 (오두막 아랫부분을 덮음) */}
        <path
          d="M0 560 C 200 530, 420 545, 600 525 C 700 512, 760 508, 900 512 C 1050 518, 1250 545, 1600 530 L1600 600 L0 600 Z"
          fill="#ffffff"
        />
      </svg>

      {/* 내리는 눈 (장면 위 전체) */}
      <div className="scene-layer">
        {FLAKES.map((style, i) => (
          <span key={i} className="snow-flake" style={style} />
        ))}
      </div>
    </div>
  );
}
