import React from "react";

export default function TrainingsTab({ data = [] }) {
  return (
    <section className="card" style={{ padding: 0 }}>
      <div style={{
        position:"sticky", top: 0, zIndex:3,
        background:"var(--background-color)",
        borderBottom:"1px solid var(--border)",
        padding:"10px 12px", fontWeight:800
      }}>
        교육훈련 (종료일까지 표기)
      </div>

      <div style={{ maxHeight:"50dvh", overflow:"auto", padding:12 }}>
        <table>
          <thead>
            <tr>
              <th>교육명</th>
              <th>기관명</th>
              <th>시작일</th>
              <th>종료일</th>
              <th style={{textAlign:"right"}}>시간(시간)</th>
              <th>증서번호</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (<tr><td colSpan={7} style={{padding:12}}>교육훈련 정보가 없습니다.</td></tr>)}
            {data.map(r => (
              <tr key={r.id}>
                <td>{r.title || "-"}</td>
                <td>{r.org_name || "-"}</td>
                <td>{r.start_date || "-"}</td>
                <td>{r.end_date || "-"}</td>
                <td style={{textAlign:"right"}}>{r.hours ?? "-"}</td>
                <td>{r.certificate_no || "-"}</td>
                <td>{r.notes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
