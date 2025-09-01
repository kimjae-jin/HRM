import React, { useEffect, useState } from "react";

const STATUS = ["전체","재직","휴직","퇴사예정","퇴사","삭제","삭제대기"];

export default function EngineersList(){
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("전체");
  const [order, setOrder] = useState({field:"name", dir:"asc"});

  const fetchList = async ()=>{
    const params = new URLSearchParams({
      q, limit: 500, order: order.field, dir: order.dir, status, admin: "0"
    });
    const r = await fetch(`/api/engineers?${params.toString()}`);
    const j = await r.json();
    setRows(j.engineers || []);
    setSelected(new Set());
  };

  useEffect(()=>{ fetchList(); },[]);
  useEffect(()=>{ fetchList(); },[status, order]);

  const toggleAll = (e)=>{
    if(e.target.checked){
      setSelected(new Set(rows.map(r=>r.eng_id)));
    }else{
      setSelected(new Set());
    }
  };
  const toggleOne = (id)=>{
    setSelected(s=>{
      const n = new Set(s);
      if(n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const maskPhone=(p="")=>{
    const m = p.replace(/\D/g,"");
    if(m.length<8) return p||"";
    return `010-**-${m.slice(-4)}`;
  };

  const onHeaderSort=(f)=>{
    setOrder(o=> o.field===f ? {field:f, dir:o.dir==="asc"?"desc":"asc"} : {field:f, dir:"asc"});
  };

  const onSearch = (e)=>{ e.preventDefault(); fetchList(); };

  const onImport = async(file)=>{
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch("/api/import/engineers",{method:"POST", body:fd});
    const j = await r.json();
    alert(j.ok?`불러오기 완료 (${j.count}건)`:"불러오기 실패");
    fetchList();
  };

  const bulkChange = async(nextStatus)=>{
    if(selected.size===0) { alert("선택된 항목이 없습니다."); return; }
    const r = await fetch("/api/engineers/status",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ eng_ids: [...selected], status: nextStatus })
    });
    const j = await r.json();
    if(j.ok){ fetchList(); } else { alert(j.error||"실패"); }
  };

  return (
    <div>
      <div className="toolbar">
        <form onSubmit={onSearch} style={{display:"flex",gap:8}}>
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
        <button className="btn" onClick={()=>window.open("/api/export/template.xlsx","_blank")}>템플릿</button>
        <button className="btn" onClick={()=>window.open("/api/export/all.xlsx","_blank")}>전체 내보내기</button>
        <button className="btn primary" onClick={()=>location.hash="#/engineers/new"}>신규등록</button>
        <div style={{width:8}}/>
        <select onChange={e=>{ if(e.target.value) { bulkChange(e.target.value); e.target.value=""; } }}>
          <option value="">선택 상태 변경…</option>
          {["재직","휴직","퇴사예정","퇴사","삭제","삭제대기"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:32}}><input type="checkbox" onChange={toggleAll} checked={rows.length>0 && selected.size===rows.length} aria-label="select-all"/></th>
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
            {rows.length===0 && <tr><td colSpan={10} style={{padding:20, color:"var(--muted)"}}>기술인 정보가 없습니다.</td></tr>}
            {rows.map(r=>(
              <tr key={r.eng_id} className="row-hover" onDoubleClick={()=>{ location.hash=`#/engineers/${r.eng_id}`; }}>
                <td><input type="checkbox" checked={selected.has(r.eng_id)} onChange={()=>toggleOne(r.eng_id)} aria-label={`select-${r.eng_id}`}/></td>
                <td>{r.status||""}</td>
                <td className="dim">{r.eng_id}</td>
                <td>{r.name}</td>
                <td>{r.department||""}</td>
                <td className="dim">{maskPhone(r.phone||"")}</td>
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
