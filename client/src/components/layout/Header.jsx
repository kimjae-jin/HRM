import React, { useEffect, useState } from "react";

function useDateTime(){
  const [now, setNow] = useState(new Date());
  useEffect(()=>{
    const t = setInterval(()=>setNow(new Date()), 1000);
    return ()=> clearInterval(t);
  },[]);
  const y = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  const weekday = ["일","월","화","수","목","금","토"][now.getDay()];
  const hh = String(now.getHours()).padStart(2,"0");
  const mi = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  return `${y}.${mm}.${dd}. (${weekday}) ${hh}:${mi}:${ss}`;
}

function useTheme(){
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "dark"
  );
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return { theme, toggle: ()=> setTheme(t => t==="dark" ? "light" : "dark") };
}

function SunIcon({size=18}){ return(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4v-2M12 4V2M4 12H2m20 0h-2M5.64 5.64 4.22 4.22m15.56 15.56-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42"/>
  </svg>
)}
function MoonIcon({size=18}){ return(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 1 0 21 12.79z"/>
  </svg>
)}

export default function Header(){
  const dt = useDateTime();
  const { theme, toggle } = useTheme();

  return (
    <header className="app-header">
      <div className="app-header__left">
        <span className="brand" onClick={()=>{ location.hash = "#/engineers"; }}>HRM</span>
      </div>
      <div className="app-header__right">
        <span className="dt">{dt}</span>
        <button className="icon-btn" onClick={toggle} title="라이트/다크 전환">
          {theme==="dark" ? <MoonIcon/> : <SunIcon/>}
        </button>
        <span className="divider" />
        <span className="admin">관리자</span>
      </div>
    </header>
  );
}
