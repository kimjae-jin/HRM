import React, { useMemo } from "react";
import { getStickyTopForTh } from "../EngineerDetail";

/**
 * 적용 면허: 개인 자격(license)과 회사 업/면허(biz_license) 요약
 * 서버 확장 시 applied_licenses 배열/benchmarks를 내려주면 표와 지표 계산 활성화.
 */
export default function AppliedLicensesTab({ engineer = {}, benchmarks = {}, sectionBarH = 44 }) {
  const thTop = getStickyTopForTh();
  const rows = engineer?.applied_licenses || []; // 추후 서버 확장
  const hasRows = rows && rows.length > 0;

  // 지표 계산
  const required = toNum(benchmarks.required_personnel);
  const current  = toNum(benchmarks.current_personnel);
  const diff = (required != null && current != null) ? current - required : null;

  const statusLabel = useMemo(() => {
    if (diff == null) return "기준/현황 정보 없음";
    if (diff > 0) return `잉여 ${diff}명`;
    if (diff === 0) return "충족";
    return `부족 ${Math.abs(diff)}명`;
  }, [diff]);

  const statusStyle = useMemo(() => {
    if (diff == null) return {};
    if (diff > 0) return { color: "#35c28d", fontWeight: 700 }; // 잉여: 초록
    if (diff === 0) return { color: "#9aa0a6", fontWeight: 700 }; // 충족: 회색톤
    return { color: "#ff6b6b", fontWeight: 800 }; // 부족: 빨강
  }, [diff]);

  return (
    <div style={{ padding: 12 }}>
      {/* 섹션 타이틀 */}
      <div style={{
        position: "sticky", top: 0, zIndex: 2, height: sectionBarH,
        display: "flex", alignItems: "center",
        background: "var(--background-color,#111)",
        border: "1px solid var(--border-color,#333)",
        borderRadius: 8, padding: "0 12px", marginBottom: 8
      }}>
        <b>적용 면허</b><span style={{ opacity: .7, marginLeft: 8 }}>법적 기준/현황/잉여 여부</span>
      </div>

      {/* 요약 카드 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
        gap: 8, marginBottom: 12
      }}>
        <Box label="개인 자격(자격사항)" value={engineer?.license || "-"} />
        <Box label="회사 업·면허" value={engineer?.biz_license || "-"} />
        <Box label="법적 기준 인원" value={required != null ? `${required}명` : "-"} />
        <Box label="당사 보유 인원" value={current != null ? `${current}명` : "-"} />
        <Box label="상태" value={statusLabel} valueStyle={statusStyle} />
      </div>

      {/* 상세 표 (있을 때만) */}
      {hasRows ? (
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr>
                <th style={th(thTop)}>면허명</th>
                <th style={th(thTop)}>분류</th>
                <th style={th(thTop)}>적용여부</th>
                <th style={th(thTop)}>비고</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} style={{ borderBottom: "1px solid var(--row-border,#222)" }}>
                  <td style={td}>{r.license_name ?? "-"}</td>
                  <td style={td}>{r.category ?? "-"}</td>
                  <td style={td}>{r.applied ? "Y" : "-"}</td>
                  <td style={td}>{r.notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          border: "1px dashed var(--border-color,#333)",
          borderRadius: 8, padding: "18px 12px"
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>상세 적용 면허 표시는 서버 확장 후 활성화됩니다.</div>
          <div style={{ opacity: .75, fontSize: 13, lineHeight: 1.5 }}>
            서버에서 면허별 법적 기준(예: 등급 조합/필수 인원)과 회사 현황을 내려주면 잉여/부족을 자동 산정합니다.
          </div>
        </div>
      )}
    </div>
  );
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function Box({ label, value, valueStyle }) {
  return (
    <div style={{ border: "1px solid var(--border-color,#333)", borderRadius: 8, padding: 10 }}>
      <div style={{ fontSize: 11, opacity: .7, marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, ...(valueStyle || {}) }}>{value}</div>
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
