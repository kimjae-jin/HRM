import React from "react";
export default function ExportButton({ type = "all", engId }) {
  const handleExport = () => {
    let url = "";
    if (type === "template") url = "/api/export/template.xlsx";
    else if (type === "all") url = "/api/export/all.xlsx";
    else if (type === "one" && engId) url = `/api/export/one/${engId}.xlsx`;
    else return alert("잘못된 내보내기 요청");
    window.open(url, "_blank");
  };
  return <button className="input-grey" onClick={handleExport}>{type === "template" ? "템플릿" : type === "all" ? "전체 내보내기" : "개별 내보내기"}</button>;
}
