export type Screen = 'dash' | 'cal' | 'journal' | 'analysis' | 'reflect';

export type CalMode = 'month' | 'week';

export type Side = '매수' | '매도';

export type Emotion = '침착' | '자신감' | '불안' | '조급' | '욕심' | '후회';

export interface Trade {
  name: string;
  date: string;
  side: Side;
  qty: number;
  buy: string;
  sell: string;
  pnl: number;
  ret: string;
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
