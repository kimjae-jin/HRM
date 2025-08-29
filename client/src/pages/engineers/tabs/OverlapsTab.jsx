import React, { useMemo } from "react";
import { getStickyTopForTh } from "../EngineerDetail";

function toDate(s) {
  if (!s) return null;
  const t = typeof s === "string" ? s.replace(/\./g, "-").slice(0, 10) : s;
  const d = new Date(t);
  return isNaN(d) ? null : d;
}
function isOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !bStart) return false;
  const aS = toDate(aStart), aE = toDate(aEnd) || new Date(8640000000000000);
  const bS = toDate(bStart), bE = toDate(bEnd) || new Date(8640000000000000);
  return aS <= bE && bS <= aE;
}

export default function OverlapsTab({ careers = [], sectionBarH = 44 }) {
  const thTop = getStickyTopForTh();
  const pairs = useMemo(() => {
    const out = [];
    for (let i = 0; i < careers.length; i++) {
      for (let j = i + 1; j < careers.length; j++) {
        const a = careers[i], b = careers[j];
        if (isOverlap(a.start_date, a.end_date, b.start_date, b.end_date)) {
          out.push({
            a_project: a.project_name, a_start: a.start_date, a_end: a.end_date,
            b_project: b.project_name, b_start: b.start_date, b_end: b.end_date
          });
        }
      }
    }
    return out;
  }, [careers]);

  return (
    <div style={{ padding: 12 }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 2, height: sectionBarH,
        display: "flex", alignItems: "center",
        background: "var(--background-color,#111)",
        border: "1px solid var(--border-color,#333)",
        borderRadius: 8, padding: "0 12px", marginBottom: 8
      }}>
        <b>업무중복</b><span style={{ opacity: .7, marginLeft: 8 }}>기간 겹침 간이 탐지</span>
      </div>

      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead>
            <tr>
              <th style={th(thTop)}>A 프로젝트</th>
              <th style={th(thTop)}>A 시작</th>
              <th style={th(thTop)}>A 종료</th>
              <th style={th(thTop)}>B 프로젝트</th>
              <th style={th(thTop)}>B 시작</th>
              <th style={th(thTop)}>B 종료</th>
            </tr>
          </thead>
          <tbody>
            {pairs.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: `calc(${sectionBarH}px/2) 16px 16px 16px`, opacity: .8 }}>중복 기간이 탐지되지 않았습니다.</td></tr>
            ) : pairs.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                <td style={td}>{p.a_project ?? "-"}</td>
                <td style={td}>{(p.a_start || "").toString().slice(0, 10) || "-"}</td>
                <td style={td}>{(p.a_end || "").toString().slice(0, 10) || "-"}</td>
                <td style={td}>{p.b_project ?? "-"}</td>
                <td style={td}>{(p.b_start || "").toString().slice(0, 10) || "-"}</td>
                <td style={td}>{(p.b_end || "").toString().slice(0, 10) || "-"}</td>
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
