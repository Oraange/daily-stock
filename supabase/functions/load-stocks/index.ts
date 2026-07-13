// KRX 상장종목 + ETF/ETN 목록을 public.stocks에 적재하는 관리용 함수
// 호출: GET /functions/v1/load-stocks?key=<공공데이터포털 서비스 키>
// (Authorization: Bearer <anon key> 필요 — verify_jwt 활성)
import { createClient } from "jsr:@supabase/supabase-js@2";

const LISTED =
  "https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo";
const PRODUCT =
  "https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService";

interface ApiItem {
  srtnCd: string; // 단축코드
  itmsNm: string; // 종목명
  mrktCtg?: string; // 상장종목 API만: KOSPI / KOSDAQ / KONEX
}

type Row = { code: string; name: string; market: string };

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  const serviceKey = new URL(req.url).searchParams.get("key");
  if (!serviceKey) return json({ error: "key 파라미터가 필요합니다" }, 400);

  const fetchBody = async (
    endpoint: string,
    basDt: string,
    pageNo: number,
    numOfRows: number,
  ) => {
    const url = `${endpoint}?serviceKey=${serviceKey}&resultType=json&basDt=${basDt}&pageNo=${pageNo}&numOfRows=${numOfRows}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`공공 API HTTP ${res.status}`);
    const text = await res.text();
    let parsed: { response?: { body?: unknown } };
    try {
      parsed = JSON.parse(text);
    } catch {
      // 미신청/키 오류 시 XML 에러가 내려옴
      throw new Error(`JSON 아닌 응답: ${text.slice(0, 200)}`);
    }
    const body = parsed?.response?.body as
      | { totalCount?: number; items?: { item?: ApiItem[] } }
      | undefined;
    if (body == null) throw new Error(`예상 밖 응답: ${text.slice(0, 200)}`);
    return body;
  };

  const collect = async (
    endpoint: string,
    basDt: string,
    market: string | null, // null이면 응답의 mrktCtg 사용
    out: Map<string, Row>,
  ) => {
    const pageSize = 1000;
    let added = 0;
    for (let page = 1; page <= 10; page++) {
      const body = await fetchBody(endpoint, basDt, page, pageSize);
      const items = body.items?.item ?? [];
      for (const it of items) {
        const code = (it.srtnCd ?? "").replace(/^A/, "").trim();
        if (code && it.itmsNm) {
          out.set(code, {
            code,
            name: it.itmsNm.trim(),
            market: market ?? it.mrktCtg ?? "",
          });
          added++;
        }
      }
      if (items.length < pageSize) break;
    }
    return added;
  };

  // 기준일자(basDt)는 영업일에만 존재 — 오늘부터 최대 10일 역추적
  let basDt = "";
  for (let i = 0; i < 10 && !basDt; i++) {
    const ymd = new Date(Date.now() - i * 86_400_000)
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");
    const body = await fetchBody(LISTED, ymd, 1, 1);
    if (Number(body.totalCount ?? 0) > 0) basDt = ymd;
  }
  if (!basDt) return json({ error: "최근 10일 내 기준일자 데이터 없음" }, 502);

  const rows = new Map<string, Row>();
  const counts: Record<string, number> = {};
  const warnings: string[] = [];

  counts.LISTED = await collect(LISTED, basDt, null, rows);

  // ETF/ETN은 실패해도 상장종목 적재는 유지 (활용 신청 전이면 경고로만 보고)
  for (const [op, market] of [
    ["getETFPriceInfo", "ETF"],
    ["getETNPriceInfo", "ETN"],
  ] as const) {
    try {
      counts[market] = await collect(`${PRODUCT}/${op}`, basDt, market, rows);
    } catch (e) {
      warnings.push(`${market} 적재 실패: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const list = [...rows.values()].map((r) => ({
    ...r,
    updated_at: new Date().toISOString(),
  }));
  for (let i = 0; i < list.length; i += 500) {
    const { error } = await supabase
      .from("stocks")
      .upsert(list.slice(i, i + 500), { onConflict: "code" });
    if (error) return json({ error: error.message }, 500);
  }

  return json({ basDt, total: list.length, counts, warnings });
});
