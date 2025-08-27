import React from "react";

export default function Sidebar({ open, onClose, onNavigate, activeKey = "dashboard" }) {
  const items = [
    { key: "dashboard",  label: "대시보드" },
    { key: "engineers",  label: "기술인" },
    { key: "trainings",  label: "교육훈련" },
    { key: "licenses",   label: "업/면허" },
    { key: "billing",    label: "청구/재무" },
    { key: "affiliates", label: "관계사" },
    { key: "tax",        label: "세금계산서" },
    { key: "pq",         label: "PQ" },
    { key: "weekly",     label: "주간회의" },
    { key: "bids",       label: "입찰" },
  ];

  return (
    <aside
      className={`sidebar ${open ? "open" : ""}`}
      style={{
        width: 220,
        borderRight: "1px solid var(--border)",
        background: "var(--background-color)",
        position: "sticky",
        top: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 12px", borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ fontWeight: 700 }}>메뉴</div>
        <button className="link" onClick={onClose} style={{ fontSize: 12, opacity: 0.8 }} title="사이드바 닫기">
          닫기
        </button>
      </div>

      <nav aria-label="주 메뉴" style={{ padding: "8px 4px", overflowY: "auto" }}>
        {items.map((it) => {
          const active = activeKey === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onNavigate?.(it.key)}
              className="link"
              style={{
                width: "100%", textAlign: "left", padding: "8px 12px", margin: "2px 4px",
                borderRadius: 8, background: active ? "var(--bg-elev)" : "transparent",
                border: active ? "1px solid var(--border)" : "1px solid transparent",
                fontWeight: active ? 700 : 500, outline: "none", cursor: "pointer",
              }}
            >
              {it.label}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: 8, fontSize: 11, color: "var(--muted)" }} />
    </aside>
  );
}
