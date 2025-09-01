import React, { useEffect, useState } from "react";

function useKoreanDateTime(){
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t=setInterval(()=>setNow(new Date()), 30*1000); return ()=>clearInterval(t); },[]);
  const yo=["일","월","화","수","목","금","토"][now.getDay()];
  const z=n=>String(n).padStart(2,"0");
  return `${now.getFullYear()}.${z(now.getMonth()+1)}.${z(now.getDate())}. (${yo}) ${z(now.getHours())}:${z(now.getMinutes())}`;
}

function Sun({size=18}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>)}
function Moon({size=18}){return(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>)}

export default function Header(){
  const [theme, setTheme] = useState(()=> localStorage.getItem("theme") || "dark");
  const dt = useKoreanDateTime();
  useEffect(()=>{ document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("theme", theme); },[theme]);
  return (
    <header className="app-header">
      <div className="hdr-left">
        <a className="hdr-logo" href="#/">HRM</a>
      </div>
      <div className="hdr-right">
        <span className="hdr-datetime">{dt}</span>
        <button className="hdr-iconbtn" title="모드 전환" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>
          {theme==="dark"? <Moon/> : <Sun/>}
        </button>
        <span className="hdr-user">관리자</span>
      </div>
    </header>
  );
}
