import React, { useRef, useState } from "react";

export default function ImportEngineersButton({ onDone }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const doUpload = async (f) => {
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/import/engineers", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Import failed");
      const json = await res.json();
      alert(`불러오기 완료: ${json.count}건`);
      onDone && onDone();
    } catch (e) {
      alert("불러오기 실패: " + e.message);
    } finally {
      setBusy(false);
      fileRef.current.value = "";
    }
  };

  return (
    <>
      <button onClick={() => fileRef.current?.click()} disabled={busy}>
        {busy ? "불러오는 중..." : "불러오기(엑셀)"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={(e) => doUpload(e.target.files?.[0])}
      />
    </>
  );
}
