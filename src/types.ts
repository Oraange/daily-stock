export type Screen = 'dash' | 'cal' | 'journal' | 'analysis' | 'reflect';

export type CalMode = 'month' | 'week';

export type Side = '매수' | '매도';

export type Emotion = '침착' | '자신감' | '불안' | '조급' | '욕심' | '후회';

/** 화면 표시용 매매 기록 (trades row에서 매핑) */
export interface UiTrade {
  id: string;
  name: string;
  /** 'MM.DD' 표시용 */
  date: string;
  /** 'YYYY-MM-DD' */
  tradedAt: string;
  side: Side;
  qty: number;
  buyPrice: number;
  sellPrice: number | null;
  /** 천단위 콤마 문자열 (미청산 시 '—') */
  buy: string;
  sell: string;
  /** 실현 손익 (미청산 시 null) */
  pnl: number | null;
  /** 수익률 % (미청산 시 null) */
  ret: number | null;
  up: boolean;
  emotion: Emotion;
  memo: string;
}

/** 캘린더의 하루 (해당 월 기준) */
export interface DayCell {
  /** 일(day of month) */
  d: number;
  /** 요일 0(일)~6(토) */
  wd: number;
  traded: boolean;
  pnl: number;
  /** 그날 마감 기준 총 자산 */
  asset: number;
}
