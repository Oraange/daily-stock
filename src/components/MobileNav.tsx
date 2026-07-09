import type { Screen } from '../types';
import { NAV_ITEMS } from './Sidebar';

interface Props {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  onOpenModal: () => void;
}

/** 좁은 화면 전용 하단 탭바 — 탭 5개 균등 배치, 가운데 FAB는 물방울 마운드 위에 */
export default function MobileNav({ screen, onNavigate, onOpenModal }: Props) {
  return (
    <nav className="mobile-nav">
      {/* footer 표면이 FAB를 감싸며 솟아오르는 마운드 (fill과 윤곽선을 분리해
          아래 닫는 변의 선이 탭바 안쪽에 그려지지 않게 함) */}
      <svg className="nav-bump" width="150" height="48" viewBox="0 0 150 48" aria-hidden="true">
        <path className="nav-bump-fill" d="M0 48 C44 48 40 3 75 3 C110 3 106 48 150 48 Z" />
        <path className="nav-bump-line" d="M0 47.5 C44 47.5 40 2.5 75 2.5 C110 2.5 106 47.5 150 47.5" />
      </svg>
      <button className="fab" aria-label="새 매매 기록" onClick={onOpenModal}>
        ＋
      </button>
      {NAV_ITEMS.map((item) => (
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
