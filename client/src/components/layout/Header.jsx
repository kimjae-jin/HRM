import React, { useEffect, useState } from "react";
import ThemeToggle from "../common/ThemeToggle";

export default function Header({ onToggleSidebar }){
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <header className="app-header">
      {/* 좌측: 모바일 햄버거 + 타이틀 */}
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <button
          className="input-grey"
          onClick={onToggleSidebar}
          aria-label="사이드바 열기"
          style={{ display: "inline-flex", alignItems: "center", justifyContent:"center", width: 40, height: 36 }}
        >
          ☰
        </button>
        <strong>HRM System</strong>
      </div>

      {/* 우측: 시간 + 다크/라이트 */}
      <div style={{display:"flex", alignItems:"center", gap:16}}>
        <span style={{fontSize:14, color:"var(--muted)"}} title="시스템 로컬 시간">
          {now.toLocaleString("ko-KR", {
            year:"numeric", month:"2-digit", day:"2-digit",
            hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false
          })}
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
