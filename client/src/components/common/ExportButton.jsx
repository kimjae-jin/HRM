import React from "react";

/**
 * 내보내기 버튼
 * - 전체: GET /api/export/all.xlsx (다운로드)
 * - 템플릿: GET /api/export/template.xlsx (다운로드)
 * - 개별: GET /api/export/one/:engId.xlsx (다운로드)  // 필요 시 다른 화면에서 사용
 */
export default function ExportButton({ apiBase, kind = "all", engId }) {
  const handleClick = () => {
    let url = "";
    if (kind === "template") url = `${apiBase}/api/export/template.xlsx`;
    else if (kind === "one" && engId) url = `${apiBase}/api/export/one/${encodeURIComponent(engId)}.xlsx`;
    else url = `${apiBase}/api/export/all.xlsx`;

    // 단순 다운로드
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const label =
    kind === "template" ? "템플릿 받기" :
    kind === "one" ? "개별 내보내기" : "전체 내보내기";

  return (
    <button type="button" onClick={handleClick} style={btnStyle} title={`${label} (엑셀 .xlsx)`}>
      {label}
    </button>
  );
}

const btnStyle = {
  padding: "8px 10px",
  border: "1px solid var(--border-color)",
  borderRadius: 8,
  background: "var(--surface-1)",
  color: "var(--text-color)",
  cursor: "pointer",
};
