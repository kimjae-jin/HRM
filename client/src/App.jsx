import React, { useEffect, useMemo, useState } from "react";
import "./styles/App.css";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import EngineersList from "./pages/engineers/EngineersList";
import EngineerDetail from "./pages/engineers/EngineerDetail";

const Placeholder = ({title}) => (
  <div>
    <div className="content-header"><a href="#/">홈</a> / <b>{title}</b></div>
    <div className="panel" style={{padding:16}}>{title} (개발중)</div>
  </div>
);

function useHash(){
  const [h, setH] = useState(()=>window.location.hash || "#/engineers");
  useEffect(()=>{ const on=()=>setH(window.location.hash||"#/engineers"); window.addEventListener("hashchange", on); return ()=>window.removeEventListener("hashchange", on); },[]);
  return h;
}

export default function App(){
  const hash = useHash();
  const route = useMemo(()=>{
    const m = hash.match(/^#\/([^/]+)\/?([^/]+)?/); 
    return { path: m?.[1] || "engineers", id: m?.[2] };
  },[hash]);

  let page = null, crumb = null;
  switch(route.path){
    case "engineers":
      crumb = (<div className="content-header"><a href="#/">홈</a> / <b>기술인</b></div>);
      page = route.id ? <EngineerDetail engId={route.id}/> : <EngineersList/>;
      break;
    case "projects":  crumb=(<div className="content-header"><a href="#/">홈</a> / <b>프로젝트</b></div>); page=<Placeholder title="프로젝트"/>; break;
    case "trainings": crumb=(<div className="content-header"><a href="#/">홈</a> / <b>교육훈련</b></div>); page=<Placeholder title="교육훈련"/>; break;
    case "licenses":  crumb=(<div className="content-header"><a href="#/">홈</a> / <b>업/면허</b></div>); page=<Placeholder title="업/면허"/>; break;
    case "finance":   crumb=(<div className="content-header"><a href="#/">홈</a> / <b>청구/재무</b></div>); page=<Placeholder title="청구/재무"/>; break;
    case "partners":  crumb=(<div className="content-header"><a href="#/">홈</a> / <b>관계사</b></div>); page=<Placeholder title="관계사"/>; break;
    case "tax":       crumb=(<div className="content-header"><a href="#/">홈</a> / <b>세금계산서</b></div>); page=<Placeholder title="세금계산서"/>; break;
    case "weekly":    crumb=(<div className="content-header"><a href="#/">홈</a> / <b>주간회의</b></div>); page=<Placeholder title="주간회의"/>; break;
    default:          crumb=(<div className="content-header"><a href="#/">홈</a> / <b>알 수 없음</b></div>); page=<Placeholder title="알 수 없음"/>; break;
  }

  return (
    <div className="app-frame">
      <Header/>
      <Sidebar/>
      <main className="app-main">
        {crumb}
        {page}
      </main>
    </div>
  );
}
