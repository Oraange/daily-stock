import { MONTH, TRADES } from '../data';
import { UP, emoChipStyle, pnlColor, signed } from '../utils';
import { DonutChart, EquityChart } from '../components/charts';

const KPIS = [
  {
    icon: '💰',
    label: '총 손익',
    value: '+4,280,000',
    delta: '전월 대비 +8.4%',
    deltaColor: UP,
    deltaWeight: 700,
  },
  {
    icon: '📈',
    label: '이번 달 손익',
    value: '+1,240,000',
    delta: '실현 기준 +4.1%',
    deltaColor: UP,
    deltaWeight: 700,
  },
  {
    icon: '🎯',
    label: '평균 손익비',
    value: '1.8',
    delta: '수익 3.4% / 손실 1.9%',
    deltaColor: '#a49e93',
    deltaWeight: 600,
  },
];

interface Props {
  onGoJournal: () => void;
}

export default function Dashboard({ onGoJournal }: Props) {
  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI 행 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(150deg,#2a2723,#151311)',
            borderRadius: 20,
            padding: '22px 24px',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: 13, color: '#c9c2b6', fontWeight: 600 }}>총 자산</div>
          <div
            className="num"
            style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', marginTop: 8 }}
          >
            ₩32,480,000
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 12,
              padding: '5px 10px',
              background: 'rgba(240,68,56,.18)',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              color: '#ff8178',
            }}
          >
            ▲ +4,280,000 (+15.2%)
          </div>
          <div
            style={{
              position: 'absolute',
              right: -30,
              bottom: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(255,107,74,.35),transparent 70%)',
            }}
          />
        </div>

        {KPIS.map((k) => (
          <div key={k.label} className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'var(--ink-3)',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 15 }}>{k.icon}</span>
              {k.label}
            </div>
            <div
              className="num"
              style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginTop: 10 }}
            >
              {k.value}
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: k.deltaWeight,
                color: k.deltaColor,
                marginTop: 7,
              }}
            >
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* 차트 행 */}
      <div className="chart-row" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16 }}>
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 15 }}>자산 추이</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>최근 30일</div>
          </div>
          <EquityChart days={MONTH.list} />
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>이번 달 매매 성향</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
            <DonutChart win={0.62} />
            <div style={{ lineHeight: 1.5 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>승률</div>
              <div
                className="num"
                style={{ fontSize: 30, fontWeight: 800, color: UP, lineHeight: 1 }}
              >
                62%
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 6 }}>
                21승 · 13패
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: 'var(--ink-2)' }}>평균 수익</span>
              <span style={{ color: 'var(--up)', fontWeight: 700 }}>+3.4%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: 'var(--ink-2)' }}>평균 손실</span>
              <span style={{ color: 'var(--down)', fontWeight: 700 }}>-1.9%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: 'var(--ink-2)' }}>손익비</span>
              <span style={{ fontWeight: 700 }}>1.8</span>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 매매 */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15 }}>최근 매매</div>
          <button className="link-coral" onClick={onGoJournal}>
            전체보기 →
          </button>
        </div>
        {TRADES.slice(0, 4).map((t) => (
          <div
            key={t.name + t.date}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 6px',
              borderTop: '1px solid rgba(0,0,0,.05)',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#f5f2ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                color: '#6b655b',
              }}
            >
              {t.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
                {t.date} · {t.side} · {t.qty}주
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 700,
                ...emoChipStyle(t.emotion),
              }}
            >
              {t.emotion}
            </div>
            <div style={{ textAlign: 'right', minWidth: 96 }}>
              <div
                className="num"
                style={{ fontWeight: 800, fontSize: 14, color: pnlColor(t.up) }}
              >
                {signed(t.pnl)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: pnlColor(t.up) }}>{t.ret}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
