import { useRef, useState } from 'react';
import type { DayCell } from '../types';
import { DOWN, UP, eok, signed, won } from '../utils';

/** 값 배열 → [x,y] 좌표 (null은 비거래일 유지용) */
function linePts(
  vals: (number | null)[],
  w: number,
  ht: number,
  padX: number,
  padY: number,
): ([number, number] | null)[] {
  const real = vals.filter((v): v is number => v != null);
  const min = Math.min(...real);
  const max = Math.max(...real);
  const rng = max - min || 1;
  // 점이 1개(매월 1일)여도 NaN 좌표가 나오지 않게
  const step = vals.length > 1 ? (w - 2 * padX) / (vals.length - 1) : 0;
  return vals.map((v, i) =>
    v == null ? null : [padX + i * step, ht - padY - ((v - min) / rng) * (ht - 2 * padY)],
  );
}

function pathD(pts: [number, number][]) {
  return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
}

// ---- 자산 추이 (대시보드, 월초~오늘) ----

export function EquityChart({ days, monthLabel }: { days: DayCell[]; monthLabel: string }) {
  const w = 640;
  const ht = 190;
  const pad = 14;
  const series = days.map((x) => x.asset);
  const pts = linePts(series, w, ht, pad, pad) as [number, number][];
  const d = pathD(pts);
  const area = d + ` L${w - pad} ${ht - pad} L${pad} ${ht - pad} Z`;
  const last = pts[pts.length - 1];

  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const i = Math.round(((frac * w - pad) / (w - 2 * pad)) * (series.length - 1));
    setHover(Math.max(0, Math.min(series.length - 1, i)));
  };

  const hp = hover != null ? pts[hover] : null;

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative' }}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${w} ${ht}`}
        width="100%"
        height={ht}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b4a" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#ff6b4a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#eq)" />
        <path
          d={d}
          fill="none"
          stroke="#ff6b4a"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hp && (
          <line x1={hp[0]} x2={hp[0]} y1={pad} y2={ht - pad} stroke="#e8e4dd" strokeWidth={1} />
        )}
        {hp && <circle cx={hp[0]} cy={hp[1]} r={4.5} fill="#ff6b4a" stroke="#fff" strokeWidth={2} />}
        {!hp && (
          <circle cx={last[0]} cy={last[1]} r={4.5} fill="#ff6b4a" stroke="#fff" strokeWidth={2} />
        )}
      </svg>
      {hover != null && hp && (
        <div
          style={{
            position: 'absolute',
            left: `${(hp[0] / w) * 100}%`,
            top: 4,
            transform: `translateX(${hp[0] / w > 0.75 ? '-105%' : '8px'})`,
            background: '#211f1b',
            color: '#fff',
            borderRadius: 9,
            padding: '7px 11px',
            fontSize: 12,
            fontWeight: 700,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <div style={{ color: '#c9c2b6', fontWeight: 600, fontSize: 11 }}>
            {monthLabel} {days[hover].d}일
          </div>
          {won(series[hover])}
        </div>
      )}
    </div>
  );
}

// ---- 승률 도넛 (대시보드) ----

export function DonutChart({ win }: { win: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg width={96} height={96} viewBox="0 0 96 96" role="img" aria-label={`승률 ${win * 100}%`}>
      <circle cx={48} cy={48} r={r} fill="none" stroke="#eaf0fd" strokeWidth={12} />
      <circle
        cx={48}
        cy={48}
        r={r}
        fill="none"
        stroke={UP}
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={`${c * win} ${c}`}
        transform="rotate(-90 48 48)"
      />
    </svg>
  );
}

// ---- 주간 자산추이 꺾은선 (캘린더 주간 모드) ----

export function WeeklyChart({ week }: { week: (DayCell | null)[] }) {
  const w = 680;
  const ht = 260;
  const padX = 44;
  const padY = 44;
  const vals = week.map((c) => (c ? c.asset : null));
  const P = linePts(vals, w, ht, padX, padY);
  const drawn = P.filter((p): p is [number, number] => p != null);
  const d = pathD(drawn);
  const dows = ['일', '월', '화', '수', '목', '금', '토'];
  const gridY = [0, 0.5, 1].map((f) => padY + f * (ht - 2 * padY));

  return (
    <svg viewBox={`0 0 ${w} ${ht}`} width="100%" height={ht} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={UP} stopOpacity={0.16} />
          <stop offset="100%" stopColor={UP} stopOpacity={0} />
        </linearGradient>
      </defs>
      {gridY.map((y) => (
        <line key={y} x1={padX} x2={w - padX} y1={y} y2={y} stroke="#f0ede7" strokeWidth={1} />
      ))}
      {drawn.length > 1 && (
        <path
          d={`${d} L${drawn[drawn.length - 1][0]} ${ht - padY} L${drawn[0][0]} ${ht - padY} Z`}
          fill="url(#wk)"
        />
      )}
      {drawn.length > 1 && (
        <path
          d={d}
          fill="none"
          stroke={UP}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {P.map(
        (p, i) =>
          p && (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={5} fill="#fff" stroke={UP} strokeWidth={3} />
              <text
                x={p[0]}
                y={p[1] - 13}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill="#211f1b"
              >
                {eok(vals[i]!)}
              </text>
            </g>
          ),
      )}
      {dows.map((lbl, i) => {
        const x = padX + (i * (w - 2 * padX)) / 6;
        const c = week[i];
        return (
          <text
            key={'d' + i}
            x={x}
            y={ht - 16}
            textAnchor="middle"
            fontSize={11.5}
            fontWeight={700}
            fill={c ? '#8a857d' : '#d8d3ca'}
          >
            {c ? `${lbl} ${c.d}` : lbl}
          </text>
        );
      })}
    </svg>
  );
}

// ---- 요일별 손익 막대 (성과 분석) ----

export function WeekdayBars({ data }: { data: [string, number][] }) {
  const w = 460;
  const ht = 190;
  const pad = 30;
  const base = ht - 42;
  const max = Math.max(...data.map((d) => Math.abs(d[1]))) || 1;
  const bw = 42;
  return (
    <svg viewBox={`0 0 ${w} ${ht}`} width="100%" height={ht} style={{ display: 'block' }}>
      <line x1={pad} x2={w - pad} y1={base} y2={base} stroke="#e8e4dd" strokeWidth={1} />
      {data.map(([label, v], i) => {
        const x = pad + 20 + (i * (w - 2 * pad - 40)) / (data.length - 1);
        const up = v >= 0;
        const bh = (Math.abs(v) / max) * 70;
        return (
          <g key={label}>
            <rect
              x={x - bw / 2}
              y={up ? base - bh : base}
              width={bw}
              height={bh}
              rx={6}
              fill={up ? UP : DOWN}
              opacity={0.9}
            >
              <title>{`${label}요일 ${signed(v)}`}</title>
            </rect>
            <text
              x={x}
              y={up ? base - bh - 8 : base + bh + 16}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={up ? UP : DOWN}
            >
              {(up ? '+' : '') + Math.round(v / 10000) + '만'}
            </text>
            <text
              x={x}
              y={base + 16}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="#a49e93"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
