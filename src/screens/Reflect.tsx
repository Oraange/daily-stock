import { TRADES } from '../data';
import { emoChipStyle, pnlColor } from '../utils';

export default function Reflect() {
  const reflections = TRADES.filter((t) => t.memo).slice(0, 5);

  return (
    <div
      className="screen"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 820 }}
    >
      {/* 주간 하이라이트 */}
      <div
        style={{
          background: 'linear-gradient(135deg,#fff2ec,#fdeee6)',
          border: '1px solid #ffddcf',
          borderRadius: 20,
          padding: '22px 26px',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🌱 이번 주 회고</div>
        <div style={{ fontSize: 13.5, color: '#7a6f63', fontWeight: 500, lineHeight: 1.6 }}>
          손절은 잘 지켰지만, 수익 구간에서 <b style={{ color: 'var(--up)' }}>욕심</b>을 냈던 거래가
          3건 있었어요. 목표가 도달 시 절반 익절 원칙을 다음 주에 지켜봐요.
        </div>
      </div>

      {/* 매매별 회고 카드 */}
      {reflections.map((t) => (
        <div
          key={t.name + t.date}
          className="card"
          style={{ borderRadius: 18, padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span
              style={{
                padding: '5px 12px',
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 700,
                ...emoChipStyle(t.emotion),
              }}
            >
              {t.emotion}
            </span>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 600 }}>{t.date}</div>
            <div
              className="num"
              style={{
                marginLeft: 'auto',
                fontWeight: 800,
                fontSize: 15,
                color: pnlColor(t.up),
              }}
            >
              {t.ret}
            </div>
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: '#5c554b',
              fontWeight: 500,
              lineHeight: 1.65,
              padding: '13px 16px',
              background: 'var(--soft-1)',
              borderRadius: 12,
              borderLeft: `3px solid ${pnlColor(t.up)}`,
            }}
          >
            "{t.memo}"
          </div>
        </div>
      ))}
    </div>
  );
}
