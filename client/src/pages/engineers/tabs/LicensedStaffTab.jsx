import React from "react";

export default function LicensedStaffTab({ data = [] }) {
  return (
    <section className="card" style={{ padding: 0 }}>
      <div style={{
        position:"sticky", top: 0, zIndex:3,
        background:"var(--background-color)",
        borderBottom:"1px solid var(--border)",
        padding:"10px 12px", fontWeight:800
      }}>
        자격
      </div>

      <div style={{ maxHeight:"50dvh", overflow:"auto", padding:12 }}>
        <table>
          <thead>
            <tr>
              <th>자격명</th>
              <th>취득일</th>
              <th>자격번호</th>
              <th>발급기관</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (<tr><td colSpan={5} style={{padding:12}}>자격 정보가 없습니다.</td></tr>)}
            {data.map(r => (
              <tr key={r.id}>
                <td>{r.name || "-"}</td>
                <td>{r.acquisition_date || "-"}</td>
                <td>{r.number || "-"}</td>
                <td>{r.issuer || "-"}</td>
                <td>{r.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
