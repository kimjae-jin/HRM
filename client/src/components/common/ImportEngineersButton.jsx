import React from "react";
export default function ImportEngineersButton({ onDone }) {
  const handleImport = async () => {
    alert("불러오기 기능은 개발중입니다.");
    onDone?.();
  };
  return <button className="input-grey" onClick={handleImport}>불러오기</button>;
}
