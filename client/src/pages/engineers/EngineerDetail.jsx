import React, { useEffect, useState } from "react";

/**
 * 상세 페이지 컨테이너
 * - 상단 요약 카드(고정)
 * - 하단 탭(스크롤), 기본정보/학력/자격/경력/교육/첨부
 * - 더블클릭 로직은 리스트에서 처리, 이 화면은 engId 프롭으로 렌더
 */
export default function EngineerDetail({ engId }) {
  const [data, setData] = useState(null);
  const [active, setActive] = useState("basic");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch(`http://127.0.0.1:5050/api/engineers/${engId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (mounted) setData(json);
    })().catch(console.error);
    return () => (mounted = false);
  }, [engId]);

  if (!data) {
    return (
      <div style={{ padding: 16 }}>
        <div className="card" style={{ padding: 12 }}>로딩 중...</div>
      </div>
    );
  }

  const eng = data.engineer || {};
  const education = data.education || [];
  const qualifications = data.qualifications || [];
  const careers = data.careers || [];
  const trainings = data.trainings || [];
  const attachments = data.attachments || [];

  // 사진 경로
  const photo = eng.photo_path || ""; // /files/profiles/ENG001.jpg 형태
  const initials = (eng.name || "?").slice(0, 1);

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActive(id)}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid var(--border-color, #444)",
        background: active === id ? "var(--tab-active-bg, #333)" : "var(--tab-bg, #222)",
        color: "var(--text-color, #eee)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100%", gap: 12 }}>
      {/* 상단 요약 카드 (고정) */}
      <div style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--background-color, #111)", padding: 16, borderBottom: "1px solid var(--border-color, #333)" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--avatar-bg, #333)", color: "var(--text-color, #eee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", fontSize: 24, fontWeight: 700,
            }}
            title={eng.name || ""}
          >
            {photo ? (
              // 업로드된 사진
              <img src={photo} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, width: "100%" }}>
            <SummaryItem label="성명" value={eng.name} />
            <SummaryItem label="생년월일" value={eng.birth_date} />
            <SummaryItem label="연락처" value={eng.phone} />
            <SummaryItem label="부서" value={eng.department} />
            <SummaryItem label="등급" value={eng.grade} />
            <SummaryItem label="자격사항" value={eng.license} />{/* 기존 license = 자격사항 */}
            <SummaryItem label="업/면허" value={eng.biz_license || ""} />
            <SummaryItem label="입사일" value={eng.join_date} />
            <SummaryItem label="퇴사예정일" value={eng.leaving_expected_date} />
            <SummaryItem label="퇴사일" value={eng.leave_date} />
            <SummaryItem label="업무중첩" value={eng.overlapping_work} />
            <SummaryItem label="특이사항" value={eng.notes} />
          </div>
        </div>

        {/* 탭 헤더 */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <TabButton id="basic" label="기본정보" />
          <TabButton id="edu" label="학력" />
          <TabButton id="qual" label="자격" />
          <TabButton id="career" label="기술경력" />
          <TabButton id="train" label="교육훈련" />
          <TabButton id="attach" label="첨부파일" />
        </div>
      </div>

      {/* 하단 탭 컨텐츠 (메인만 스크롤) */}
      <div style={{ overflow: "auto", padding: 16 }}>
        {active === "basic" && (
          <div className="card" style={{ padding: 12 }}>
            <h3>기본정보</h3>
            <div>엔지니어 ID: {eng.eng_id}</div>
          </div>
        )}

        {active === "edu" && (
          <TableSection title="학력" headers={["졸업일", "학교명", "전공", "학위", "비고"]} rows={education.map(e => [e.graduation_date, e.school_name, e.major, e.degree, e.notes])} emptyText="학력 정보가 없습니다." />
        )}

        {active === "qual" && (
          <TableSection title="자격" headers={["자격명", "취득일", "번호", "비고"]} rows={qualifications.map(q => [q.name, q.acquisition_date, q.number, q.notes])} emptyText="자격 정보가 없습니다." />
        )}

        {active === "career" && (
          <div className="card" style={{ padding: 12 }}>
            <h3>기술경력</h3>
            <div style={{ color: "var(--muted-color, #aaa)", marginBottom: 8 }}>
              (건기협 경력증명서 형식 헤더는 추후 반영/확정 시 적용)
            </div>
            <TableSection
              title=""
              headers={["공사명", "발주처", "소속/직무", "기간", "금액(원)", "참여율(%)", "상태"]}
              rows={careers.map(c => [
                c.project_name, c.client_name, `${c.company_name || ""} / ${c.role_title || ""}`,
                `${c.start_date || ""} ~ ${c.end_date || ""}`,
                c.contract_amount || "", c.participation_rate || "", c.verification_status || "미제출"
              ])}
              emptyText="경력 정보가 없습니다."
            />
          </div>
        )}

        {active === "train" && (
          <TableSection title="교육훈련" headers={["교육명", "기간", "시간(시간)", "주관", "비고"]} rows={trainings.map(t => [t.title, `${t.start_date || ""} ~ ${t.end_date || ""}`, t.hours || "", t.provider || "", t.notes || ""])} emptyText="교육훈련 정보가 없습니다." />
        )}

        {active === "attach" && (
          <TableSection title="첨부파일" headers={["파일명", "경로"]} rows={attachments.map(a => [a.attachment_filename, a.attachment_path])} emptyText="첨부파일이 없습니다." />
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div style={{ border: "1px solid var(--border-color, #333)", borderRadius: 8, padding: "8px 10px", background: "var(--content-box-bg, #181818)" }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value || "-"}</div>
    </div>
  );
}

function TableSection({ title, headers, rows, emptyText }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      {title ? <h3 style={{ marginBottom: 8 }}>{title}</h3> : null}
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--table-header-bg, #1f1f1f)", color: "var(--text-color, #eee)" }}>
            <tr>
              {headers.map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid var(--border-color, #444)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: "center", padding: 16, color: "var(--muted-color, #aaa)" }}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--border-color, #333)" }}>
                  {r.map((c, i) => (
                    <td key={i} style={{ padding: 10 }}>{c}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
