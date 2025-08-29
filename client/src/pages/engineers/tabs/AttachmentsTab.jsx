import React from "react";
import { getStickyTopForTh } from "../EngineerDetail";

export default function AttachmentsTab({ rows = [], apiBase, sectionBarH = 44 }) {
  const thTop = getStickyTopForTh();
  const fmt = (v) => v ?? "-";
  const fmtSize = (n) => (n == null ? "-" : `${Number(n).toLocaleString()} B`);

  return (
    <div style={{ padding: 12 }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 2, height: sectionBarH,
        display: "flex", alignItems: "center",
        background: "var(--background-color,#111)",
        border: "1px solid var(--border-color,#333)",
        borderRadius: 8, padding: "0 12px", marginBottom: 8
      }}>
        <b>증빙파일</b><span style={{ opacity: .7, marginLeft: 8 }}>개인별 첨부/추후 묶음 PDF 출력</span>
      </div>

      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr>
              <th style={th(thTop)}>구분</th>
              <th style={th(thTop)}>파일명</th>
              <th style={th(thTop)}>크기</th>
              <th style={th(thTop)}>업로드일</th>
              <th style={th(thTop)}>다운로드</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: `calc(${sectionBarH}px/2) 16px 16px 16px`, opacity: .8 }}>첨부가 없습니다.</td></tr>
            ) : rows.map((r, i) => (
              <tr key={r.id || i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                <td style={td}>{fmt(r.category)}</td>
                <td style={td}>{fmt(r.file_name)}</td>
                <td style={{ ...td, textAlign: "right" }}>{fmtSize(r.size_bytes)}</td>
                <td style={td}>{(r.uploaded_at || "").slice(0, 10) || "-"}</td>
                <td style={td}>
                  {r.file_path
                    ? <a href={`${apiBase}${r.file_path}`} target="_blank" rel="noreferrer">열기</a>
                    : "-"}
                </td>
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
