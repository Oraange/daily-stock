import { useState } from 'react';
import type { CalMode, Screen } from './types';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import TradeModal from './components/TradeModal';
import Dashboard from './screens/Dashboard';
import CalendarScreen from './screens/CalendarScreen';
import Journal from './screens/Journal';
import Analysis from './screens/Analysis';
import Reflect from './screens/Reflect';

const KICKERS: Record<Screen, string> = {
  dash: 'HOME',
  cal: 'CALENDAR',
  journal: 'JOURNAL',
  analysis: 'ANALYTICS',
  reflect: 'REFLECTION',
};

const TITLES: Record<Screen, string> = {
  dash: '안녕하세요, 투자자님 👋',
  cal: '매매 캘린더',
  journal: '매매일지',
  analysis: '성과 분석',
  reflect: '감정 회고',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('dash');
  const [calMode, setCalMode] = useState<CalMode>('month');
  const [week, setWeek] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar screen={screen} onNavigate={setScreen} onOpenModal={() => setModalOpen(true)} />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header className="page-header">
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--coral)',
                letterSpacing: '.04em',
                marginBottom: 5,
              }}
            >
              {KICKERS[screen]}
            </div>
            <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: '-.03em' }}>
              {TITLES[screen]}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 15px',
                background: '#fff',
                border: '1px solid rgba(0,0,0,.06)',
                borderRadius: 11,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3aa17e' }} />
              2026년 7월
            </div>
            <div
              role="button"
              aria-label="알림"
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: '#fff',
                border: '1px solid rgba(0,0,0,.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                cursor: 'pointer',
              }}
            >
              🔔
            </div>
          </div>
        </header>

        <div className="content">
          {screen === 'dash' && <Dashboard onGoJournal={() => setScreen('journal')} />}
          {screen === 'cal' && (
            <CalendarScreen
              calMode={calMode}
              onChangeMode={setCalMode}
              week={week}
              onChangeWeek={setWeek}
            />
          )}
          {screen === 'journal' && <Journal />}
          {screen === 'analysis' && <Analysis />}
          {screen === 'reflect' && <Reflect />}
        </div>
      </main>

      <MobileNav screen={screen} onNavigate={setScreen} onOpenModal={() => setModalOpen(true)} />

      {modalOpen && <TradeModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
