import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import EngineersList from "./pages/engineers/EngineersList.jsx";
import EngineerDetail from "./pages/engineers/EngineerDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function useHashRoute(){
  const [hash,setHash] = useState(window.location.hash || "#/engineers");
  useEffect(()=>{
    const on = ()=>setHash(window.location.hash || "#/engineers");
    window.addEventListener("hashchange", on);
    return ()=>window.removeEventListener("hashchange", on);
  },[]);
  return hash;
}

export default function App(){
  const hash = useHashRoute();
  // route 파싱 (#/engineers, #/engineers/ENG001, #/대시보드 등)
  const {page, param} = useMemo(()=>{
    const h = (hash.startsWith("#/")? hash.slice(2): hash).split("/"); // ["engineers", "ENG001"]
    return { page: decodeURIComponent(h[0]||"engineers"), param: decodeURIComponent(h[1]||"") };
  },[hash]);

  return (
    <div className="app-shell">
      <Header />
      <Sidebar route={page} />
      <main className="main">
        {page==="dashboard" || page==="대시보드" ? <Dashboard/> : null}
        {page==="engineers" && !param ? <EngineersList/> : null}
        {page==="engineers" && param ? <EngineerDetail engId={param}/> : null}
        {page!=="engineers" && page!=="dashboard" && page!=="대시보드" ? (
          <div className="page"><div className="card">[{page}] 카테고리 — 개발중</div></div>
        ): null}
      </main>
    </div>
  );
}
