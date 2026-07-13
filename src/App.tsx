import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { type CalMode, type Screen, type UiTrade } from "./types";
import { AuthProvider, useAuth } from "./lib/auth";
import { TradesProvider, useTrades } from "./lib/trades";
import { isSupabaseConfigured } from "./lib/supabase";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import TradeModal from "./components/TradeModal";
import Dashboard from "./screens/Dashboard";
import CalendarScreen from "./screens/CalendarScreen";
import Journal from "./screens/Journal";
import Analysis from "./screens/Analysis";
import Reflect from "./screens/Reflect";

const KICKERS: Record<Screen, string> = {
  dash: "HOME",
  cal: "CALENDAR",
  journal: "JOURNAL",
  analysis: "ANALYTICS",
  reflect: "REFLECTION",
};

export default function App() {
  return (
    <AuthProvider>
      <Gate />
      <Analytics />
    </AuthProvider>
  );
}

function Gate() {
  const { session } = useAuth();

  if (!isSupabaseConfigured) return <LoginScreen />;
  if (session === undefined) return <Splash />;
  if (!session) return <LoginScreen />;

  return (
    <TradesProvider>
      <Shell />
    </TradesProvider>
  );
}

function Splash() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink-3)",
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      매매노트를 여는 중…
    </div>
  );
}

function Shell() {
  const { session } = useAuth();
  const { derived, error } = useTrades();
  const [screen, setScreen] = useState<Screen>("dash");
  const [calMode, setCalMode] = useState<CalMode>("month");
  const [week, setWeek] = useState(0);
  const [modal, setModal] = useState<UiTrade | "new" | null>(null);

  const nickname =
    (session?.user.user_metadata.name as string | undefined) ??
    (session?.user.user_metadata.full_name as string | undefined) ??
    "투자자";

  const titles: Record<Screen, string> = {
    dash: `안녕하세요, ${nickname}님 👋`,
    cal: "매매 캘린더",
    journal: "매매일지",
    analysis: "성과 분석",
    reflect: "감정 회고",
  };

  return (
    <div className="app">
      <Sidebar
        screen={screen}
        onNavigate={setScreen}
        onOpenModal={() => setModal("new")}
      />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header className="page-header">
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--coral)",
                letterSpacing: ".04em",
                marginBottom: 5,
              }}
            >
              {KICKERS[screen]}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: "-.03em",
              }}
            >
              {titles[screen]}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 15px",
                background: "#fff",
                border: "1px solid rgba(0,0,0,.06)",
                borderRadius: 11,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3aa17e",
                }}
              />
              {derived.headerLabel}
            </div>
            <div
              role="button"
              aria-label="알림"
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: "#fff",
                border: "1px solid rgba(0,0,0,.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                cursor: "pointer",
              }}
            >
              🔔
            </div>
          </div>
        </header>

        <div className="content">
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                borderRadius: 12,
                background: "var(--up-bg)",
                color: "var(--up)",
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              데이터를 불러오지 못했어요: {error}
              <br />
              Supabase에 스키마 마이그레이션(supabase/migrations)이 적용됐는지
              확인해주세요.
            </div>
          )}
          {screen === "dash" && (
            <Dashboard onGoJournal={() => setScreen("journal")} />
          )}
          {screen === "cal" && (
            <CalendarScreen
              calMode={calMode}
              onChangeMode={setCalMode}
              week={week}
              onChangeWeek={setWeek}
            />
          )}
          {screen === "journal" && <Journal onEdit={setModal} />}
          {screen === "analysis" && <Analysis />}
          {screen === "reflect" && <Reflect />}
        </div>
      </main>

      <MobileNav
        screen={screen}
        onNavigate={setScreen}
        onOpenModal={() => setModal("new")}
      />

      {modal && (
        <TradeModal
          key={modal === "new" ? "new" : modal.id}
          editTarget={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
