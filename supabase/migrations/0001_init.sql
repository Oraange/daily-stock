-- 매매노트 초기 스키마

-- ---- profiles: 사용자 프로필 (초기 자본 = 총 자산 계산의 기준점) ----
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  initial_capital numeric(16, 2) not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 가입 시 프로필 자동 생성
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- trades: 매매 기록 (모든 화면의 파생 계산 원천 데이터) ----

create table public.trades (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,                                   -- 종목명
  side        text not null check (side in ('매수', '매도')),   -- 구분
  qty         integer not null check (qty > 0),                -- 수량
  buy_price   numeric(14, 2) not null check (buy_price >= 0),  -- 매수가(평단)
  sell_price  numeric(14, 2) check (sell_price >= 0),          -- 청산가 (미청산 시 null)
  emotion     text not null check (emotion in ('침착', '자신감', '불안', '조급', '욕심', '후회')),
  memo        text not null default '',                        -- 매매 메모 / 회고
  traded_at   date not null default current_date,              -- 거래일
  created_at  timestamptz not null default now()
);

comment on table public.trades is '매매 기록. 손익/수익률/승률 등은 여기서 파생 계산';

-- 손익/수익률은 저장하지 않고 생성 컬럼으로 파생 (청산 전이면 null)
alter table public.trades
  add column pnl numeric generated always as
    (case when sell_price is not null then (sell_price - buy_price) * qty end) stored;

create index trades_user_traded_at_idx on public.trades (user_id, traded_at desc);

-- ---- RLS: 본인 기록만 읽기/쓰기 가능 ----
alter table public.trades enable row level security;

create policy "trades_select_own" on public.trades
  for select using (auth.uid() = user_id);

create policy "trades_insert_own" on public.trades
  for insert with check (auth.uid() = user_id);

create policy "trades_update_own" on public.trades
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "trades_delete_own" on public.trades
  for delete using (auth.uid() = user_id);

-- ---- 일별 손익/거래수 집계 뷰 (캘린더·대시보드용) ----
-- 뷰는 기반 테이블의 RLS를 그대로 따름 (security_invoker)
create view public.daily_pnl
  with (security_invoker = true) as
select
  user_id,
  traded_at,
  count(*)                          as trade_count,
  sum(pnl)                          as pnl,
  sum(case when pnl > 0 then 1 else 0 end) as win_count
from public.trades
where pnl is not null
group by user_id, traded_at;
