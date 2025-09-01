import React, { useEffect, useState } from "react";

/** 날짜 "YYYY.MM.DD. (요일) HH:MM" */
function useKoreanDateTime(){
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(()=>setNow(new Date()), 1000*30);
    return () => clearInterval(t);
  }, []);
  const days = ["일","월","화","수","목","금","토"];
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,"0");
  const d = String(now.getDate()).padStart(2,"0");
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  return `${y}.${m}.${d}. (${days[now.getDay()]}) ${hh}:${mm}`;
}

function SunIcon({size=18}){ /* 단색: currentColor */
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>
    </svg>
  );
}
function MoonIcon({size=18}){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
    </svg>
  );
}

export default function Header(){
  const dt = useKoreanDateTime();
  const [theme, setTheme] = useState(
    typeof document !== "undefined" ? (document.documentElement.getAttribute("data-theme")||"dark") : "dark"
  );
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <header className="app-header">
      <div className="hdr-left">
        {/* 로고(홈 이동)만 남기고, 브레드크럼은 App.jsx의 콘텐츠 상단에만 표시 */}
        <a className="hdr-logo" href="#/">HRM</a>
      </div>

      <div className="hdr-right">
        <span className="hdr-datetime" aria-label="현재 날짜와 시간">{dt}</span>
        <button className="hdr-iconbtn" title="모드 전환"
          onClick={()=> setTheme(prev => prev==="dark" ? "light" : "dark")}>
          {theme==="dark"? <MoonIcon/> : <SunIcon/>}
        </button>
        <span className="hdr-user">관리자</span>
      </div>
    </header>
  );
}
