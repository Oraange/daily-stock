import type { Screen } from '../types';

export const NAV_ITEMS: { id: Screen; label: string; icon: string }[] = [
  { id: 'dash', label: '대시보드', icon: '🏠' },
  { id: 'cal', label: '캘린더', icon: '📅' },
  { id: 'journal', label: '매매일지', icon: '📒' },
  { id: 'analysis', label: '성과분석', icon: '📊' },
  { id: 'reflect', label: '회고', icon: '🌱' },
];

interface Props {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  onOpenModal: () => void;
}

export default function Sidebar({ screen, onNavigate, onOpenModal }: Props) {
  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 8px 20px' }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'var(--coral-grad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 19,
            boxShadow: '0 6px 14px rgba(255,107,74,.32)',
          }}
        >
          매
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-.02em' }}>매매노트</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>
            나의 투자 회고
          </div>
        </div>
      </div>

      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={'nav-item' + (screen === item.id ? ' active' : '')}
          onClick={() => onNavigate(item.id)}
        >
          <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          className="btn-dark"
          onClick={onOpenModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 13,
          }}
        >
          <span style={{ fontSize: 16 }}>＋</span> 새 매매 기록
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 10,
            borderRadius: 12,
            background: 'var(--soft-2)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#ffe0d3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🐣
          </div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>투자자님</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>
              투자 시작 6개월차
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
