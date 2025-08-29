import React from "react";
import { getStickyTopForTh } from "../EngineerDetail";

export default function CareersTab({ rows = [], sectionBarH = 44 }) {
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

  const header = [
    { key: "project_name", label: "공사(용역)명", width: 260 },
    { key: "client_name", label: "발주처", width: 160 },
    { key: "company", label: "소속회사", width: 140 },
    { key: "role_title", label: "직무", width: 120 },
    { key: "start_date", label: "시작", width: 110 },
    { key: "end_date", label: "종료", width: 110 },
    { key: "contract_amount", label: "금액(원)", width: 140, align: "right" },
    { key: "participation_rate", label: "참여율(%)", width: 110, align: "right" },
    { key: "verification_status", label: "상태", width: 120 },
  ];

  return (
    <div style={{ padding: 12 }}>
      {/* 섹션 타이틀 (sticky) */}
      <div style={{
        position: "sticky", top: 0, zIndex: 2, height: sectionBarH,
        display: "flex", alignItems: "center",
        background: "var(--background-color,#111)",
        border: "1px solid var(--border-color,#333)",
        borderRadius: 8, padding: "0 12px", marginBottom: 8
      }}>
        <b>기술경력</b><span style={{ opacity: .7, marginLeft: 8 }}>건기협 경력증명서 형식</span>
      </div>

      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr>
              {header.map(h => (
                <th key={h.key}
                    style={{
                      position: "sticky", top: thTop, zIndex: 1,
                      background: "var(--background-color,#111)",
                      textAlign: h.align || "left",
                      padding: "8px 10px",
                      borderBottom: "1px solid var(--border-color,#333)",
                      minWidth: h.width
                    }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={header.length} style={{ padding: `calc(${sectionBarH}px/2) 16px 16px 16px`, opacity: .8 }}>
                  경력 데이터가 없습니다.
                </td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={r.id || i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                <td style={{ padding: "8px 10px" }}>{fmt(r.project_name)}</td>
                <td style={{ padding: "8px 10px" }}>{fmt(r.client_name)}</td>
                <td style={{ padding: "8px 10px" }}>{fmt(r.company)}</td>
                <td style={{ padding: "8px 10px" }}>{fmt(r.role_title)}</td>
                <td style={{ padding: "8px 10px" }}>{fmtDate(r.start_date)}</td>
                <td style={{ padding: "8px 10px" }}>{fmtDate(r.end_date)}</td>
                <td style={{ padding: "8px 10px", textAlign: "right" }}>
                  {r.contract_amount != null ? Number(r.contract_amount).toLocaleString() : "-"}
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right" }}>{r.participation_rate ?? "-"}</td>
                <td style={{ padding: "8px 10px" }}>{r.verification_status ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
