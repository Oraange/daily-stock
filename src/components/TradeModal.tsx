import { useState } from 'react';
import type { Emotion, Side } from '../types';
import { DOWN, DOWN_BG, UP, UP_BG, emoColor } from '../utils';

const EMO_OPTIONS: Emotion[] = ['침착', '자신감', '불안', '조급', '욕심'];

interface Props {
  onClose: () => void;
}

export default function TradeModal({ onClose }: Props) {
  const [side, setSide] = useState<Side>('매수');
  const [emotion, setEmotion] = useState<Emotion>('침착');

  const sideBtn = (s: Side): React.CSSProperties => {
    const active = side === s;
    const color = s === '매수' ? UP : DOWN;
    const bg = s === '매수' ? UP_BG : DOWN_BG;
    return {
      flex: 1,
      padding: 12,
      border: `1.5px solid ${active ? color : 'rgba(0,0,0,.1)'}`,
      borderRadius: 11,
      background: active ? bg : '#fff',
      color: active ? color : 'var(--ink-2)',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: 13.5,
    };
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,25,21,.42)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        animation: 'floatIn .2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="새 매매 기록"
        style={{
          width: 'min(520px,92vw)',
          maxHeight: '90vh',
          overflow: 'auto',
          background: '#fff',
          borderRadius: 24,
          padding: '28px 30px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}
        >
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>새 매매 기록</div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: 'none',
              background: '#f2efe9',
              cursor: 'pointer',
              fontSize: 17,
              color: 'var(--ink-2)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="trade-name">종목명</label>
            <input id="trade-name" className="field-input" placeholder="예) 삼성전자" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span className="field-label">구분</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={sideBtn('매수')} onClick={() => setSide('매수')}>매수</button>
                <button style={sideBtn('매도')} onClick={() => setSide('매도')}>매도</button>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="trade-qty">수량</label>
              <input id="trade-qty" className="field-input" placeholder="0" inputMode="numeric" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="field-label" htmlFor="trade-buy">매수가</label>
              <input id="trade-buy" className="field-input" placeholder="₩0" inputMode="numeric" />
            </div>
            <div>
              <label className="field-label" htmlFor="trade-sell">청산가</label>
              <input id="trade-sell" className="field-input" placeholder="₩0" inputMode="numeric" />
            </div>
          </div>

          <div>
            <span className="field-label" style={{ marginBottom: 9 }}>그때의 감정</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EMO_OPTIONS.map((e) => {
                const c = emoColor(e);
                const active = emotion === e;
                return (
                  <button
                    key={e}
                    onClick={() => setEmotion(e)}
                    style={{
                      padding: '9px 15px',
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      border: `1.5px solid ${active ? c : c + '40'}`,
                      color: active ? '#fff' : c,
                      background: active ? c : c + '14',
                    }}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="trade-memo">매매 메모 / 회고</label>
            <textarea
              id="trade-memo"
              className="field-input"
              placeholder="이 매매에서 배운 점, 지킨 원칙, 아쉬운 점을 적어보세요"
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: 14,
                border: '1px solid rgba(0,0,0,.1)',
                borderRadius: 13,
                background: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: '#6b655b',
              }}
            >
              취소
            </button>
            <button className="btn-dark" onClick={onClose} style={{ flex: 2, padding: 14 }}>
              기록 저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
