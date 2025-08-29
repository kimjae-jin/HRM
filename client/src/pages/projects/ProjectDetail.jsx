import React, { useEffect, useMemo, useRef, useState } from "react";

const AUTO_KEY = (pid, tkey)=> pid ? `draft:project:${pid}` : `draft:new:${tkey}`;

export default function ProjectDetail() {
  const pid = useMemo(() => {
    const m = (location.hash||"").match(/^#\/projects\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : "";
  }, [location.hash]);

  const [form, setForm] = useState({
    project_name: "", project_category: "", pm_name: "", project_location: "",
    summary: "", facility_type: "", status: "진행중",
    // 계약 최초 입력 스케치 필드(미사용시 빈값 유지)
    total_amount: "", supply_amount: "", vat_amount: ""
  });
  const [serverSavedAt, setServerSavedAt] = useState("");
  const tempKeyRef = useRef(crypto.randomUUID());

  // 서버 데이터/초기 드래프트 불러오기
  useEffect(()=>{
    const init = async ()=>{
      // 1) 상세 조회(기존 프로젝트면)
      if (pid) {
        try {
          const r = await fetch(`http://127.0.0.1:5050/api/projects/${encodeURIComponent(pid)}`);
          if (r.ok) {
            const js = await r.json();
            const p = js.project || {};
            setForm(v=>({
              ...v,
              project_name: p.project_name||"",
              project_category: p.project_category||"",
              pm_name: p.pm_name||"",
              project_location: p.project_location||"",
              summary: p.summary||"",
              facility_type: p.facility_type||"",
              status: p.status||"진행중"
            }));
          }
        } catch {}
      }
      // 2) 서버 autosave 조회
      try {
        const qs = new URLSearchParams(pid ? {project_id:pid}:{temp_key:tempKeyRef.current});
        const r = await fetch(`http://127.0.0.1:5050/api/projects/autosave?`+qs.toString());
        const js = await r.json();
        if (js && js.payload) setForm(v=>({...v, ...js.payload}));
        if (js && js.updated_at) setServerSavedAt(js.updated_at);
      } catch {}
      // 3) 로컬 드래프트
      try {
        const raw = localStorage.getItem(AUTO_KEY(pid, tempKeyRef.current));
        if (raw) setForm(v=>({...v, ...JSON.parse(raw)}));
      } catch {}
    };
    init();
  }, [pid]);

  // 디바운스 자동저장 (로컬 + 서버)
  useEffect(()=>{
    const t = setTimeout(async ()=>{
      const payload = {...form};
      // 로컬
      localStorage.setItem(AUTO_KEY(pid, tempKeyRef.current), JSON.stringify(payload));
      // 서버
      try{
        const body = { payload, editor_id:"admin" };
        if (pid) body.project_id = pid; else body.temp_key = tempKeyRef.current;
        const r = await fetch("http://127.0.0.1:5050/api/projects/autosave", {
          method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body)
        });
        const js = await r.json();
        if (js && js.updated_at) setServerSavedAt(js.updated_at);
      }catch{}
    }, 600); // 0.6s 디바운스
    return ()=>clearTimeout(t);
  }, [form, pid]);

  const onChange = (k)=>(e)=> setForm(v=>({...v, [k]: e.target.value}));

  const badge = (s)=>{
    if (s==="중지중") return <span style={{color:"#dc2626", fontStyle:"italic"}}>중지중</span>;
    if (s==="보류중") return <span style={{opacity:.8}}>보류중</span>;
    if (s==="완료") return <span style={{opacity:.6}}>완료</span>;
    return <span>진행중</span>;
  };

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <h2 style={{margin:0}}>프로젝트 상세 {pid ? `(${pid})` : "(신규초안)"}</h2>
        <div style={{fontSize:12, color:"var(--muted-text)"}}>
          자동저장: {serverSavedAt ? serverSavedAt : "대기중"} · <b>개발중</b>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0, 1fr))", gap:12}}>
        <div>
          <label>계약명</label>
          <input value={form.project_name} onChange={onChange("project_name")} placeholder="프로젝트 계약명" />
        </div>
        <div>
          <label>구분</label>
          <select value={form.project_category} onChange={onChange("project_category")}>
            <option value="">선택</option>
            <option>PQ</option><option>공공</option><option>공공(하)</option><option>민간</option>
          </select>
        </div>
        <div>
          <label>PM 담당자</label>
          <input value={form.pm_name} onChange={onChange("pm_name")} placeholder="홍길동" />
        </div>
        <div>
          <label>과업 위치</label>
          <input value={form.project_location} onChange={onChange("project_location")} placeholder="서울시 OO구" />
        </div>
        <div>
          <label>요약(70자)</label>
          <input value={form.summary} onChange={onChange("summary")} maxLength={70} placeholder="요약 입력" />
        </div>
        <div>
          <label>시설물 종류</label>
          <input value={form.facility_type} onChange={onChange("facility_type")} placeholder="도로/하천/상하수도 등" />
        </div>
        <div>
          <label>상태</label>
          <select value={form.status} onChange={onChange("status")}>
            <option>진행중</option><option>중지중</option><option>보류중</option><option>완료</option>
          </select>
          <div style={{marginTop:6}}>{badge(form.status)}</div>
        </div>
      </div>

      <div style={{height:10}} />

      <div className="card" style={{background:"transparent", borderStyle:"dashed"}}>
        <h3 style={{margin:"6px 0 12px"}}>최초 계약 (요약 입력)</h3>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0, 1fr))", gap:12}}>
          <div>
            <label>총 계약금액</label>
            <input value={form.total_amount} onChange={onChange("total_amount")} placeholder="예: 100000000" />
          </div>
          <div>
            <label>지분 공급가액</label>
            <input value={form.supply_amount} onChange={onChange("supply_amount")} placeholder="예: 90000000" />
          </div>
          <div>
            <label>지분 부가세</label>
            <input value={form.vat_amount} onChange={onChange("vat_amount")} placeholder="예: 10000000" />
          </div>
        </div>
        <div style={{marginTop:8, fontSize:12, color:"var(--muted-text)"}}>
          * 값 입력은 자동저장으로 임시 보관됩니다. 실제 저장/계산 및 변경이력 생성은 후속 단계에서 활성화됩니다.
        </div>
      </div>
    </div>
  );
}
