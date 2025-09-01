import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API || "http://127.0.0.1:5050";

function maskRRN(rrn){
  // "900101-1234567" -> "900101-1******"
  if(!rrn) return "";
  const m = rrn.match(/^(\d{6})-(\d)\d{6}$/);
  return m ? `${m[1]}-${m[2]}******` : rrn;
}

export default function EngineerForm({ id, onDone }) {
  const isEdit = !!id;
  const [f, setF] = useState({
    eng_id:"", name:"", resident_id:"", join_date:"",
    address:"", phone:"", department:"", leaving_expected_date:"",
    leave_date:"", notes:"", status:"재직"
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v)=>setF(s=>({...s,[k]:v}));

  useEffect(()=>{
    if(isEdit){
      fetch(`${API}/api/engineers/${id}`).then(r=>r.json()).then(data=>{
        const e = data.engineer || {};
        setF({
          eng_id: e.eng_id||"", name:e.name||"", resident_id:e.resident_id||"",
          join_date: (e.join_date||"").slice(0,10),
          address: e.address||"", phone: e.phone||"", department: e.department||"",
          leaving_expected_date: (e.leaving_expected_date||"").slice(0,10),
          leave_date: (e.leave_date||"").slice(0,10),
          notes: e.notes||"", status: e.status||"재직"
        });
      });
    }
  },[id]);

  async function save(){
    setSaving(true);
    try{
      const method = isEdit ? "PUT" : "POST";
      const url = isEdit ? `${API}/api/engineers/${id}` : `${API}/api/engineers`;
      const res = await fetch(url,{
        method,
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(f)
      });
      if(!res.ok) throw new Error(await res.text());
      onDone?.(f.eng_id || id);
      alert("저장되었습니다.");
    }catch(e){
      alert("저장 실패: "+e.message);
    }finally{ setSaving(false); }
  }

  return (
    <div style={{display:"grid", gap:12}}>
      <div className="page-toolbar" style={{justifyContent:"space-between"}}>
        <div style={{fontWeight:600}}>{isEdit?"기술인 수정":"기술인 신규등록"}</div>
        <div>
          <button className="btn ghost" onClick={()=>onDone?.()}>취소</button>{" "}
          <button className="btn primary" disabled={saving} onClick={save}>{saving?"저장중...":"저장"}</button>
        </div>
      </div>

      <div className="table" style={{padding:16, borderRadius:12}}>
        <div style={{display:"grid", gridTemplateColumns:"140px 1fr 140px 1fr", gap:12}}>
          <label>사번<input className="input" value={f.eng_id} onChange={e=>set("eng_id", e.target.value)} placeholder="예: HOR-001" /></label>
          <label>성명<input className="input" value={f.name} onChange={e=>set("name", e.target.value)} /></label>
          <label>주민등록번호<input className="input" value={f.resident_id} onChange={e=>set("resident_id", e.target.value)} placeholder="yyyyMMdd-#######" /></label>
          <div style={{alignSelf:"end", color:"#9a9aa0"}}>표출시: {maskRRN(f.resident_id)}</div>

          <label>입사일<input type="date" className="input" value={f.join_date} onChange={e=>set("join_date", e.target.value)} /></label>
          <label>주소<input className="input" value={f.address} onChange={e=>set("address", e.target.value)} /></label>
          <label>전화번호<input className="input" value={f.phone} onChange={e=>set("phone", e.target.value)} placeholder="010-1234-5678" /></label>
          <label>부서명<input className="input" value={f.department} onChange={e=>set("department", e.target.value)} /></label>

          <label>퇴사예정일<input type="date" className="input" value={f.leaving_expected_date} onChange={e=>set("leaving_expected_date", e.target.value)} /></label>
          <label>퇴사일<input type="date" className="input" value={f.leave_date} onChange={e=>set("leave_date", e.target.value)} /></label>
          <label>상태
            <select className="input" value={f.status} onChange={e=>set("status", e.target.value)}>
              <option>재직</option><option>휴직</option><option>퇴사예정</option><option>퇴사</option>
              <option>삭제</option><option>삭제대기</option>
            </select>
          </label>
          <label>비고<input className="input" value={f.notes} onChange={e=>set("notes", e.target.value)} /></label>
        </div>
      </div>
    </div>
  );
}
