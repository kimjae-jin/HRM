import React from "react";

export default function OverlapTab({ data = [] }) {
  return (
    <section className="card" style={{ padding: 0 }}>
      <div style={{
        position:"sticky", top: 0, zIndex:3,
        background:"var(--background-color)",
        borderBottom:"1px solid var(--border)",
        padding:"10px 12px", fontWeight:800
      }}>
        업무 중첩도
      </div>

      <div style={{ maxHeight:"50dvh", overflow:"auto", padding:12 }}>
        <table>
          <thead>
            <tr>
              <th>기간</th>
              <th>프로젝트</th>
              <th>역할</th>
              <th style={{textAlign:"right"}}>중첩도(%)</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (<tr><td colSpan={5} style={{padding:12}}>업무 중첩 정보가 없습니다.</td></tr>)}
            {data.map(r => (
              <tr key={r.id}>
                <td>{(r.start_date || "-") + " ~ " + (r.end_date || "-")}</td>
                <td>{r.project_name || "-"}</td>
                <td>{r.role_title || "-"}</td>
                <td style={{textAlign:"right"}}>{r.overlap_rate ?? "-"}</td>
                <td>{r.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
