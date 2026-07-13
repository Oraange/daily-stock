import { supabase } from "./supabase";
import type { Emotion, Side, UiTrade } from "../types";

/** trades 테이블 row (pnl은 DB 생성 컬럼) */
export interface TradeRow {
  id: string;
  user_id: string;
  name: string;
  side: Side;
  qty: number;
  buy_price: number;
  sell_price: number | null;
  emotion: Emotion;
  memo: string;
  traded_at: string; // 'YYYY-MM-DD'
  pnl: number | null;
  created_at: string;
}

export interface NewTrade {
  name: string;
  side: Side;
  qty: number;
  buy_price: number;
  sell_price: number | null;
  emotion: Emotion;
  memo: string;
  traded_at: string;
}

const price = (n: number | null) =>
  n == null ? "—" : Math.round(n).toLocaleString("en-US");

export function toUiTrade(r: TradeRow): UiTrade {
  const ret =
    r.sell_price != null && r.buy_price > 0
      ? ((r.sell_price - r.buy_price) / r.buy_price) * 100
      : null;
  return {
    id: r.id,
    name: r.name,
    tradedAt: r.traded_at,
    date: r.traded_at.slice(5).replace("-", "."),
    side: r.side,
    qty: r.qty,
    buyPrice: r.buy_price,
    sellPrice: r.sell_price,
    buy: price(r.buy_price),
    sell: price(r.sell_price),
    pnl: r.pnl,
    ret,
    up: (r.pnl ?? 0) >= 0,
    emotion: r.emotion,
    memo: r.memo,
  };
}

export async function fetchTrades(): Promise<UiTrade[]> {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .order("traded_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TradeRow[]).map(toUiTrade);
}

export async function insertTrade(input: NewTrade): Promise<void> {
  const { error } = await supabase.from("trades").insert(input);
  if (error) throw error;
}

export async function updateTrade(input: NewTrade, id: String): Promise<void> {
  const { error } = await supabase.from("trades").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteTrade(id: String): Promise<void> {
  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchInitialCapital(): Promise<number> {
  const { data, error } = await supabase
    .from("profiles")
    .select("initial_capital")
    .single();
  if (error) return 0;
  return Number(data.initial_capital) || 0;
}
