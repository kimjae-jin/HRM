import React from "react";

export default function PerformanceTab({ data = [] }) {
  return (
    <section className="card" style={{ padding: 0 }}>
      <div style={{
        position:"sticky", top: 0, zIndex:3,
        background:"var(--background-color)",
        borderBottom:"1px solid var(--border)",
        padding:"10px 12px", fontWeight:800
      }}>
        실적 (건기협 경력증명서 기준)
      </div>

      <div style={{ maxHeight:"50dvh", overflow:"auto", padding:12 }}>
        <table>
          <thead>
            <tr>
              <th>공사명</th>
              <th>발주처</th>
              <th>역할</th>
              <th>기간</th>
              <th style={{textAlign:"right"}}>금액(원)</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (<tr><td colSpan={6} style={{padding:12}}>실적 정보가 없습니다.</td></tr>)}
            {data.map(r => (
              <tr key={r.id}>
                <td>{r.project_name || "-"}</td>
                <td>{r.client_name || "-"}</td>
                <td>{r.role_title || "-"}</td>
                <td>{(r.start_date || "-") + " ~ " + (r.end_date || "-")}</td>
                <td style={{textAlign:"right"}}>{r.amount?.toLocaleString?.() || "-"}</td>
                <td>{r.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
