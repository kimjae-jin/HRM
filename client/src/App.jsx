import React, {useEffect, useState} from "react";
import Sidebar from "./components/layout/Sidebar";

// 기존 페이지들이 있는 경우 유지
import EngineersList from "./pages/engineers/EngineersList";
import EngineerDetail from "./pages/engineers/EngineerDetail";

// 임시(개발중) 페이지
const Placeholder = ({title}) => (
  <div className="page-wrap">
    <h1 className="page-title">{title}</h1>
    <p className="page-desc">기능 구현 중입니다. (엑셀 입/출력 & 상세 탭 구조는 기술인 페이지와 동일 컨셉로 진행)</p>
  </div>
);

// 간단 해시 라우터
function useHash(){
  const [hash, setHash] = useState(window.location.hash || "#/engineers");
  useEffect(()=>{
    const onChange = ()=> setHash(window.location.hash || "#/engineers");
    window.addEventListener("hashchange", onChange);
    return ()=> window.removeEventListener("hashchange", onChange);
  },[]);
  return hash;
}

function Breadcrumb({hash}){
  // "#/engineers/HOR-001" -> ['홈','기술인','HOR-001']
  const path = hash.replace(/^#\//,"").split("/").filter(Boolean);
  const crumbs = ["홈", ...path];
  return (
    <div className="breadcrumb">
      {crumbs.map((c,i)=>(
        <span key={i}>
          {i>0 && " / "}
          {c}
        </span>
      ))}
    </div>
  );
}

export default function App(){
  const hash = useHash();

  // 라우트 매칭
  let content = null;
  if (hash.startsWith("#/engineers/")) {
    // 상세: #/engineers/:id
    const engId = hash.split("/")[2] || "";
    content = <EngineerDetail engId={engId} />;
  } else if (hash.startsWith("#/engineers")) {
    content = <EngineersList />;
  } else if (hash.startsWith("#/projects")) {
    content = <Placeholder title="프로젝트 (개발중)" />;
  } else if (hash.startsWith("#/trainings")) {
    content = <Placeholder title="교육훈련 (개발중)" />;
  } else if (hash.startsWith("#/licenses")) {
    content = <Placeholder title="업/면허 (개발중)" />;
  } else if (hash.startsWith("#/finance")) {
    content = <Placeholder title="청구/재무 (개발중)" />;
  } else if (hash.startsWith("#/partners")) {
    content = <Placeholder title="관계사 (개발중)" />;
  } else if (hash.startsWith("#/tax")) {
    content = <Placeholder title="세금계산서 (개발중)" />;
  } else if (hash.startsWith("#/weekly")) {
    content = <Placeholder title="주간회의 (개발중)" />;
  } else {
    content = <EngineersList />;
  }

  return (
    <div className="app-shell">
      <Sidebar/>
      <main className="content">
        {/* 헤더를 별도 컴포넌트로 쓰고 있다면 그 자리에 Breadcrumb만 상단 박스로 노출 */}
        <div style={{padding:"10px 16px 0"}}>
          <Breadcrumb hash={hash}/>
        </div>
        <div className="content-inner">
          {content}
        </div>
      </main>
    </div>
  );
}
