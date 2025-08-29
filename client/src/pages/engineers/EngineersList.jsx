import React, { useEffect, useState } from "react";

export default function EngineersList(){
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [order, setOrder] = useState({by:"name", dir:"asc"});

  const reload = ()=>{
    const url = `/api/engineers?q=${encodeURIComponent(q)}&limit=500&order=${order.by}&dir=${order.dir}&status=전체&admin=0`;
    fetch(url).then(r=>r.ok?r.json():Promise.reject(r.statusText))
      .then(d=> setRows(d.engineers||[]))
      .catch(e=> setError(String(e)));
  };

  useEffect(()=>{ reload(); },[]);
  useEffect(()=>{ reload(); },[q, order.by, order.dir]);

  const maskPhone = (p)=>{
    if(!p) return "";
    const m = p.replace(/[^\d]/g,"");
    if(m.length < 10) return p;
    return `${m.slice(0,3)}-**-${m.slice(-4)}`;
  };
  const toggleSort = (by)=>{
    setOrder(o=>{
      if(o.by===by) return {by, dir: o.dir==="asc"?"desc":"asc"};
      return {by, dir:"asc"};
    });
  };

  return (
    <section>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12, flexWrap:'wrap'}}>
        <button onClick={()=>{ window.location.hash = "#/engineers/new"; }}>신규 등록</button>
        <input placeholder="이름/부서/사번 검색" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={reload}>조회</button>
        <a href="/api/export/template.xlsx" target="_blank" rel="noreferrer"><button>템플릿 받기</button></a>
        <a href="/api/export/all.xlsx" target="_blank" rel="noreferrer"><button>전체 내보내기</button></a>
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={{width:42}}></th>
                <th onDoubleClick={()=>toggleSort("status")}>상태</th>
                <th onDoubleClick={()=>toggleSort("eng_id")}>사번</th>
                <th onDoubleClick={()=>toggleSort("name")}>성명</th>
                <th onDoubleClick={()=>toggleSort("department")}>부서</th>
                <th>등급</th>
                <th>자격사항</th>
                <th onDoubleClick={()=>toggleSort("join_date")}>입사일</th>
                <th onDoubleClick={()=>toggleSort("leaving_expected_date")}>퇴사예정일</th>
                <th onDoubleClick={()=>toggleSort("leave_date")}>퇴사일</th>
                <th>연락처</th>
                <th>비고</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="table-body">
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <tbody>
              {rows.map(r=>(
                <tr key={r.eng_id} onDoubleClick={()=>{ window.location.hash = `#/engineers/${r.eng_id}`; }} style={{cursor:'pointer'}}>
                  <td style={{width:42}}><input type="checkbox" /></td>
                  <td>{r.status || ""}</td>
                  <td>{r.eng_id}</td>
                  <td>{r.name}</td>
                  <td>{r.department || ""}</td>
                  <td>{r.grade || ""}</td>
                  <td>{r.license || ""}</td>
                  <td>{(r.join_date||"").slice(0,10)}</td>
                  <td>{(r.leaving_expected_date||"").slice(0,10)}</td>
                  <td>{(r.leave_date||"").slice(0,10)}</td>
                  <td title={r.phone || ""}>{maskPhone(r.phone)}</td>
                  <td>{r.notes || ""}</td>
                </tr>
              ))}
              {rows.length===0 && (
                <tr><td colSpan={12} style={{color:'var(--muted)', textAlign:'center', padding:'28px'}}>데이터가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div style={{color:'tomato', marginTop:8}}>Load failed: {error}</div>}
    </section>
  );
}
