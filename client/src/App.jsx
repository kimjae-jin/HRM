import React, { useEffect, useMemo, useState } from "react";
import "./styles/App.css";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

// 이미 존재하는 페이지는 그대로 사용
import EngineersList from "./pages/engineers/EngineersList";
import EngineerDetail from "./pages/engineers/EngineerDetail";

// 아직 개발 전인 페이지는 '개발중' 플레이스홀더
const Placeholder = ({title}) => (
  <div>
    <div className="content-header"><a href="#/">홈</a> / <b>{title}</b></div>
    <div className="table-wrap" style={{padding:16}}> {title} (개발중) </div>
  </div>
);

// 간단 해시 라우터
function useHash(){
  const [h, setH] = useState(()=>window.location.hash || "#/engineers");
  useEffect(()=>{
    const on = ()=> setH(window.location.hash || "#/engineers");
    window.addEventListener("hashchange", on);
    return ()=> window.removeEventListener("hashchange", on);
  },[]);
  return h;
}

export default function App(){
  const hash = useHash();
  const route = useMemo(()=>{
    const [_, path, id] = (hash.match(/^#\/([^/]+)\/?([^/]+)?/)||[]);
    return {path: path||"engineers", id};
  },[hash]);

  const Content = useMemo(()=>{
    switch(route.path){
      case "engineers":
        if(route.id){ return ()=><EngineerDetail engId={route.id}/>; }
        return ()=><div>
          <div className="content-header"><a href="#/">홈</a> / <b>기술인</b></div>
          <EngineersList/>
        </div>;
      case "projects":   return ()=><Placeholder title="프로젝트"/>;
      case "trainings":  return ()=><Placeholder title="교육훈련"/>;
      case "licenses":   return ()=><Placeholder title="업/면허"/>;
      case "finance":    return ()=><Placeholder title="청구/재무"/>;
      case "partners":   return ()=><Placeholder title="관계사"/>;
      case "tax":        return ()=><Placeholder title="세금계산서"/>;
      case "weekly":     return ()=><Placeholder title="주간회의"/>;
      default:           return ()=><Placeholder title="알 수 없는 경로"/>;
    }
  },[route]);

  return (
    <div className="app-frame">
      <Header/>
      <Sidebar/>
      <main className="app-main">
        <Content/>
      </main>
    </div>
  );
}
