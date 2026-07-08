# 매매노트 📒

초보 투자자를 위한 주식 매매일지 웹 서비스입니다. 매매를 기록하고 성과와 **감정**을 함께 회고할 수 있습니다.

디자인 핸드오프(`design-handoff/`)를 기반으로 **Vite + React 19 + TypeScript**로 구현했습니다.

## 화면 구성

| 화면 | 설명 |
|---|---|
| 대시보드 | 총 자산·손익 KPI, 자산 추이 차트, 승률 도넛, 최근 매매 |
| 캘린더 | **월간 손익 캘린더 ↔ 주간 자산추이 꺾은선 토글** (핵심 기능), 주 이동 |
| 매매일지 | 전체/수익/손실/매수/매도 필터, 매매 기록 테이블 |
| 성과 분석 | 승률·손익비 등 스탯, 감정별 승률, 요일별 손익 |
| 회고 | 주간 회고 하이라이트, 매매별 감정·메모 카드 |

사이드바의 **＋ 새 매매 기록** 버튼으로 종목·구분·가격·감정·메모 입력 모달을 열 수 있습니다.

## 디자인 특징

- 따뜻하고 친근한 핀테크 톤 — 코랄빛 크림 배경(`#fcf1ea`) + 브랜드 코랄 그라디언트
- 한국 주식 관례: **상승/수익 빨강(`#f04438`) · 하락/손실 파랑(`#2f6bed`)**
- 감정 태그 6종(침착·자신감·불안·조급·욕심·후회) 색상 시스템
- 폰트: [Pretendard](https://github.com/orioncactus/pretendard)
- 반응형: 880px 이하에서 사이드바 → 하단 탭바 전환

## 백엔드 (Supabase)

백엔드는 별도 서버 없이 **Supabase**(Postgres + Auth + 자동 API)를 사용합니다.

- 인증: **카카오 OAuth** (Supabase Auth)
- 데이터: `trades` 테이블 하나가 원천 — 손익은 생성 컬럼, 승률·손익비·일별 손익·감정별/요일별 집계는 클라이언트에서 파생 계산
- 보안: 모든 테이블에 **RLS** 적용 (`auth.uid() = user_id`)
- 스키마: [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)

### 초기 설정

1. Supabase 프로젝트 생성 후 SQL Editor에서 `supabase/migrations/0001_init.sql` 실행
2. [카카오 개발자 콘솔](https://developers.kakao.com)에서 앱 생성 → 카카오 로그인 활성화 →
   Redirect URI에 `https://<project-ref>.supabase.co/auth/v1/callback` 등록
3. Supabase 대시보드 → Authentication → Providers → Kakao 활성화 (REST API 키 + Client Secret 입력)
4. `.env.example`을 `.env.local`로 복사하고 프로젝트 URL과 anon key 입력

## 실행 방법

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 프로젝트 구조

```
src/
├── App.tsx                  # 앱 셸 (사이드바 + 헤더 + 화면 전환)
├── types.ts                 # Screen / Trade / DayCell 등 타입
├── data.ts                  # 샘플 데이터 (2026-07 시드 생성)
├── utils.ts                 # 통화 포맷, 감정/손익 색상 유틸
├── components/
│   ├── Sidebar.tsx          # 데스크톱 사이드바
│   ├── MobileNav.tsx        # 모바일 하단 탭바
│   ├── TradeModal.tsx       # 새 매매 기록 모달
│   └── charts.tsx           # SVG 차트 (자산추이·도넛·주간 꺾은선·요일별 막대)
└── screens/                 # 5개 화면
```

> 현재 데이터는 디자인 프로토타입과 동일한 정적 샘플입니다. 실제 서비스에서는 매매 기록 목록에서 일별 손익·누적 자산·승률 등을 파생 계산하도록 확장할 수 있습니다.
