import React, { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = ["전체","재직","휴직","퇴사예정","퇴사","삭제","삭제대기"];
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5050";

function maskPhone(p){
  if(!p) return "";
  // 기본 노출은 앞 3자리 + 나머지 마스킹, hover 시 title로 전체 확인
  return p.replace(/(\d{3})\d+(\d{2})/, "$1****$2");
}

export default function EngineersList(){
  const [rows,setRows] = useState([]);
  const [q,setQ] = useState("");
  const [status,setStatus]=useState("전체");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    let aborted=false;
    (async()=>{
      setLoading(true);
      try{
        const url = `${API_BASE}/api/engineers?q=${encodeURIComponent(q)}&limit=500&order=name&dir=asc`;
        const r = await fetch(url);
        const j = await r.json();
        if(!aborted){
          const data = (j.engineers||[]).map(x=>({...x, _checked:false}));
          setRows(data);
        }
      }catch(e){
        console.error(e);
      }finally{
        if(!aborted) setLoading(false);
      }
    })();
    return ()=>{aborted=true}
  },[q]);

  const filtered = useMemo(()=>{
    return rows.filter(r=>{
      if(status!=="전체" && r.status!==status) return false;
      return true;
    });
  },[rows,status]);

  return (
    <div className="page">
      <div className="toolbar">
        <input className="input" placeholder="검색(이름/부서…)" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
        </select>
        <button className="button" onClick={()=>window.open(`${API_BASE}/api/export/template.xlsx`,'_blank')}>템플릿 받기</button>
        <button className="button" onClick={()=>window.open(`${API_BASE}/api/export/all.xlsx`,'_blank')}>전체 내보내기</button>
      </div>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th style={{width:36}}><input type="checkbox" onChange={(e)=>{
                const all = filtered.map(x=>x.eng_id);
                const checked = e.target.checked;
                setRows(prev=>prev.map(p=> all.includes(p.eng_id)? {...p,_checked:checked} : p));
              }} /></th>
              <th>상태</th>
              <th>성명</th>
              <th>부서</th>
              <th>등급</th>
              <th>자격사항</th>
              <th>업/면허</th>
              <th>입사일</th>
              <th>연락처</th>
              <th>내보내기</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={10}>로딩중…</td></tr>}
            {!loading && filtered.length===0 && <tr><td colSpan={10}>기술인 정보가 없습니다.</td></tr>}
            {!loading && filtered.map(r=>(
              <tr key={r.eng_id}>
                <td><input type="checkbox" checked={!!r._checked} onChange={(e)=>{
                  const checked=e.target.checked;
                  setRows(prev=>prev.map(p=> p.eng_id===r.eng_id? {...p,_checked:checked}:p));
                }}/></td>
                <td><span className={`status ${r.status||""}`}>{r.status||"—"}</span></td>
                <td className="name-cell"><a href={`#/engineers/${r.eng_id}`}>{r.name}</a></td>
                <td>{r.department||""}</td>
                <td>{r.grade||""}</td>
                <td>{r.license||""}</td>
                <td>{r.biz_license||""}</td>
                <td>{r.join_date||""}</td>
                <td title={r.phone||""}>{maskPhone(r.phone||"")}</td>
                <td><button className="button" onClick={()=>window.open(`${API_BASE}/api/export/one/${r.eng_id}.xlsx`,'_blank')}>개별</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
