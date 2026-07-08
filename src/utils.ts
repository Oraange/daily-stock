import type { CSSProperties } from 'react';
import type { Emotion } from './types';

export const won = (n: number) => '₩' + Math.round(n).toLocaleString('en-US');

/** 만 단위 축약 (예: 31,240만) */
export const eok = (n: number) => Math.round(n / 10000).toLocaleString('en-US') + '만';

export const signed = (n: number) => (n >= 0 ? '+' : '') + Math.round(n).toLocaleString('en-US');

/** 수익률 % 표시 (예: +10.8%) */
export const signedPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';

export const EMO_COLORS: Record<Emotion, string> = {
  침착: '#2f9e78',
  자신감: '#e0982f',
  불안: '#4f86d6',
  조급: '#a874d6',
  욕심: '#e5675e',
  후회: '#8a857d',
};

export const emoColor = (e: Emotion) => EMO_COLORS[e] ?? '#8a857d';

/** 감정 칩: 글자색 = 감정색, 배경 = 감정색 12% */
export const emoChipStyle = (e: Emotion): CSSProperties => ({
  color: emoColor(e),
  background: emoColor(e) + '1f',
});

export const UP = '#f04438';
export const DOWN = '#2f6bed';
export const UP_BG = '#fdecea';
export const DOWN_BG = '#eaf0fd';

export const pnlColor = (up: boolean) => (up ? UP : DOWN);
