import type { CSSProperties } from 'react';
import type { CalMode, DayCell } from '../types';
import { WEEKS } from '../data';
import { DOWN, DOWN_BG, UP, UP_BG, eok, pnlColor, signed, won } from '../utils';
import { WeeklyChart } from '../components/charts';

const DOWS = ['일', '월', '화', '수', '목', '금', '토'];

const dowColor = (i: number) => (i === 0 ? UP : i === 6 ? DOWN : 'var(--ink-3)');

interface Props {
  calMode: CalMode;
  onChangeMode: (m: CalMode) => void;
  week: number;
  onChangeWeek: (w: number) => void;
}

export default function CalendarScreen({ calMode, onChangeMode, week, onChangeWeek }: Props) {
  const isMonth = calMode === 'month';

  const toggleBtn = (active: boolean): CSSProperties => ({
    padding: '9px 18px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: 'pointer',
    transition: '.15s',
    background: active ? '#fff' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-2)',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
  });

  // 주간 요약
  const cur = WEEKS[week] ?? WEEKS[0];
  const real = cur.filter((x): x is DayCell => x != null);
  const wStart = real[0];
  const wEnd = real[real.length - 1];
  const prevWeekEnd = WEEKS[week - 1]?.filter((x): x is DayCell => x != null).slice(-1)[0];
  const wDelta = wEnd.asset - (prevWeekEnd ? prevWeekEnd.asset : wStart.asset - (wStart.pnl || 0));

  return (
    <div className="screen">
      {/* 토글 + 요약 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'inline-flex', padding: 4, background: '#ece8e1', borderRadius: 13 }}>
          <button style={toggleBtn(isMonth)} onClick={() => onChangeMode('month')}>
            월간
          </button>
          <button style={toggleBtn(!isMonth)} onClick={() => onChangeMode('week')}>
            주간 자산추이
          </button>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div
            className="card"
            style={{ borderRadius: 14, padding: '11px 18px', textAlign: 'center' }}
          >
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>7월 실현손익</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800, color: UP }}>
              +1,240,000
            </div>
          </div>
          <div
            className="card"
            style={{ borderRadius: 14, padding: '11px 18px', textAlign: 'center' }}
          >
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>거래일</div>
            <div className="num" style={{ fontSize: 18, fontWeight: 800 }}>17일</div>
          </div>
        </div>
      </div>

      {isMonth ? (
        /* ---- 월간 그리드 ---- */
        <div className="card" style={{ padding: '18px 20px 22px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              gap: 8,
              marginBottom: 10,
            }}
          >
            {DOWS.map((label, i) => (
              <div
                key={label}
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 0',
                  color: dowColor(i),
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
            {WEEKS.flat().map((c, i) => {
              if (!c)
                return (
                  <div
                    key={'e' + i}
                    style={{
                      aspectRatio: '1/.86',
                      borderRadius: 12,
                      background: 'var(--soft-1)',
                      opacity: 0.5,
                    }}
                  />
                );
              const gain = c.pnl > 0;
              const loss = c.pnl < 0;
              return (
                <div
                  key={c.d}
                  style={{
                    aspectRatio: '1/.86',
                    borderRadius: 12,
                    padding: '8px 9px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: gain ? UP_BG : loss ? DOWN_BG : 'var(--soft-2)',
                    border: '1px solid rgba(0,0,0,.02)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.wd === 0 ? UP : c.wd === 6 ? DOWN : '#6b655b',
                      }}
                    >
                      {c.d}
                    </span>
                    {c.traded && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: gain ? UP : loss ? DOWN : 'var(--ink-4)',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <div
                      className="num"
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        letterSpacing: '-.02em',
                        color: gain ? UP : loss ? DOWN : '#c4beb4',
                      }}
                    >
                      {c.traded ? signed(c.pnl) : '·'}
                    </div>
                    <div
                      className="num"
                      style={{ fontSize: 10.5, color: 'var(--ink-4)', fontWeight: 600 }}
                    >
                      {eok(c.asset)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 18,
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgba(0,0,0,.05)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ink-2)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: UP_BG }} />
              수익일
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: DOWN_BG }} />
              손실일
            </span>
            <span style={{ marginLeft: 'auto' }}>하단 회색 숫자 = 그날의 총 자산</span>
          </div>
        </div>
      ) : (
        /* ---- 주간 꺾은선 ---- */
        <div className="card" style={{ padding: '20px 24px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>7월 {week + 1}째 주</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
                한 주 동안의 자산 변동을 이어서 확인해요
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="icon-btn"
                aria-label="이전 주"
                style={{ width: 36, height: 36 }}
                onClick={() => onChangeWeek(Math.max(0, week - 1))}
              >
                ‹
              </button>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--ink-2)',
                  minWidth: 74,
                  textAlign: 'center',
                }}
              >
                {wStart.d}일 ~ {wEnd.d}일
              </div>
              <button
                className="icon-btn"
                aria-label="다음 주"
                style={{ width: 36, height: 36 }}
                onClick={() => onChangeWeek(Math.min(WEEKS.length - 1, week + 1))}
              >
                ›
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', margin: '14px 0 6px' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>주간 변동</div>
              <div
                className="num"
                style={{ fontSize: 20, fontWeight: 800, color: pnlColor(wDelta >= 0) }}
              >
                {signed(wDelta)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>주말 자산</div>
              <div className="num" style={{ fontSize: 20, fontWeight: 800 }}>
                {won(wEnd.asset)}
              </div>
            </div>
          </div>
          <div style={{ width: '100%', marginTop: 8 }}>
            <WeeklyChart week={cur} />
          </div>
        </div>
      )}
    </div>
  );
}
