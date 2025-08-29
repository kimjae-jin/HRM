import React, { useEffect, useState } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import "./styles/App.css";
import EngineersList from "./pages/engineers/EngineersList";
import BreadcrumbBar from "./components/common/BreadcrumbBar";

function useHash(){
  const [hash, setHash] = useState(window.location.hash || "#/engineers");
  useEffect(()=>{
    const f=()=>setHash(window.location.hash || "#/engineers");
    window.addEventListener("hashchange", f);
    return ()=>window.removeEventListener("hashchange", f);
  },[]);
  return hash;
}

export default function App(){
  const [mode, setMode] = useState(()=> localStorage.getItem("hrm-mode") || "dark");
  const [sbCollapsed, setSbCollapsed] = useState(false);

  // 모드 토글 확실히 동작
  useEffect(()=>{ 
    const isLight = mode==="light";
    document.documentElement.classList.toggle("light", isLight);
    localStorage.setItem("hrm-mode", mode);
  },[mode]);
  useEffect(()=>{ document.documentElement.classList.toggle("sb-collapsed", sbCollapsed); },[sbCollapsed]);

  const hash = useHash();

  // 메인 좌측 상단 위치표기(현재 메뉴명만)
  let breadcrumb = "";
  if(hash.startsWith("#/engineers")) breadcrumb = "기술인";
  else if(hash.startsWith("#/projects")) breadcrumb = "프로젝트";
  else if(hash.startsWith("#/training")) breadcrumb = "교육훈련";
  else if(hash.startsWith("#/licenses")) breadcrumb = "업/면허";
  else if(hash.startsWith("#/finance")) breadcrumb = "청구/재무";
  else if(hash.startsWith("#/partners")) breadcrumb = "관계사";
  else if(hash.startsWith("#/tax")) breadcrumb = "세금계산서";
  else if(hash.startsWith("#/pq")) breadcrumb = "PQ";
  else if(hash.startsWith("#/meetings")) breadcrumb = "주간회의";
  else if(hash.startsWith("#/bids")) breadcrumb = "입찰";

  let Page = null;
  if(hash.startsWith("#/engineers")) Page = <EngineersList />;
  else Page = <div style={{color:'var(--muted)'}}>개발중 페이지입니다.</div>;

  return (
    <>
      <Header
        mode={mode}
        onToggleTheme={()=> setMode(m=> m==="dark" ? "light" : "dark")}
      />
      <Sidebar collapsed={sbCollapsed} onToggleCollapse={()=> setSbCollapsed(v=>!v)} />
      <main className="main">
        {breadcrumb && <BreadcrumbBar text={breadcrumb} />}
        {Page}
      </main>
    </>
  );
}
