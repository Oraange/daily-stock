import type { DayCell, Emotion, Trade } from './types';

// ---- 2026년 7월 샘플 일자 데이터 (시드 기반 생성 — 프로토타입과 동일) ----

function seeded(n: number) {
  const x = Math.sin(n * 57.13) * 10000;
  return x - Math.floor(x);
}

function buildMonth() {
  const y = 2026;
  const m = 6; // July 2026
  const startDay = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  let asset = 31_240_000;
  const list: DayCell[] = [];
  for (let d = 1; d <= days; d++) {
    const wd = new Date(y, m, d).getDay();
    const r = seeded(d);
    const traded = wd !== 0 && wd !== 6 && r > 0.3;
    let pnl = 0;
    if (traded) {
      const up = r > 0.44;
      const mag = 90_000 + Math.floor(seeded(d * 3) * 680_000);
      pnl = up ? mag : -Math.floor(mag * 0.62);
      asset += pnl;
    }
    list.push({ d, wd, traded, pnl, asset });
  }
  return { startDay, days, list };
}

export const MONTH = buildMonth();

/** 1일의 요일만큼 앞을 null 패딩 후 7개씩 주 단위로 chunk */
export const WEEKS: (DayCell | null)[][] = (() => {
  const cells: (DayCell | null)[] = [];
  for (let i = 0; i < MONTH.startDay; i++) cells.push(null);
  MONTH.list.forEach((x) => cells.push(x));
  while (cells.length % 7) cells.push(null);
  const weeks: (DayCell | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
})();

// ---- 매매 기록 샘플 ----

type RawTrade = [
  string, string, Trade['side'], number, string, string, number, string, boolean, Emotion, string,
];

const RAW_TRADES: RawTrade[] = [
  ['에코프로', '07.03', '매도', 12, '118,400', '131,200', 153600, '+10.8%', true, '침착', '목표가 도달, 절반 익절 후 나머지도 정리. 계획대로 실행'],
  ['카카오', '07.02', '매도', 30, '52,100', '49,800', -69000, '-4.4%', false, '조급', '반등 기대하다 손절 라인 놓침. 다음엔 -3%에서 자르기'],
  ['삼성전자', '07.01', '매도', 20, '71,200', '74,600', 68000, '+4.8%', true, '자신감', '실적 발표 전 분할 매도. 뉴스 확인 후 진입한 게 주효'],
  ['NAVER', '06.30', '매도', 8, '186,000', '179,500', -52000, '-3.5%', false, '불안', '장 초반 급락에 흔들려 원칙보다 이르게 매도'],
  ['현대차', '06.27', '매도', 15, '241,000', '256,500', 232500, '+6.4%', true, '침착', '배당락 전 정리. 목표 수익률 달성해 만족'],
  ['LG에너지', '06.26', '매도', 5, '392,000', '378,000', -70000, '-3.6%', false, '욕심', '고점에서 더 오를 줄 알고 버티다 손실 확대'],
  ['SK하이닉스', '06.25', '매도', 10, '201,000', '218,000', 170000, '+8.5%', true, '자신감', '반도체 업황 개선 뉴스 확인 후 스윙, 성공'],
  ['포스코', '06.24', '매도', 18, '388,000', '375,000', -234000, '-3.4%', false, '조급', '장중 변동성에 예정보다 빨리 청산'],
];

export const TRADES: Trade[] = RAW_TRADES.map(
  ([name, date, side, qty, buy, sell, pnl, ret, up, emotion, memo]) => ({
    name, date, side, qty, buy, sell, pnl, ret, up, emotion, memo,
  }),
);

// ---- 성과 분석 샘플 ----

export interface Stat {
  label: string;
  value: string;
  sub: string;
  color?: string;
}

export const STATS: Stat[] = [
  { label: '승률', value: '62%', sub: '21승 13패', color: '#f04438' },
  { label: '손익비', value: '1.8', sub: '평균수익 / 평균손실' },
  { label: '총 매매', value: '84회', sub: '6개월 누적' },
  { label: '최대 연속 수익', value: '5회', sub: '6/25 ~ 7/03', color: '#f04438' },
  { label: '평균 보유', value: '3.2일', sub: '단기 스윙 위주' },
  { label: '최대 손실', value: '-234,000', sub: '단일 매매 기준', color: '#2f6bed' },
];

export interface EmoStat {
  label: Emotion;
  win: number;
  count: number;
}

export const EMO_STATS: EmoStat[] = [
  { label: '침착', win: 78, count: 18 },
  { label: '자신감', win: 71, count: 14 },
  { label: '불안', win: 44, count: 9 },
  { label: '조급', win: 38, count: 13 },
  { label: '욕심', win: 25, count: 8 },
];

/** 요일별 손익 (월~금) */
export const WEEKDAY_PNL: [string, number][] = [
  ['월', 420000],
  ['화', -180000],
  ['수', 640000],
  ['목', 210000],
  ['금', -90000],
];
