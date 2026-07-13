// KRX 상장종목 목록을 public.stocks에 적재하는 관리용 함수
// 호출: GET /functions/v1/load-stocks?key=<공공데이터포털 서비스 키>
// (Authorization: Bearer <anon key> 필요 — verify_jwt 활성)
import { createClient } from "jsr:@supabase/supabase-js@2";

const BASE =
  "https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo";

interface KrxItem {
  srtnCd: string; // 단축코드
  itmsNm: string; // 종목명
  mrktCtg: string; // KOSPI / KOSDAQ / KONEX
}

Deno.serve(async (req: Request) => {
  const serviceKey = new URL(req.url).searchParams.get("key");
  if (!serviceKey) {
    return new Response(JSON.stringify({ error: "key 파라미터가 필요합니다" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fetchPage = async (basDt: string, pageNo: number, numOfRows: number) => {
    const url = `${BASE}?serviceKey=${serviceKey}&resultType=json&basDt=${basDt}&pageNo=${pageNo}&numOfRows=${numOfRows}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`공공 API HTTP ${res.status}`);
    const json = await res.json();
    const body = json?.response?.body;
    if (body == null) throw new Error(`예상 밖 응답: ${JSON.stringify(json).slice(0, 300)}`);
    return {
      total: Number(body.totalCount ?? 0),
      items: (body.items?.item ?? []) as KrxItem[],
    };
  };

  // 기준일자(basDt)는 영업일에만 존재 — 오늘부터 최대 10일 역추적
  let basDt = "";
  let total = 0;
  for (let i = 0; i < 10 && !basDt; i++) {
    const ymd = new Date(Date.now() - i * 86_400_000)
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");
    const { total: t } = await fetchPage(ymd, 1, 1);
    if (t > 0) {
      basDt = ymd;
      total = t;
    }
  }
  if (!basDt) {
    return new Response(JSON.stringify({ error: "최근 10일 내 기준일자 데이터 없음" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = new Map<string, { code: string; name: string; market: string }>();
  const pageSize = 1000;
  for (let page = 1; rows.size < total && page <= 10; page++) {
    const { items } = await fetchPage(basDt, page, pageSize);
    for (const it of items) {
      const code = (it.srtnCd ?? "").replace(/^A/, "").trim();
      if (code && it.itmsNm) {
        rows.set(code, { code, name: it.itmsNm.trim(), market: it.mrktCtg ?? "" });
      }
    }
    if (items.length < pageSize) break;
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const list = [...rows.values()].map((r) => ({ ...r, updated_at: new Date().toISOString() }));
  for (let i = 0; i < list.length; i += 500) {
    const { error } = await supabase
      .from("stocks")
      .upsert(list.slice(i, i + 500), { onConflict: "code" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ basDt, count: list.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
