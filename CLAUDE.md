# 매매노트 (daily-stock)

초보 투자자용 주식 매매일지 웹 앱. 매매 기록 + 성과·감정 회고.
`design-handoff/`의 디자인 핸드오프가 UI의 단일 출처(source of truth)입니다.

## 스택 & 명령어

- Vite + React 19 + TypeScript (strict), 상태관리는 useState/Context만 사용 (외부 상태 라이브러리 없음)
- 백엔드: Supabase BaaS (Postgres + Auth + PostgREST). 별도 서버 없음
- 인증: 카카오 OAuth (Supabase Auth)

```bash
npm run dev      # 개발 서버 http://localhost:5173
npm run build    # tsc -b 타입체크 + vite build (검증은 이걸로)
```

## 아키텍처

- `src/lib/supabase.ts` — 클라이언트 (env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `.env.local`)
- `src/lib/auth.tsx` — AuthProvider (카카오 로그인/세션)
- `src/lib/db.ts` — trades/profiles 조회·저장, DB row → `UiTrade` 매핑
- `src/lib/derive.ts` — **모든 화면 표시값은 trades에서 파생 계산** (승률·손익비·일별 손익·누적 자산·감정별/요일별 집계). 통계를 DB에 저장하지 않음
- `src/lib/trades.tsx` — TradesProvider (조회 + addTrade + derived 메모)
- `src/screens/` — 5개 화면 (dash/cal/journal/analysis/reflect), `src/components/` — 셸·모달·SVG 차트
- `supabase/migrations/0001_init.sql` — 스키마 (profiles·trades·RLS·가입 트리거·daily_pnl 뷰)

## 컨벤션

- **한국 주식 관례: 상승/수익 = 빨강(#f04438), 하락/손실 = 파랑(#2f6bed)** — 절대 반대로 쓰지 않기
- 디자인 토큰은 `src/index.css`의 CSS 변수. hex/px 값은 핸드오프(`design-handoff/*/README.md`) 기준 유지
- 감정 태그 6종(침착·자신감·불안·조급·욕심·후회) 색상은 `src/utils.ts` `EMO_COLORS`
- 숫자 표시: `tabular-nums`(`.num` 클래스), 천단위 콤마 `toLocaleString('en-US')`, 통화 KRW
- 청산가 null = 보유중(미실현) — 손익 집계에서 제외하고 UI에는 "보유중" 표시
- 스키마 변경은 `supabase/migrations/`에 새 파일 추가 (기존 파일 수정 금지), RLS 필수
