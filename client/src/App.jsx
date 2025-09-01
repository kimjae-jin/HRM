import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "./components/layout/Sidebar";
import EngineersList from "./pages/engineers/EngineersList";
import EngineerDetail from "./pages/engineers/EngineerDetail";
import Dashboard from "./pages/Dashboard";
import "./styles/App.css";

function useHash(){
  const [h, setH] = useState(location.hash || "#/engineers");
  useEffect(()=>{
    const on = ()=> setH(location.hash || "#/engineers");
    window.addEventListener("hashchange", on);
    if(!location.hash) location.hash = "#/engineers";
    return ()=> window.removeEventListener("hashchange", on);
  },[]);
  return h;
}

export default function App(){
  const hash = useHash();                // 예) "#/engineers/ENG001"
  const [route, param] = useMemo(()=>{
    const parts = (hash.replace(/^#\//,"") || "engineers").split("/");
    return [parts[0], parts[1]];         // route, id
  },[hash]);

  // 레이아웃: 헤더 고정, 내용부만 스크롤
  const layoutStyle = { display:"grid", gridTemplateColumns:"240px 1fr", height:"100vh" };
  const contentStyle = { padding:"16px 16px 24px 16px", overflow:"hidden" };
  const mainStyle = { height:"100%", overflow:"auto" };

  let page = null;
  if(route==="engineers" && !param) page = <EngineersList/>;
  else if(route==="engineers" && param) page = <EngineerDetail engId={param}/>;
  else page = <Dashboard/>;

  return (
    <div style={layoutStyle}>
      <Sidebar/>
      <div style={contentStyle}>
        <main style={mainStyle}>
          {page}
        </main>
      </div>
    </div>
  );
}
