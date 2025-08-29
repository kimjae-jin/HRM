import React, { useMemo } from "react";
import { getStickyTopForTh } from "../EngineerDetail";

/**
 * 실적: 서버에서 performances 제공 시 rows 사용.
 * 없으면 careers를 요약하여 보여줍니다.
 */
export default function PerformanceTab({ rows = [], careers = [], sectionBarH = 44 }) {
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

  const data = rows.length > 0 ? rows : careers.map(c => ({
    project_name: c.project_name,
    role_title: c.role_title,
    start_date: c.start_date,
    end_date: c.end_date,
    contribution: c.participation_rate,
    notes: c.verification_status
  }));

  return (
    <div style={{ padding: 12 }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 2, height: sectionBarH,
        display: "flex", alignItems: "center",
        background: "var(--background-color,#111)",
        border: "1px solid var(--border-color,#333)",
        borderRadius: 8, padding: "0 12px", marginBottom: 8
      }}>
        <b>실적</b><span style={{ opacity: .7, marginLeft: 8 }}>프로젝트 참여 기반 요약</span>
      </div>

      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr>
              <th style={th(thTop)}>프로젝트</th>
              <th style={th(thTop)}>역할</th>
              <th style={th(thTop)}>시작</th>
              <th style={th(thTop)}>종료</th>
              <th style={th(thTop)}>기여도(%)</th>
              <th style={th(thTop)}>비고</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: `calc(${sectionBarH}px/2) 16px 16px 16px`, opacity: .8 }}>실적 데이터가 없습니다.</td></tr>
            ) : data.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                <td style={td}>{fmt(r.project_name)}</td>
                <td style={td}>{fmt(r.role_title)}</td>
                <td style={td}>{fmtDate(r.start_date)}</td>
                <td style={td}>{fmtDate(r.end_date)}</td>
                <td style={{ ...td, textAlign: "right" }}>{r.contribution ?? "-"}</td>
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
