import React, { useEffect, useMemo, useState, useCallback } from "react";
import CareersTab from "./tabs/CareersTab";
import QualificationsTab from "./tabs/QualificationsTab";
import TrainingsTab from "./tabs/TrainingsTab";
import AttachmentsTab from "./tabs/AttachmentsTab";
import EmploymentTab from "./tabs/EmploymentTab";
import EducationTab from "./tabs/EducationTab";
import PerformanceTab from "./tabs/PerformanceTab";
import OverlapsTab from "./tabs/OverlapsTab";
import AppliedLicensesTab from "./tabs/AppliedLicensesTab";

// CSV 내보내기 유틸
function exportCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => {
        let v = r[h] ?? "";
        v = String(v).replaceAll('"', '""');
        if (v.includes(",") || v.includes("\n") || v.includes('"')) return `"${v}"`;
        return v;
      }).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SECTION_BAR_H = 44; // 탭 내부 섹션 타이틀 높이(모든 탭 공통)
export const getStickyTopForTh = () => SECTION_BAR_H; // th의 sticky top 기준

function getHashParam(name) {
  const q = location.hash.split("?")[1] || "";
  const p = new URLSearchParams(q);
  return p.get(name);
}

export default function EngineerDetail({ engIdFromHash }) {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5050";
  const engId = engIdFromHash || (location.hash.match(/#\/engineers\/([^?]+)/)?.[1] ?? "");
  const [data, setData] = useState(null);
  const [active, setActive] = useState("careers");
  const [saving, setSaving] = useState(false);

  const fetchOne = useCallback(async () => {
    if (!engId) return;
    const res = await fetch(`${API_BASE}/api/engineers/${engId}`);
    if (!res.ok) {
      alert("상세를 불러오지 못했습니다.");
      return;
    }
    const json = await res.json();
    setData(json);

    // 자동 탭 오픈 규칙
    const tabParam = getHashParam("tab");
    if (tabParam) {
      setActive(tabParam);
    } else {
      // 최근 작업 플래그(다른 폼에서 저장 후 세팅했다고 가정)
      const after = sessionStorage.getItem("openTabAfterSave");
      if (after) {
        sessionStorage.removeItem("openTabAfterSave");
        setActive(after);
      } else {
        // 자료상태 기반 권장 탭
        const hasTrain = (json?.trainings || []).length > 0;
        const hasApplied = (json?.engineer?.applied_licenses || []).length > 0
                           || !!json?.engineer?.biz_license;
        if (hasTrain) setActive("trainings");
        else if (hasApplied) setActive("applied");
        else setActive("careers");
      }
    }
  }, [API_BASE, engId]);

  useEffect(() => { fetchOne(); }, [fetchOne]);

  const eng = data?.engineer || {};
  const careers = data?.careers || [];
  const qualifications = data?.qualifications || [];
  const trainings = data?.trainings || [];
  const attachments = data?.attachments || [];
  const education = data?.education || [];
  const employment = data?.employment || [];
  const performances = data?.performances || [];

  // 업/면허 기준/현황(임시: 서버가 수치 제공 시 자동 계산)
  const licenseBenchmarks = {
    // 예시) 서버가 내려주면 덮여씀
    required_personnel: eng?.license_required_personnel ?? null,
    current_personnel: eng?.license_current_personnel ?? null,
    // 추가 지표 가능: required_grade_mix 등
  };

  const fmtDate = (v) => {
    if (!v) return "-";
    if (typeof v === "string") {
      if (v.length >= 10 && (v.includes("T") || v.includes(" "))) return v.slice(0, 10);
      const cleaned = v.replace(/\.$/, "").replace(/\./g, "-");
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
    }
    return String(v);
  };

  const exportKCA = () => window.open(`${API_BASE}/api/kca/export/${engId}`, "_blank");
  const exportCurrentTabCsv = () => {
    const map = {
      careers,
      quals: qualifications,
      trainings,
      files: attachments,
      employment,
      education,
      performance: performances
    };
    const key = active === "careers" ? "careers"
      : active === "quals" ? "quals"
      : active === "trainings" ? "trainings"
      : active === "files" ? "files"
      : active === "employment" ? "employment"
      : active === "education" ? "education"
      : active === "performance" ? "performance"
      : null;
    if (!key) { alert("이 탭은 CSV 내보내기 대상이 아닙니다."); return; }
    if (!map[key] || map[key].length === 0) { alert("내보낼 데이터가 없습니다."); return; }
    exportCsv(`${engId}_${key}.csv`, map[key]);
  };

  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  useEffect(() => {
    setEditStatus(eng?.status || "");
    setEditNotes(eng?.notes || "");
  }, [eng?.status, eng?.notes]);

  const onSaveTop = async () => {
    if (!engId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/engineers/${engId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ update: { status: editStatus, notes: editNotes } }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchOne();
      alert("저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장 API가 준비되지 않았거나 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const STATUS_OPTIONS = ["재직", "휴직", "퇴사예정", "퇴사", "삭제", "삭제대기"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      {/* 상단 고정 바 */}
      <div style={{
        position: "sticky", top: 0, zIndex: 3,
        background: "var(--background-color,#111)",
        borderBottom: "1px solid var(--border-color,#333)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 12,
          padding: "12px 16px",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={eng?.photo_path || "/default-profile.png"}
              alt="profile"
              style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", border: "1px solid #333" }}
              onError={(e) => { e.currentTarget.src = "/default-profile.png"; }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{eng?.name || "-"}</div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>
                사번 {eng?.eng_id || "-"} · 부서 {eng?.department || "-"} · 입사 {fmtDate(eng?.join_date)}
              </div>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(120px,180px) 1fr",
            gap: 8,
            alignItems: "center"
          }}>
            <label style={{ opacity: 0.8, fontSize: 12 }}>상태</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={{ padding: "6px 10px" }}>
              <option value="">선택</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label style={{ opacity: 0.8, fontSize: 12 }}>비고</label>
            <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="비고 입력"
                   style={{ padding: "6px 10px" }}/>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportKCA} title="건기협 JSON(템플릿) 내보내기">KCA 내보내기</button>
            <button onClick={exportCurrentTabCsv} title="현재 탭 CSV 내보내기">CSV 내보내기</button>
            <button onClick={onSaveTop} disabled={saving} style={{ background: "#2d6cdf", color: "#fff" }}>
              {saving ? "저장중…" : "상태/비고 저장"}
            </button>
          </div>
        </div>

        {/* 요약 박스 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 8,
          padding: "0 16px 12px 16px"
        }}>
          <InfoBox title="면허인력" value={eng?.biz_license || "-"} />
          <InfoBox title="업무중첩" value={eng?.overlapping_work || "-"} />
          <InfoBox title="교육훈련(건기법)" value={trainings?.length ? `${trainings.length}건` : "-"} />
          <InfoBox title="실적" value={careers?.length ? `${careers.length}건` : "-"} />
          <InfoBox title="연락처" value={eng?.phone || "-"} />
          <InfoBox title="주소" value={eng?.address || "-"} />
          <InfoBox title="퇴사예정" value={fmtDate(eng?.leaving_expected_date)} />
          <InfoBox title="퇴사일" value={fmtDate(eng?.leave_date)} />
        </div>

        {/* 탭 바 */}
        <div style={{
          display: "flex", gap: 8, padding: "0 8px 8px 8px",
          borderTop: "1px dashed var(--border-color,#333)", flexWrap: "wrap"
        }}>
          <Tab label="기술경력" active={active === "careers"} onClick={() => setActive("careers")} />
          <Tab label="근무 이력" active={active === "employment"} onClick={() => setActive("employment")} />
          <Tab label="학력" active={active === "education"} onClick={() => setActive("education")} />
          <Tab label="실적" active={active === "performance"} onClick={() => setActive("performance")} />
          <Tab label="업무중복" active={active === "overlaps"} onClick={() => setActive("overlaps")} />
          <Tab label="적용 면허" active={active === "applied"} onClick={() => setActive("applied")} />
          <Tab label="자격사항" active={active === "quals"} onClick={() => setActive("quals")} />
          <Tab label="교육훈련" active={active === "trainings"} onClick={() => setActive("trainings")} />
          <Tab label="증빙파일" active={active === "files"} onClick={() => setActive("files")} />
        </div>
      </div>

      {/* 컨텐츠 영역(내부 스크롤) */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {active === "careers" && <CareersTab rows={careers} sectionBarH={SECTION_BAR_H} />}
        {active === "employment" && <EmploymentTab rows={employment} sectionBarH={SECTION_BAR_H} />}
        {active === "education" && <EducationTab rows={education} sectionBarH={SECTION_BAR_H} />}
        {active === "performance" && <PerformanceTab rows={performances} careers={careers} sectionBarH={SECTION_BAR_H} />}
        {active === "overlaps" && <OverlapsTab careers={careers} sectionBarH={SECTION_BAR_H} />}
        {active === "applied" && <AppliedLicensesTab engineer={eng} benchmarks={licenseBenchmarks} sectionBarH={SECTION_BAR_H} />}
        {active === "quals" && <QualificationsTab rows={qualifications} sectionBarH={SECTION_BAR_H} />}
        {active === "trainings" && <TrainingsTab rows={trainings} sectionBarH={SECTION_BAR_H} />}
        {active === "files" && <AttachmentsTab rows={attachments} apiBase={API_BASE} sectionBarH={SECTION_BAR_H} />}
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        border: `1px solid ${active ? "#2d6cdf" : "var(--border-color,#333)"}`,
        background: active ? "rgba(45,108,223,.15)" : "transparent",
        color: "inherit",
        borderRadius: 6,
        fontWeight: active ? 700 : 500
      }}
    >
      {label}
    </button>
  );
}

function InfoBox({ title, value }) {
  return (
    <div style={{
      border: "1px solid var(--border-color,#333)",
      borderRadius: 8, padding: 10, minHeight: 56
    }}>
      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{title}</div>
      <div style={{ fontWeight: 600, wordBreak: "break-all" }}>{value ?? "-"}</div>
    </div>
  );
}
