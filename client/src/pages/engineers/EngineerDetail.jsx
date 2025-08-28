import React, { useEffect, useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5050";

export default function EngineerDetail({ engId }){
  const [data,setData] = useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let aborted=false;
    (async()=>{
      setLoading(true);
      try{
        const r=await fetch(`${API_BASE}/api/engineers/${engId}`);
        const j=await r.json();
        if(!aborted) setData(j);
      }catch(e){console.error(e)}
      finally{if(!aborted) setLoading(false)}
    })();
    return ()=>{aborted=true};
  },[engId]);

  if(loading) return <div className="page">로딩중…</div>;
  if(!data || data.error) return <div className="page">데이터가 없습니다.</div>;

  const e = data.engineer||{};
  const photo = e.photo_path ? `${API_BASE}${e.photo_path}` : "/default-profile.png";

  return (
    <div className="page">
      <div className="card" style={{marginBottom:10}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <img className="photo" src={photo} alt="profile"/>
          <div style={{flex:1}}>
            <div className="summary-grid">
              <div className="summary-item"><b>성명</b>{e.name||""}</div>
              <div className="summary-item"><b>생년월일</b>{e.birth_date||""}</div>
              <div className="summary-item"><b>연락처</b>{e.phone||""}</div>
              <div className="summary-item"><b>부서</b>{e.department||""}</div>
              <div className="summary-item"><b>등급</b>{e.grade||""}</div>
              <div className="summary-item"><b>자격사항</b>{e.license||""}</div>
              <div className="summary-item"><b>업/면허</b>{e.biz_license||""}</div>
              <div className="summary-item"><b>업무중첩</b>{e.overlapping_work||""}</div>
              <div className="summary-item"><b>입사일</b>{e.join_date||""}</div>
              <div className="summary-item"><b>퇴사예정일</b>{e.leaving_expected_date||""}</div>
              <div className="summary-item"><b>퇴사일</b>{e.leave_date||""}</div>
              <div className="summary-item"><b>특이사항</b>{e.notes||""}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:10}}>
        <h3 style={{marginTop:0}}>기술경력(경력증명서 형식 헤더)</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>회사</th><th>부서</th><th>직위/역할</th><th>프로젝트</th><th>기간</th></tr></thead>
            <tbody>
              {(data.careers||[]).map(c=>(
                <tr key={c.id}><td>{c.company}</td><td>{c.department}</td><td>{c.position||c.role||""}</td><td>{c.project_name||""}</td><td>{(c.start_date||"") + (c.end_date?` ~ ${c.end_date}`:"")}</td></tr>
              ))}
              {(!data.careers||data.careers.length===0) && <tr><td colSpan={5}>경력 정보가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{marginBottom:10}}>
        <h3 style={{marginTop:0}}>자격사항</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>자격명</th><th>취득일</th><th>번호</th><th>비고</th></tr></thead>
            <tbody>
              {(data.qualifications||[]).map(q=>(
                <tr key={q.id}><td>{q.name}</td><td>{q.acquisition_date||""}</td><td>{q.number||""}</td><td>{q.notes||""}</td></tr>
              ))}
              {(!data.qualifications||data.qualifications.length===0) && <tr><td colSpan={4}>자격 정보가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>학력</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>학교</th><th>전공</th><th>학위</th><th>기간</th></tr></thead>
            <tbody>
              {(data.education||[]).map(ed=>(
                <tr key={ed.id}><td>{ed.school_name}</td><td>{ed.major||""}</td><td>{ed.degree||""}</td><td>{(ed.start_date||"") + (ed.graduation_date?` ~ ${ed.graduation_date}`:"")}</td></tr>
              ))}
              {(!data.education||data.education.length===0) && <tr><td colSpan={4}>학력 정보가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
