import { useTrades } from '../lib/trades';
import { emoColor } from '../utils';
import { WeekdayBars } from '../components/charts';

export default function Analysis() {
  const { derived } = useTrades();
  const { stats, emoStats, weekdayPnl } = derived;

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 스탯 카드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))',
          gap: 14,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ borderRadius: 18, padding: '18px 20px' }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>{s.label}</div>
            <div
              className="num"
              style={{
                fontSize: 24,
                fontWeight: 800,
                marginTop: 8,
                letterSpacing: '-.02em',
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', fontWeight: 600, marginTop: 3 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div
        className="grid-2col"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}
      >
        {/* 감정별 승률 */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>감정별 승률</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 18 }}>
            어떤 마음일 때 결과가 좋았나요?
          </div>
          {emoStats.length === 0 && (
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', padding: '20px 0' }}>
              실현된 매매가 쌓이면 감정별 승률을 보여드릴게요
            </div>
          )}
          {emoStats.map((e) => (
            <div key={e.label} style={{ marginBottom: 15 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                <span>{e.label}</span>
                <span className="num" style={{ color: '#6b655b' }}>
                  {e.win}% · {e.count}회
                </span>
              </div>
              <div
                style={{ height: 9, background: '#f0ede7', borderRadius: 6, overflow: 'hidden' }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 6,
                    width: `${e.win}%`,
                    background: emoColor(e.label),
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 요일별 손익 */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>요일별 손익</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 8 }}>
            거래 요일에 따른 성과 분포
          </div>
          <WeekdayBars data={weekdayPnl} />
        </div>
      </div>
    </div>
  );
}
