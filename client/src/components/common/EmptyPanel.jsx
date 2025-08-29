import React from "react";

/** 테이블 대신 쓰는 빈 상태 패널(헤더 sticky와 겹침 방지) */
export default function EmptyPanel({ title = "데이터가 없습니다.", hint }) {
  return (
    <div style={{
      border: "1px dashed var(--border-color,#333)",
      borderRadius: 8,
      padding: "24px 16px",
      margin: "8px 12px 12px 12px",
      background: "transparent"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {hint ? <div style={{ opacity: .75, fontSize: 13, lineHeight: 1.5 }}>{hint}</div> : null}
    </div>
  );
}
