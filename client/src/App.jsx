import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import EngineersList from "./pages/engineers/EngineersList";
import EngineerDetail from "./pages/engineers/EngineerDetail";
import ProjectsList from "./pages/projects/ProjectsList";
import Dashboard from "./pages/Dashboard";
import "./styles/App.css";

function useRoute(){
  // 해시 우선, 해시 없고 pathname이 /engineers* 인 경우 보정
  const normalize = ()=>{
    if(!location.hash){
      if(location.pathname.startsWith("/engineers")){
        location.hash = "#"+location.pathname;   // /engineers → #/engineers
      }else{
        location.hash = "#/engineers";
      }
    }
  };
  normalize();
  const [h, setH] = useState(location.hash);
  useEffect(()=>{
    const on = ()=> setH(location.hash);
    window.addEventListener("hashchange", on);
    return ()=> window.removeEventListener("hashchange", on);
  },[]);
  const [route, param] = useMemo(()=>{
    const parts = (h.replace(/^#\//,"") || "engineers").split("/");
    return [parts[0], parts[1]]; // route, id
  }, [h]);
  return { route, param };
}

function Breadcrumb({route, param}){
  const map = { engineers:"기술인", projects:"프로젝트" };
  const here = param ? `${map[route]||route} / ${param}` : (map[route]||route);
  return <div className="breadcrumb">홈 / {here}</div>;
}

export default function App(){
  const { route, param } = useRoute();
  let page = null;
  if(route==="engineers" && !param) page = <EngineersList/>;
  else if(route==="engineers" && param==="new") page = <EngineerDetail isNew={true}/>;
  else if(route==="engineers" && param) page = <EngineerDetail engId={param}/>;
  else if(route==="projects") page = <ProjectsList/>;
  else page = <Dashboard/>;

  return (
    <div className="app-shell">
      <div className="sidebar"><Sidebar/></div>
      <Header/>
      <div className="content">
        <div className="content-inner">
          <Breadcrumb route={route} param={param}/>
          {page}
        </div>
      </div>
    </div>
  );
}
