import type { DayCell, Emotion, UiTrade } from '../types';
import { DOWN, UP, signed } from '../utils';

export interface EmoStat {
  label: Emotion;
  win: number;
  count: number;
}

export interface StatCard {
  label: string;
  value: string;
  sub: string;
  color?: string;
}

export interface Derived {
  monthLabel: string; // '7월'
  headerLabel: string; // '2026년 7월'
  monthList: DayCell[];
  equityDays: DayCell[]; // 자산 추이 그래프용 — 월초~오늘 (미래 날짜 제외)
  weeks: (DayCell | null)[][];
  totalAsset: number;
  totalPnl: number;
  monthPnl: number;
  tradingDays: number;
  monthWins: number;
  monthLosses: number;
  winRatePct: number; // 이번 달, 0~100
  avgWinPct: number;
  avgLossPct: number; // 음수
  payoff: number;
  stats: StatCard[];
  emoStats: EmoStat[];
  weekdayPnl: [string, number][];
}

const localDate = (iso: string) => new Date(iso + 'T00:00:00');

const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

/** 매매 기록 목록에서 모든 화면의 표시값을 파생 계산 */
export function buildDerived(trades: UiTrade[], initialCapital: number, now = new Date()): Derived {
  const y = now.getFullYear();
  const m = now.getMonth();
  const mm = String(m + 1).padStart(2, '0');
  const monthPrefix = `${y}-${mm}`;
  const monthStart = `${monthPrefix}-01`;

  const closed = trades.filter((t): t is UiTrade & { pnl: number } => t.pnl != null);
  const totalPnl = closed.reduce((s, t) => s + t.pnl, 0);
  const totalAsset = initialCapital + totalPnl;

  // ---- 이번 달 일별 집계 → 캘린더 셀 ----
  const pnlByDate = new Map<string, number>();
  const countByDate = new Map<string, number>();
  for (const t of closed) {
    if (!t.tradedAt.startsWith(monthPrefix)) continue;
    pnlByDate.set(t.tradedAt, (pnlByDate.get(t.tradedAt) ?? 0) + t.pnl);
    countByDate.set(t.tradedAt, (countByDate.get(t.tradedAt) ?? 0) + 1);
  }

  // 월초 기준 자산 = 초기 자본 + 이전 달까지의 누적 손익
  let asset =
    initialCapital + closed.filter((t) => t.tradedAt < monthStart).reduce((s, t) => s + t.pnl, 0);

  const days = new Date(y, m + 1, 0).getDate();
  const monthList: DayCell[] = [];
  for (let d = 1; d <= days; d++) {
    const iso = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const pnl = pnlByDate.get(iso) ?? 0;
    asset += pnl;
    monthList.push({ d, wd: new Date(y, m, d).getDay(), traded: countByDate.has(iso), pnl, asset });
  }

  // 그래프는 오늘까지만 (캘린더용 monthList는 월 전체 유지)
  const equityDays = monthList.slice(0, now.getDate());

  // 1일의 요일만큼 앞을 null 패딩 후 7개씩 chunk
  const startDay = new Date(y, m, 1).getDay();
  const cells: (DayCell | null)[] = Array<DayCell | null>(startDay).fill(null);
  monthList.forEach((c) => cells.push(c));
  while (cells.length % 7) cells.push(null);
  const weeks: (DayCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // ---- 이번 달 매매 성향 ----
  const monthClosed = closed.filter((t) => t.tradedAt.startsWith(monthPrefix));
  const monthPnl = monthClosed.reduce((s, t) => s + t.pnl, 0);
  const monthWins = monthClosed.filter((t) => t.pnl > 0).length;
  const monthLosses = monthClosed.filter((t) => t.pnl < 0).length;
  const winRatePct = monthClosed.length
    ? Math.round((monthWins / monthClosed.length) * 100)
    : 0;
  const rets = (list: (UiTrade & { pnl: number })[]) =>
    list.map((t) => t.ret).filter((r): r is number => r != null);
  const avgWinPct = mean(rets(monthClosed.filter((t) => t.pnl > 0)));
  const avgLossPct = mean(rets(monthClosed.filter((t) => t.pnl < 0)));
  const payoff = avgLossPct !== 0 ? avgWinPct / Math.abs(avgLossPct) : 0;

  // ---- 성과 분석 (전체 누적) ----
  const wins = closed.filter((t) => t.pnl > 0).length;
  const losses = closed.filter((t) => t.pnl < 0).length;
  const winRateAll = closed.length ? Math.round((wins / closed.length) * 100) : 0;
  const avgWinAll = mean(rets(closed.filter((t) => t.pnl > 0)));
  const avgLossAll = mean(rets(closed.filter((t) => t.pnl < 0)));
  const payoffAll = avgLossAll !== 0 ? avgWinAll / Math.abs(avgLossAll) : 0;
  const avgRetAll = mean(rets(closed));
  const maxLoss = closed.length ? Math.min(...closed.map((t) => t.pnl), 0) : 0;

  // 최대 연속 수익 (거래일 오름차순)
  let maxStreak = 0;
  let streak = 0;
  for (const t of [...closed].sort((a, b) => a.tradedAt.localeCompare(b.tradedAt))) {
    streak = t.pnl > 0 ? streak + 1 : 0;
    maxStreak = Math.max(maxStreak, streak);
  }

  const stats: StatCard[] = [
    { label: '승률', value: `${winRateAll}%`, sub: `${wins}승 ${losses}패`, color: UP },
    { label: '손익비', value: payoffAll ? payoffAll.toFixed(1) : '—', sub: '평균수익 / 평균손실' },
    { label: '총 매매', value: `${trades.length}회`, sub: '누적 기록' },
    { label: '최대 연속 수익', value: `${maxStreak}회`, sub: '거래일 기준', color: UP },
    {
      label: '평균 수익률',
      value: closed.length ? `${avgRetAll >= 0 ? '+' : ''}${avgRetAll.toFixed(1)}%` : '—',
      sub: '실현 매매 기준',
      color: avgRetAll >= 0 ? UP : DOWN,
    },
    { label: '최대 손실', value: signed(maxLoss), sub: '단일 매매 기준', color: DOWN },
  ];

  // ---- 감정별 승률 ----
  const emoMap = new Map<Emotion, { win: number; count: number }>();
  for (const t of closed) {
    const e = emoMap.get(t.emotion) ?? { win: 0, count: 0 };
    e.count += 1;
    if (t.pnl > 0) e.win += 1;
    emoMap.set(t.emotion, e);
  }
  const emoStats: EmoStat[] = [...emoMap.entries()]
    .map(([label, { win, count }]) => ({ label, win: Math.round((win / count) * 100), count }))
    .sort((a, b) => b.win - a.win);

  // ---- 요일별 손익 (월~금) ----
  const weekdaySum = [0, 0, 0, 0, 0]; // 월~금
  for (const t of closed) {
    const wd = localDate(t.tradedAt).getDay();
    if (wd >= 1 && wd <= 5) weekdaySum[wd - 1] += t.pnl;
  }
  const weekdayPnl: [string, number][] = ['월', '화', '수', '목', '금'].map((label, i) => [
    label,
    weekdaySum[i],
  ]);

  return {
    monthLabel: `${m + 1}월`,
    headerLabel: `${y}년 ${m + 1}월`,
    monthList,
    equityDays,
    weeks,
    totalAsset,
    totalPnl,
    monthPnl,
    tradingDays: countByDate.size,
    monthWins,
    monthLosses,
    winRatePct,
    avgWinPct,
    avgLossPct,
    payoff,
    stats,
    emoStats,
    weekdayPnl,
  };
}
