import React from "react";

export default function EmploymentHistoryTab({ data = [] }) {
  return (
    <section className="card" style={{ padding: 0 }}>
      <div style={{
        position:"sticky", top: 0, zIndex:3,
        background:"var(--background-color)",
        borderBottom:"1px solid var(--border)",
        padding:"10px 12px", fontWeight:800
      }}>
        근무이력
      </div>

      <div style={{ maxHeight:"50dvh", overflow:"auto", padding:12 }}>
        <table>
          <thead>
            <tr>
              <th>소속회사</th>
              <th>부서</th>
              <th>직위</th>
              <th>입사일</th>
              <th>퇴사일</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (<tr><td colSpan={6} style={{padding:12}}>근무이력 정보가 없습니다.</td></tr>)}
            {data.map(r => (
              <tr key={r.id}>
                <td>{r.company_name || "-"}</td>
                <td>{r.department || "-"}</td>
                <td>{r.position || "-"}</td>
                <td>{r.start_date || "-"}</td>
                <td>{r.end_date || "-"}</td>
                <td>{r.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
