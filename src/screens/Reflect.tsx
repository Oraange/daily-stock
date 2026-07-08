import { useTrades } from '../lib/trades';
import { emoChipStyle, pnlColor, signed, signedPct } from '../utils';

export default function Reflect() {
  const { trades, derived } = useTrades();
  const reflections = trades.filter((t) => t.memo.trim() !== '').slice(0, 8);

  // 이번 달 손실 매매에서 가장 잦았던 감정
  const monthPrefix = new Date().toISOString().slice(0, 7);
  const lossEmotions = trades.filter(
    (t) => t.tradedAt.startsWith(monthPrefix) && t.pnl != null && t.pnl < 0,
  );
  const emoCount = new Map<string, number>();
  for (const t of lossEmotions) emoCount.set(t.emotion, (emoCount.get(t.emotion) ?? 0) + 1);
  const topLossEmotion = [...emoCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const monthTradeCount = trades.filter(
    (t) => t.tradedAt.startsWith(monthPrefix) && t.pnl != null,
  ).length;

  return (
    <div
      className="screen"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 820 }}
    >
      {/* 이번 달 하이라이트 */}
      <div
        style={{
          background: 'linear-gradient(135deg,#fff2ec,#fdeee6)',
          border: '1px solid #ffddcf',
          borderRadius: 20,
          padding: '22px 26px',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
          🌱 {derived.monthLabel} 회고
        </div>
        <div style={{ fontSize: 13.5, color: '#7a6f63', fontWeight: 500, lineHeight: 1.6 }}>
          {monthTradeCount === 0 ? (
            <>아직 이번 달 실현된 매매가 없어요. 첫 기록을 남기고 함께 돌아봐요.</>
          ) : (
            <>
              이번 달 {monthTradeCount}건의 매매를 실현했고, 실현손익은{' '}
              <b style={{ color: pnlColor(derived.monthPnl >= 0) }}>
                {signed(derived.monthPnl)}원
              </b>
              이에요.
              {topLossEmotion && (
                <>
                  {' '}
                  손실 매매에서 가장 잦았던 감정은{' '}
                  <b style={{ color: 'var(--up)' }}>{topLossEmotion}</b>
                  이었어요. 같은 상황이 오면 잠시 멈추고 원칙을 확인해봐요.
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 매매별 회고 카드 */}
      {reflections.length === 0 && (
        <div className="card" style={{ borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            메모가 있는 매매 기록이 여기에 모여요.
            <br />
            매매를 기록할 때 그때의 감정과 배운 점을 함께 남겨보세요 ✍️
          </div>
        </div>
      )}
      {reflections.map((t) => (
        <div key={t.id} className="card" style={{ borderRadius: 18, padding: '20px 24px' }}>
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
                color: t.pnl == null ? 'var(--ink-3)' : pnlColor(t.up),
              }}
            >
              {t.pnl == null ? '보유중' : t.ret != null ? signedPct(t.ret) : signed(t.pnl)}
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
              borderLeft: `3px solid ${t.pnl == null ? 'var(--ink-4)' : pnlColor(t.up)}`,
            }}
          >
            "{t.memo}"
          </div>
        </div>
      ))}
    </div>
  );
}
