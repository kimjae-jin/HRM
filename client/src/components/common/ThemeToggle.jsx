import React, { useEffect, useState } from "react";

export default function ThemeToggle(){
  const [theme, setTheme] = useState(() => localStorage.getItem("hrm-theme") || "dark");
  useEffect(() => {
    const root = document.documentElement;
    if(theme === "dark") root.setAttribute("data-theme","dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem("hrm-theme", theme);
  }, [theme]);
  return (
    <button className="input-grey" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>
      {theme === "dark" ? "라이트 모드" : "다크 모드"}
    </button>
  );
}
