import React, { useEffect, useState } from "react";

export default function EngineerDetail({ engId }){
  const isNew = (engId === "new");
  const [data, setData] = useState({
    eng_id:"", name:"", resident_id:"", phone:"", address:"", department:"",
    join_date:"", leaving_expected_date:"", leave_date:"", notes:"", status:"재직"
  });
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    if(isNew){
      setData(d=>({ ...d, eng_id:"", name:"", resident_id:"", status:"재직" }));
    }else{
      (async()=>{
        const r = await fetch(`/api/engineers/${engId}`);
        if(r.ok){
          const j = await r.json();
          const e = j.engineer||{};
          setData({
            eng_id:e.eng_id||"", name:e.name||"", resident_id:e.resident_id||"",
            phone:e.phone||"", address:e.address||"", department:e.department||"",
            join_date:(e.join_date||"").slice(0,10),
            leaving_expected_date:(e.leaving_expected_date||"").slice(0,10),
            leave_date:(e.leave_date||"").slice(0,10),
            notes:e.notes||"", status:e.status||"재직"
          });
        }
      })();
    }
  },[engId]);

  const save = async()=>{
    setSaving(true);
    try{
      const payload = {...data};
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? "/api/engineers" : `/api/engineers/${data.eng_id}`;
      const r = await fetch(url, {
        method, headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if(!r.ok || !j.ok) throw new Error(j.error||"저장 실패");
      alert("저장되었습니다.");
      if(isNew){
        location.hash = `#/engineers/${data.eng_id}`;
      }
    }catch(e){
      alert(e.message);
    }finally{
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="panel" style={{padding:12, marginBottom:10, display:"flex", alignItems:"center", gap:8}}>
        <b style={{fontSize:"1.05rem"}}>{isNew? "기술인 신규등록" : `기술인 상세 (${data.eng_id})`}</b>
        <div style={{flex:1}}/>
        <button className="btn primary" onClick={save} disabled={saving}>{saving?"저장중…":"저장"}</button>
        <button className="btn" onClick={()=>history.back()}>목록</button>
      </div>

      <div className="panel" style={{padding:16}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(240px,1fr))", gap:12}}>
          <label>사번
            <input value={data.eng_id} onChange={e=>setData({...data, eng_id:e.target.value})} disabled={!isNew}
                   placeholder="예: HOR-001" />
          </label>
          <label>성명
            <input value={data.name} onChange={e=>setData({...data, name:e.target.value})}/>
          </label>
          <label>주민등록번호
            <input value={data.resident_id} onChange={e=>setData({...data, resident_id:e.target.value})} placeholder="YYMMDD-XXXXXXX"/>
          </label>

          <label>부서명
            <input value={data.department} onChange={e=>setData({...data, department:e.target.value})}/>
          </label>
          <label>전화번호
            <input value={data.phone} onChange={e=>setData({...data, phone:e.target.value})}/>
          </label>
          <label>입사일
            <input type="date" value={data.join_date} onChange={e=>setData({...data, join_date:e.target.value})}/>
          </label>

          <label>주소
            <input value={data.address} onChange={e=>setData({...data, address:e.target.value})}/>
          </label>
          <label>퇴사예정일
            <input type="date" value={data.leaving_expected_date||""} onChange={e=>setData({...data, leaving_expected_date:e.target.value})}/>
          </label>
          <label>퇴사일
            <input type="date" value={data.leave_date||""} onChange={e=>setData({...data, leave_date:e.target.value})}/>
          </label>

          <label style={{gridColumn:"1 / span 3"}}>비고
            <input value={data.notes} onChange={e=>setData({...data, notes:e.target.value})}/>
          </label>
        </div>
      </div>
    </div>
  );
}
