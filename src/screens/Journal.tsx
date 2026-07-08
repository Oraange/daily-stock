import { useState } from 'react';
import { TRADES } from '../data';
import { DOWN, UP, emoChipStyle, pnlColor, signed } from '../utils';

const FILTERS = ['전체', '수익', '손실', '매수', '매도'] as const;
type Filter = (typeof FILTERS)[number];

const HEADER_COLS: { label: string; align?: 'right' | 'center' }[] = [
  { label: '종목' },
  { label: '구분' },
  { label: '수량' },
  { label: '평단/청산', align: 'right' },
  { label: '손익', align: 'right' },
  { label: '감정', align: 'center' },
];

export default function Journal() {
  const [filter, setFilter] = useState<Filter>('전체');

  const rows = TRADES.filter((t) => {
    switch (filter) {
      case '수익':
        return t.up;
      case '손실':
        return !t.up;
      case '매수':
        return t.side === '매수';
      case '매도':
        return t.side === '매도';
      default:
        return true;
    }
  });

  return (
    <div className="screen">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '9px 16px',
                borderRadius: 11,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                border: `1px solid ${active ? 'var(--dark)' : 'rgba(0,0,0,.08)'}`,
                background: active ? 'var(--dark)' : '#fff',
                color: active ? '#fff' : 'var(--ink-2)',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr .7fr .7fr .8fr 1fr .9fr',
            gap: 12,
            padding: '14px 22px',
            background: 'var(--soft-1)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--ink-3)',
            borderBottom: '1px solid rgba(0,0,0,.05)',
          }}
        >
          {HEADER_COLS.map((c) => (
            <span key={c.label} style={{ textAlign: c.align }}>
              {c.label}
            </span>
          ))}
        </div>

        {rows.map((t) => (
          <div key={t.name + t.date} className="journal-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#f5f2ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#6b655b',
                }}
              >
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-4)', fontWeight: 600 }}>
                  {t.date}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: t.side === '매수' ? UP : DOWN,
              }}
            >
              {t.side}
            </span>
            <span className="num" style={{ fontSize: 13, fontWeight: 600, color: '#6b655b' }}>
              {t.qty}주
            </span>
            <div
              className="num"
              style={{ textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: '#6b655b' }}
            >
              <div>{t.buy}</div>
              <div style={{ color: 'var(--ink-4)' }}>{t.sell}</div>
            </div>
            <div className="num" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: pnlColor(t.up) }}>
                {signed(t.pnl)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: pnlColor(t.up) }}>{t.ret}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span
                style={{
                  padding: '5px 11px',
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  ...emoChipStyle(t.emotion),
                }}
              >
                {t.emotion}
              </span>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div
            style={{
              padding: '36px 22px',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--ink-3)',
            }}
          >
            조건에 맞는 매매 기록이 없어요
          </div>
        )}
      </div>
    </div>
  );
}
