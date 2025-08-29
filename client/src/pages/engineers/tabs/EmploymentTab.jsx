import React from "react";
import { getStickyTopForTh } from "../EngineerDetail";
import EmptyPanel from "../../../components/common/EmptyPanel";

export default function EmploymentTab({ rows = [], sectionBarH = 44 }) {
  const thTop = getStickyTopForTh();
  const fmt = (v) => v ?? "-";
  const fmtDate = (v) => {
    if (!v) return "-";
    if (typeof v === "string") {
      if (v.length >= 10 && (v.includes("T") || v.includes(" "))) return v.slice(0, 10);
      const cleaned = v.replace(/\.$/, "").replace(/\./g, "-");
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
    }
    return String(v);
  };

  const SectionBar = (
    <div style={{
      position: "sticky", top: 0, zIndex: 2, height: sectionBarH,
      display: "flex", alignItems: "center",
      background: "var(--background-color,#111)",
      border: "1px solid var(--border-color,#333)",
      borderRadius: 8, padding: "0 12px", margin: "0 12px 8px 12px"
    }}>
      <b>근무 이력</b><span style={{ opacity: .7, marginLeft: 8 }}>회사/부서/직책 기준</span>
    </div>
  );

  if (!rows || rows.length === 0) {
    return (
      <div style={{ paddingTop: 12 }}>
        {SectionBar}
        <EmptyPanel
          title="근무 이력이 없습니다."
          hint="상단의 [상태/비고 저장] 옆에 편집 기능을 추가 예정입니다. 또는 불러오기를 통해 등록하세요."
        />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 12 }}>
      {SectionBar}
      <div style={{ overflow: "auto", margin: "0 12px 12px 12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
          <thead>
            <tr>
              <th style={th(thTop)}>회사</th>
              <th style={th(thTop)}>부서</th>
              <th style={th(thTop)}>직책</th>
              <th style={th(thTop)}>시작</th>
              <th style={th(thTop)}>종료</th>
              <th style={th(thTop)}>비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                <td style={td}>{fmt(r.company)}</td>
                <td style={td}>{fmt(r.department)}</td>
                <td style={td}>{fmt(r.position)}</td>
                <td style={td}>{fmtDate(r.start_date)}</td>
                <td style={td}>{fmtDate(r.end_date)}</td>
                <td style={td}>{fmt(r.notes)}</td>
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
