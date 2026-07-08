import type { Screen } from '../types';
import { NAV_ITEMS } from './Sidebar';

interface Props {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  onOpenModal: () => void;
}

/** 좁은 화면 전용 하단 탭바 (핸드오프 반응형 권장안) */
export default function MobileNav({ screen, onNavigate, onOpenModal }: Props) {
  const left = NAV_ITEMS.slice(0, 3);
  const right = NAV_ITEMS.slice(3);
  return (
    <nav className="mobile-nav">
      {left.map((item) => (
        <button
          key={item.id}
          className={screen === item.id ? 'active' : ''}
          onClick={() => onNavigate(item.id)}
        >
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
      <button className="fab" aria-label="새 매매 기록" onClick={onOpenModal}>
        ＋
      </button>
      {right.map((item) => (
        <button
          key={item.id}
          className={screen === item.id ? 'active' : ''}
          onClick={() => onNavigate(item.id)}
        >
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
