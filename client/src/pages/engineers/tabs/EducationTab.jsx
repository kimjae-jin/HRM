import React from "react";
import { getStickyTopForTh } from "../EngineerDetail";

export default function EducationTab({ rows = [], sectionBarH = 44 }) {
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
        <b>학력</b><span style={{ opacity: .7, marginLeft: 8 }}>최종 학력 및 전공</span>
      </div>

      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr>
              <th style={th(thTop)}>학교</th>
              <th style={th(thTop)}>전공</th>
              <th style={th(thTop)}>학위</th>
              <th style={th(thTop)}>입학일</th>
              <th style={th(thTop)}>졸업일</th>
              <th style={th(thTop)}>비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: `calc(${sectionBarH}px/2) 16px 16px 16px`, opacity: .8 }}>학력 데이터가 없습니다.</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.id || i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                <td style={td}>{fmt(r.school_name)}</td>
                <td style={td}>{fmt(r.major)}</td>
                <td style={td}>{fmt(r.degree)}</td>
                <td style={td}>{fmtDate(r.start_date)}</td>
                <td style={td}>{fmtDate(r.end_date)}</td>
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
