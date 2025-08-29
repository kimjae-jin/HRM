import React from "react";
import { getStickyTopForTh } from "../EngineerDetail";

export default function TrainingsTab({ rows = [], sectionBarH = 44 }) {
  const thTop = getStickyTopForTh();
  const fmt = (v) => v ?? "-";
  const fmtDate = (v) => {
    if (!v) return "-";
    if (typeof v === "string") {
      if (v.length >= 10 && (v.includes("T") || v.includes(" "))) return v.slice(0, 10);
      const cleaned = v.replace(/\.$/, "").replace(/\./g, "-");
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
    }
    return String(v);
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 2, height: sectionBarH,
        display: "flex", alignItems: "center",
        background: "var(--background-color,#111)",
        border: "1px solid var(--border-color,#333)",
        borderRadius: 8, padding: "0 12px", marginBottom: 8
      }}>
        <b>교육훈련</b><span style={{ opacity: .7, marginLeft: 8 }}>의무 주기/최종 이수일 관리</span>
      </div>

      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr>
              <th style={th(thTop)}>교육명</th>
              <th style={th(thTop)}>교육기관</th>
              <th style={th(thTop)}>교육일</th>
              <th style={th(thTop)}>주기(년)</th>
              <th style={th(thTop)}>비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: `calc(${sectionBarH}px/2) 16px 16px 16px`, opacity: .8 }}>교육 데이터 없음</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.id || i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                <td style={td}>{fmt(r.training_name || r.name)}</td>
                <td style={td}>{fmt(r.training_institution)}</td>
                <td style={td}>{fmtDate(r.training_date)}</td>
                <td style={{ ...td, textAlign: "right" }}>{r.required_cycle ?? "-"}</td>
                <td style={td}>{fmt(r.notes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = (top) => ({
  position: "sticky", top,
  background: "var(--background-color,#111)",
  textAlign: "left", padding: "8px 10px",
  borderBottom: "1px solid var(--border-color,#333)"
});
const td = { padding: "8px 10px" };
