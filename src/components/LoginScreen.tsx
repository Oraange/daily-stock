import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

export default function LoginScreen() {
  const { signInWithKakao } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onKakao = async () => {
    try {
      setBusy(true);
      setError(null);
      await signInWithKakao();
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했어요. 잠시 후 다시 시도해주세요.');
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="screen"
        style={{
          width: 'min(400px, 100%)',
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '40px 36px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--coral-grad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 27,
            boxShadow: '0 6px 14px rgba(255,107,74,.32)',
            margin: '0 auto 18px',
          }}
        >
          매
        </div>
        <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-.02em' }}>매매노트</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 6 }}>
          매매를 기록하고, 성과와 감정을 함께 회고해요
        </div>

        {isSupabaseConfigured ? (
          <>
            <button
              onClick={onKakao}
              disabled={busy}
              style={{
                width: '100%',
                marginTop: 28,
                padding: '14px 16px',
                border: 'none',
                borderRadius: 13,
                background: '#fee500',
                color: 'rgba(0,0,0,.85)',
                fontWeight: 700,
                fontSize: 14.5,
                cursor: busy ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: busy ? 0.7 : 1,
              }}
            >
              <span style={{ fontSize: 17 }}>💬</span> 카카오로 시작하기
            </button>
            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 11,
                  background: 'var(--up-bg)',
                  color: 'var(--up)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              marginTop: 24,
              padding: '14px 16px',
              borderRadius: 12,
              background: 'var(--soft-1)',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--ink-2)',
              textAlign: 'left',
              lineHeight: 1.7,
            }}
          >
            Supabase 환경 변수가 아직 설정되지 않았어요.
            <br />
            프로젝트 루트에 <code>.env.local</code>을 만들고
            <br />
            <code>VITE_SUPABASE_URL</code>과 <code>VITE_SUPABASE_ANON_KEY</code>를 채운 뒤 다시
            실행해주세요. (<code>.env.example</code> 참고)
          </div>
        )}
      </div>
    </div>
  );
}
