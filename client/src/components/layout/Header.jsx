import React, { useEffect, useState } from "react";
import "./Header.css";

export default function Header({ onToggleTheme, mode="dark", userName="관리자" }) {
  const [now, setNow] = useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);
  const days=["일","월","화","수","목","금","토"];
  const yyyy=now.getFullYear();
  const mm=String(now.getMonth()+1).padStart(2,"0");
  const dd=String(now.getDate()).padStart(2,"0");
  const day=days[now.getDay()];
  const hh=String(now.getHours()).padStart(2,"0");
  const mi=String(now.getMinutes()).padStart(2,"0");
  const ss=String(now.getSeconds()).padStart(2,"0");

  return (
    <header className="app-header">
      {/* 로고 = 홈 이동 */}
      <a href="#/engineers" className="brand" title="홈으로">HRM</a>
      <div className="h-right">
        <div className="clock">{yyyy}.{mm}.{dd}. ({day}) {hh}:{mi}:{ss}</div>
        <button className="mode-btn" onClick={onToggleTheme} aria-label="모드 전환">
          {mode==="dark" ? "🌙" : "☀️"}
        </button>
        <div className="user">{userName}</div>
      </div>
    </header>
  );
}
