import { useEffect, useMemo, useState } from "react";
import type { Emotion, Side, UiTrade } from "../types";
import { DOWN, DOWN_BG, UP, UP_BG, emoColor } from "../utils";
import { useTrades } from "../lib/trades";
import { fetchAllStocks } from "../lib/db";
import type { StockHit } from "../lib/db";
import { filterStocks } from "../lib/stockSearch";

const EMO_OPTIONS: Emotion[] = [
  "침착",
  "자신감",
  "불안",
  "조급",
  "욕심",
  "후회",
];

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

interface Props {
  onClose: () => void;
  editTarget?: UiTrade;
}

export default function TradeModal({ onClose, editTarget }: Props) {
  const { addTrade, editTrade } = useTrades();

  const [name, setName] = useState(editTarget?.name ?? "");
  const [stockCode, setStockCode] = useState<string | null>(
    editTarget?.stockCode ?? null,
  );
  const [side, setSide] = useState<Side>(editTarget?.side ?? "매수");
  const [qty, setQty] = useState(editTarget ? String(editTarget.qty) : "");
  const [buyPrice, setBuyPrice] = useState(
    editTarget ? String(editTarget.buyPrice) : "",
  );
  const [sellPrice, setSellPrice] = useState(
    editTarget?.sellPrice != null ? String(editTarget.sellPrice) : "",
  );
  const [tradedAt, setTradedAt] = useState(editTarget?.tradedAt ?? todayIso());
  const [emotion, setEmotion] = useState<Emotion>(
    editTarget?.emotion ?? "침착",
  );
  const [memo, setMemo] = useState(editTarget?.memo ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 종목명 자동완성 — 전체 목록을 1회 로드해 메모리에서 즉시 매칭 (초성·공백 무시 지원)
  const [allStocks, setAllStocks] = useState<StockHit[]>([]);
  const [showHits, setShowHits] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1); // 키보드로 선택 중인 항목

  useEffect(() => {
    fetchAllStocks().then(setAllStocks).catch(() => {});
  }, []);

  const hits = useMemo(
    () => (showHits ? filterStocks(allStocks, name) : []),
    [allStocks, name, showHits],
  );

  useEffect(() => setActiveIdx(-1), [name]); // 검색어가 바뀌면 하이라이트 초기화

  useEffect(() => {
    if (activeIdx >= 0)
      document
        .getElementById(`stock-opt-${activeIdx}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const pickStock = (s: StockHit) => {
    setName(s.name);
    setStockCode(s.code); // 마스터에서 선택 → 소프트 참조 저장
    setShowHits(false);
  };

  const onNameKeyDown = (e: React.KeyboardEvent) => {
    if (!showHits || hits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      pickStock(hits[activeIdx]);
    } else if (e.key === "Escape") {
      setShowHits(false);
    }
  };

  const onSave = async () => {
    const qtyN = Number(qty);
    const buyN = Number(buyPrice);
    const sellN = sellPrice.trim() === "" ? null : Number(sellPrice);

    if (!name.trim()) return setError("종목명을 입력해주세요.");
    if (!Number.isFinite(qtyN) || qtyN <= 0)
      return setError("수량을 올바르게 입력해주세요.");
    if (!Number.isFinite(buyN) || buyN <= 0)
      return setError("매수가를 올바르게 입력해주세요.");
    if (sellN != null && (!Number.isFinite(sellN) || sellN < 0))
      return setError("청산가를 올바르게 입력해주세요.");
    if (!tradedAt) return setError("거래일을 선택해주세요.");

    try {
      setBusy(true);
      setError(null);
      const payload = {
        name: name.trim(),
        side,
        qty: Math.floor(qtyN),
        buy_price: buyN,
        sell_price: sellN,
        emotion,
        memo: memo.trim(),
        traded_at: tradedAt,
        stock_code: stockCode,
      };
      editTarget ? await editTrade(payload, editTarget.id) : await addTrade(payload);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "저장에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
      setBusy(false);
    }
  };

  const sideBtn = (s: Side): React.CSSProperties => {
    const active = side === s;
    const color = s === "매수" ? UP : DOWN;
    const bg = s === "매수" ? UP_BG : DOWN_BG;
    return {
      flex: 1,
      padding: 12,
      border: `1.5px solid ${active ? color : "rgba(0,0,0,.1)"}`,
      borderRadius: 11,
      background: active ? bg : "#fff",
      color: active ? color : "var(--ink-2)",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: 13.5,
    };
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,25,21,.42)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        animation: "floatIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="새 매매 기록"
        style={{
          width: "min(520px,92vw)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 24,
          padding: "28px 30px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div
            style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em" }}
          >
            {editTarget ? "매매 기록 수정" : "새 매매 기록"}
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "none",
              background: "#f2efe9",
              cursor: "pointer",
              fontSize: 17,
              color: "var(--ink-2)",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="field-label" htmlFor="trade-name">
              종목명
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="trade-name"
                className="field-input"
                placeholder="예) 삼성전자"
                value={name}
                autoComplete="off"
                onChange={(e) => {
                  setName(e.target.value);
                  setStockCode(null); // 직접 수정하면 선택했던 종목과 달라지므로 참조 해제
                  setShowHits(true);
                }}
                onKeyDown={onNameKeyDown}
                onBlur={() => setShowHits(false)}
                role="combobox"
                aria-expanded={showHits && hits.length > 0}
                aria-controls="stock-listbox"
              />
              {showHits && hits.length > 0 && (
                <ul
                  id="stock-listbox"
                  role="listbox"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    margin: 0,
                    padding: 6,
                    listStyle: "none",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,.08)",
                    borderRadius: 12,
                    boxShadow: "0 12px 28px rgba(0,0,0,.14)",
                    maxHeight: 236,
                    overflowY: "auto",
                  }}
                >
                  {hits.map((s, i) => (
                    <li key={s.code} role="option" aria-selected={i === activeIdx}>
                      <button
                        type="button"
                        id={`stock-opt-${i}`}
                        className="stock-option"
                        style={{
                          background: i === activeIdx ? "var(--soft-2)" : undefined,
                        }}
                        onMouseEnter={() => setActiveIdx(i)}
                        // onBlur(드롭다운 닫힘)보다 먼저 실행되도록 onMouseDown 사용
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickStock(s);
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{s.name}</span>
                        <span
                          className="num"
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "var(--ink-3)",
                          }}
                        >
                          {s.code} · {s.market}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <span className="field-label">구분</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={sideBtn("매수")} onClick={() => setSide("매수")}>
                  매수
                </button>
                <button style={sideBtn("매도")} onClick={() => setSide("매도")}>
                  매도
                </button>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="trade-qty">
                수량
              </label>
              <input
                id="trade-qty"
                className="field-input"
                placeholder="0"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label className="field-label" htmlFor="trade-buy">
                매수가
              </label>
              <input
                id="trade-buy"
                className="field-input"
                placeholder="₩0"
                inputMode="numeric"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="trade-sell">
                청산가 (보유 중이면 비워두세요)
              </label>
              <input
                id="trade-sell"
                className="field-input"
                placeholder="₩0"
                inputMode="numeric"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="trade-date">
              거래일
            </label>
            <input
              id="trade-date"
              type="date"
              className="field-input"
              value={tradedAt}
              onChange={(e) => setTradedAt(e.target.value)}
            />
          </div>

          <div>
            <span className="field-label" style={{ marginBottom: 9 }}>
              그때의 감정
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EMO_OPTIONS.map((e) => {
                const c = emoColor(e);
                const active = emotion === e;
                return (
                  <button
                    key={e}
                    onClick={() => setEmotion(e)}
                    style={{
                      padding: "9px 15px",
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      border: `1.5px solid ${active ? c : c + "40"}`,
                      color: active ? "#fff" : c,
                      background: active ? c : c + "14",
                    }}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="trade-memo">
              매매 메모 / 회고
            </label>
            <textarea
              id="trade-memo"
              className="field-input"
              placeholder="이 매매에서 배운 점, 지킨 원칙, 아쉬운 점을 적어보세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 11,
                background: "var(--up-bg)",
                color: "var(--up)",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              disabled={busy}
              style={{
                flex: 1,
                padding: 14,
                border: "1px solid rgba(0,0,0,.1)",
                borderRadius: 13,
                background: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                color: "#6b655b",
              }}
            >
              취소
            </button>
            <button
              className="btn-dark"
              onClick={() => void onSave()}
              disabled={busy}
              style={{ flex: 2, padding: 14, opacity: busy ? 0.7 : 1 }}
            >
              {busy ? "저장 중…" : "기록 저장하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
