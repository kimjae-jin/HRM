import React, { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import EngineersList from "./pages/engineers/EngineersList";
import EngineerDetail from "./pages/engineers/EngineerDetail";
import EngineerForm from "./pages/engineers/EngineerForm";
import ProjectsList from "./pages/projects/ProjectsList";

function useHash(){
  const [h,setH]=useState(window.location.hash||"#/engineers");
  useEffect(()=>{
    const on=()=>setH(window.location.hash||"#/engineers");
    window.addEventListener("hashchange", on);
    return ()=>window.removeEventListener("hashchange", on);
  },[]);
  return [h,(to)=>{window.location.hash=to;}];
}

export default function App(){
  const [hash, go] = useHash();

  // 라우팅 파싱
  let page="engineers", params={};
  const m = hash.match(/^#\/([^\/]+)(?:\/(.*))?$/);
  if(m){ page=m[1]; params.rest = m[2]||""; }

  let content=null;
  if(page==="engineers"){
    if(params.rest==="new"){
      content=<EngineerForm onDone={(id)=>go(id?`#/engineers/${id}`:"#/engineers")} />;
    }else if(params.rest?.endsWith("/edit")){
      const id=params.rest.replace(/\/edit$/,"");
      content=<EngineerForm id={id} onDone={(eid)=>go(eid?`#/engineers/${eid}`:"#/engineers")} />;
    }else if(params.rest){
      content=<EngineerDetail engId={params.rest} go={go} />;
    }else{
      content=<EngineersList go={go} />;
    }
  }else if(page==="projects"){
    content=<ProjectsList />;
  }else{
    content=<EngineersList go={go} />;
  }

  return (
    <div className="layout">
      <Header />
      <Sidebar go={go} />
      <main className="app-main">
        {content}
      </main>
    </div>
  );
}
