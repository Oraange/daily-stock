-- 종목명 자동완성용 마스터 테이블
-- 공공데이터포털 "금융위원회_KRX상장종목정보"를 load-stocks Edge Function으로 적재

create table public.stocks (
  code       text primary key,              -- 단축코드 (6자리)
  name       text not null,                 -- 종목명
  market     text not null,                 -- KOSPI / KOSDAQ / KONEX
  updated_at timestamptz not null default now()
);

alter table public.stocks enable row level security;

-- 읽기는 로그인 사용자 전체 허용, 쓰기는 정책 없음 = service role(적재 함수)만 가능
create policy "stocks_select_authenticated" on public.stocks
  for select to authenticated using (true);
