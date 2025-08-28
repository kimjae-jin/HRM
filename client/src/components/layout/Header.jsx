import React, { useEffect, useState } from "react";

function toggleTheme(){
  const html = document.documentElement;
  const next = html.getAttribute("data-theme")==="light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

export default function Header(){
  const [now, setNow] = useState(new Date());
  useEffect(()=>{
    const saved = localStorage.getItem("theme");
    if(saved) document.documentElement.setAttribute("data-theme", saved);
    const id = setInterval(()=>setNow(new Date()), 1000);
    return ()=>clearInterval(id);
  },[]);
  const timeStr = now.toLocaleString("ko-KR", { hour12:false });
  return (
    <header className="header">
      <div className="brand">
        <a href="#/dashboard" className="button">HRM SYSTEM</a>
      </div>
      <div className="header-actions">
        <span className="header-pill"><span className="icon">🕒</span>{timeStr}</span>
        <button className="button" onClick={toggleTheme} title="라이트/다크 전환">🌓</button>
        <span className="header-pill"><span className="icon">👤</span>관리자</span>
      </div>
    </header>
  );
}
