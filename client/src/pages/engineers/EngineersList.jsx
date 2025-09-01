import React, { useEffect, useMemo, useState } from "react";

const STATUS = ["전체","재직","휴직","퇴사예정","퇴사","삭제","삭제대기"];

export default function EngineersList(){
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("전체");
  const [order, setOrder] = useState({field:"name", dir:"asc"});

  const fetchList = async () => {
    const params = new URLSearchParams({
      q, limit: 500, order: order.field, dir: order.dir, status, admin: "0"
    });
    const res = await fetch(`/api/engineers?${params.toString()}`);
    const json = await res.json();
    setRows(json.engineers || []);
  };

  useEffect(()=>{ fetchList(); },[]);                       // 최초
  useEffect(()=>{ fetchList(); },[status, order]);          // 상태/정렬 변경

  const maskPhone = (p="")=>{
    if(!p) return "";
    const m = p.replace(/\D/g,"");
    if(m.length<8) return p;
    // 010-**-#### 형식
    return `010-**-${m.slice(-4)}`;
  };

  const onHeaderSort = (field)=>{
    setOrder(o => (o.field===field ? {field, dir:o.dir==="asc"?"desc":"asc"} : {field, dir:"asc"}));
  };

  const onSearch = (e)=>{ e.preventDefault(); fetchList(); };

  const onImport = async (file)=>{
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/import/engineers", { method:"POST", body:fd });
    const j = await r.json();
    alert(j.ok? `불러오기 완료 (${j.count}건)` : "불러오기 실패");
    fetchList();
  };

  const onExportAll = ()=>{ window.open("/api/export/all.xlsx","_blank"); };
  const onTemplate = ()=>{ window.open("/api/export/template.xlsx","_blank"); };

  return (
    <div>
      <div className="toolbar">
        <form onSubmit={onSearch} style={{display:"flex", gap:8}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="성명/사번/부서/전화 검색…" style={{minWidth:260}}/>
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            {STATUS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn" type="submit">검색</button>
          <button className="btn" type="button" onClick={()=>{setQ(""); setStatus("전체"); setOrder({field:"name",dir:"asc"}); fetchList();}}>초기화</button>
        </form>
        <div style={{flex:1}}/>
        <input id="imp" type="file" accept=".xlsx,.xls" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&onImport(e.target.files[0])}/>
        <button className="btn" onClick={()=>document.getElementById("imp").click()}>불러오기</button>
        <button className="btn" onClick={onTemplate}>템플릿 받기</button>
        <button className="btn" onClick={onExportAll}>전체 내보내기</button>
        <button className="btn primary" onClick={()=>location.hash="#/engineers/new"}>신규등록</button>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:36}}></th>
              <th onDoubleClick={()=>onHeaderSort("status")}>상태</th>
              <th onDoubleClick={()=>onHeaderSort("eng_id")}>사번</th>
              <th onDoubleClick={()=>onHeaderSort("name")}>성명</th>
              <th onDoubleClick={()=>onHeaderSort("department")}>부서명</th>
              <th>전화번호</th>
              <th onDoubleClick={()=>onHeaderSort("join_date")}>입사일</th>
              <th onDoubleClick={()=>onHeaderSort("leaving_expected_date")}>퇴사예정일</th>
              <th onDoubleClick={()=>onHeaderSort("leave_date")}>퇴사일</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.length===0 && (
              <tr><td colSpan={10} style={{padding:20, color:"var(--muted)"}}>기술인 정보가 없습니다.</td></tr>
            )}
            {rows.map(r=>(
              <tr key={r.eng_id} className="row-hover"
                  onDoubleClick={()=>{ location.hash = `#/engineers/${r.eng_id}`; }}>
                <td></td>
                <td>{r.status||""}</td>
                <td className="dim">{r.eng_id}</td>
                <td>{r.name}</td>
                <td>{r.department||""}</td>
                <td className="dim">{maskPhone(r.phone)}</td>
                <td>{(r.join_date||"").slice(0,10)}</td>
                <td>{(r.leaving_expected_date||"").slice(0,10)}</td>
                <td>{(r.leave_date||"").slice(0,10)}</td>
                <td>{r.notes||""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
