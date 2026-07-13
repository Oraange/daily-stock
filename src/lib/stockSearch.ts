import type { StockHit } from './db';

// 한글 음절의 초성 테이블 (유니코드 가~힣 분해 순서)
const CHO = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const choOf = (ch: string): string | null => {
  const c = ch.charCodeAt(0);
  return c >= 0xac00 && c <= 0xd7a3 ? CHO[Math.floor((c - 0xac00) / 588)] : null;
};

const isCho = (ch: string) => CHO.includes(ch);

const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/**
 * 공백 무시 + 초성 허용 연속 부분 일치.
 * 쿼리의 각 글자는 종목명 글자와 같거나(대소문자 무시), 초성 자음이면 해당 글자의 초성과 일치하면 매치.
 * 예) "skㅎ" → "SK하이닉스"(0), "하이닉" → "SK하이닉스"(2). 매치 시작 위치, 없으면 -1.
 */
export function matchIndex(name: string, normalizedQuery: string): number {
  const n = normalize(name);
  const q = normalizedQuery;
  if (!q || q.length > n.length) return -1;
  for (let start = 0; start + q.length <= n.length; start++) {
    let ok = true;
    for (let i = 0; i < q.length; i++) {
      const nc = n[start + i];
      const qc = q[i];
      if (qc !== nc && !(isCho(qc) && choOf(nc) === qc)) {
        ok = false;
        break;
      }
    }
    if (ok) return start;
  }
  return -1;
}

/** 자동완성 후보: 앞쪽에서 매치될수록 → 이름이 짧을수록 → 가나다순 */
export function filterStocks(all: StockHit[], query: string, limit = 8): StockHit[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: { hit: StockHit; pos: number }[] = [];
  for (const hit of all) {
    const pos = matchIndex(hit.name, q);
    if (pos >= 0) scored.push({ hit, pos });
  }
  scored.sort(
    (a, b) =>
      a.pos - b.pos ||
      a.hit.name.length - b.hit.name.length ||
      a.hit.name.localeCompare(b.hit.name, 'ko'),
  );
  return scored.slice(0, limit).map((x) => x.hit);
}
