import React from "react";

export default function CareersTab({ data = [] }) {
  return (
    <section className="card" style={{ padding: 0 }}>
      {/* 헤더(고정) */}
      <div style={{
        position:"sticky", top: 0, zIndex:3,
        background:"var(--background-color)",
        borderBottom:"1px solid var(--border)",
        padding:"10px 12px", fontWeight:800
      }}>
        기술경력 (건기협 경력증명서 양식 기준)
      </div>

      {/* 표 컨테이너(스크롤) */}
      <div style={{ maxHeight:"50dvh", overflow:"auto", padding:12 }}>
        <table>
          <thead>
            <tr>
              <th>공사명</th>
              <th>발주처</th>
              <th>소속/직무</th>
              <th>기간</th>
              <th style={{textAlign:"right"}}>금액(원)</th>
              <th style={{textAlign:"right"}}>참여율(%)</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={7} style={{padding:12}}>기술경력 정보가 없습니다.</td></tr>
            )}
            {data.map((r) => (
              <tr key={r.id}>
                <td>{r.project_name}</td>
                <td>{r.client_name}</td>
                <td>{(r.company_name || "-") + " / " + (r.role_title || "-")}</td>
                <td>{(r.start_date || "-") + " ~ " + (r.end_date || "-")}</td>
                <td style={{textAlign:"right"}}>{r.contract_amount?.toLocaleString?.() || "-"}</td>
                <td style={{textAlign:"right"}}>{r.participation_rate ?? "-"}</td>
                <td>{r.verification_status || "미제출"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
