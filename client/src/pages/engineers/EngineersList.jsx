import React, { useEffect, useMemo, useState, useCallback } from "react";
import ImportEngineersButton from "../../components/common/ImportEngineersButton";
import ExportButton from "../../components/common/ExportButton";

const STATUS_OPTIONS = ["전체", "재직", "휴직", "퇴사예정", "퇴사", "삭제", "삭제대기"];

function maskPhone(phone) {
  if (!phone) return "";
  // 010-****-1234 형식
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-****-$3");
  }
  // 그 외 길이도 기본 마스킹
  return phone.replace(/\d/g, "*");
}

export default function EngineersList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("전체");
  const [hoverId, setHoverId] = useState(null);
  const [checked, setChecked] = useState({}); // eng_id: true/false

  const fetchList = useCallback(async () => {
    const params = new URLSearchParams({
      q,
      limit: "500",
      order: "name",
      dir: "asc",
    });
    const url = `http://127.0.0.1:5050/api/engineers?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("목록 조회 실패");
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
  }, [q]);

  useEffect(() => {
    fetchList().catch((e) => console.error(e));
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (status === "전체") return rows;
    return rows.filter((r) => (r.status || "재직") === status);
  }, [rows, status]);

  const toggleCheck = (eng_id) => {
    setChecked((prev) => ({ ...prev, [eng_id]: !prev[eng_id] }));
  };

  const allChecked = filtered.length > 0 && filtered.every((r) => checked[r.eng_id]);
  const toggleCheckAll = () => {
    if (allChecked) {
      const next = { ...checked };
      filtered.forEach((r) => (next[r.eng_id] = false));
      setChecked(next);
    } else {
      const next = { ...checked };
      filtered.forEach((r) => (next[r.eng_id] = true));
      setChecked(next);
    }
  };

  const goDetail = (eng_id) => {
    window.location.hash = `#/engineers/${eng_id}`;
  };

  return (
    <div style={{ padding: 16 }}>
      {/* 상단 툴바 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="이름/부서/자격/연락처 검색"
          className="input-grey"
          style={{ padding: 8, border: "1px solid var(--border-color, #444)", background: "var(--input-bg, #2a2a2a)", color: "var(--text-color, #eee)", borderRadius: 8, minWidth: 240 }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-grey"
          style={{ padding: "8px 10px", borderRadius: 8, background: "var(--input-bg, #2a2a2a)", color: "var(--text-color, #eee)", border: "1px solid var(--border-color, #444)" }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <ImportEngineersButton onDone={() => fetchList().catch(()=>{})} />
          <ExportButton type="template" />
          <ExportButton type="all" />
        </div>
      </div>

      {/* 목록 테이블 (헤더 고정, 메인 컨텐츠만 스크롤) */}
      <div style={{ overflow: "auto", border: "1px solid var(--border-color, #444)", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--table-header-bg, #1f1f1f)", color: "var(--text-color, #eee)", zIndex: 1 }}>
            <tr>
              <th style={{ textAlign: "center", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>
                <input type="checkbox" checked={allChecked} onChange={toggleCheckAll} />
              </th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>상태</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>성명</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>부서</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>등급</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>자격사항</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>업/면허</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>입사일</th>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>연락처(호버)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 16, color: "var(--muted-color, #aaa)" }}>
                  기술인 정보가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const statusText = r.status || "재직";
                const showPhone = hoverId === r.eng_id ? r.phone || "" : maskPhone(r.phone || "");
                return (
                  <tr
                    key={r.eng_id}
                    style={{ borderBottom: "1px solid var(--border-color, #333)", cursor: "pointer" }}
                    onDoubleClick={() => goDetail(r.eng_id)}
                  >
                    <td style={{ textAlign: "center", padding: 10 }}>
                      <input type="checkbox" checked={!!checked[r.eng_id]} onChange={() => toggleCheck(r.eng_id)} />
                    </td>
                    <td style={{ padding: 10 }}>{statusText}</td>
                    <td style={{ padding: 10 }}>{r.name}</td>
                    <td style={{ padding: 10 }}>{r.department}</td>
                    <td style={{ padding: 10 }}>{r.grade}</td>
                    <td style={{ padding: 10 }}>{r.license /* = 자격사항 */}</td>
                    <td style={{ padding: 10 }}>{r.biz_license || ""}</td>
                    <td style={{ padding: 10 }}>{r.join_date || ""}</td>
                    <td
                      style={{ padding: 10 }}
                      onMouseEnter={() => setHoverId(r.eng_id)}
                      onMouseLeave={() => setHoverId(null)}
                      title="마우스를 올리면 전체 번호가 보입니다"
                    >
                      {showPhone}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
