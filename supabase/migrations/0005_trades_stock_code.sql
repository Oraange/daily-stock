-- 종목 마스터 소프트 참조
-- FK 제약을 걸지 않음: 마스터에 없는 자산(미국 주식·비상장 등)도 이름만으로 기록 가능해야 하고,
-- 마스터 재적재/상장폐지 정리 시 과거 기록이 깨지지 않아야 함
alter table public.trades
  add column stock_code text;

comment on column public.trades.stock_code is
  'stocks.code 소프트 참조 — 자동완성에서 종목을 선택한 경우에만 채움, 직접 입력 시 null';
