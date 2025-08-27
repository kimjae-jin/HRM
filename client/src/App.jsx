import React, { useEffect, useMemo, useState } from "react";

// 고정 레이아웃 구성요소 (기존 파일 경로 유지)
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

// 엔지니어 페이지 (기존 파일 경로 유지)
import EngineersList from "./pages/engineers/EngineersList";
import EngineerDetail from "./pages/engineers/EngineerDetail";

/**
 * 라우터 없이 해시(#)로 페이징:
 *  - #/dashboard
 *  - #/engineers
 *  - #/engineers/ENG001
 *  - #/edu, #/資格 등 기타 메뉴는 "개발중" 표시
 */
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/dashboard");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/dashboard");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash;
}

function parseRoute(hash) {
  // 예) #/engineers/ENG001
  const cleaned = hash.replace(/^#/, "");
  const parts = cleaned.split("/").filter(Boolean); // ["engineers","ENG001"]
  const section = parts[0] || "dashboard";
  const param = parts[1] || null;
  return { section, param };
}

export default function App() {
  const hash = useHashRoute();
  const { section, param } = useMemo(() => parseRoute(hash), [hash]);

  // 레이아웃 스타일: 헤더/사이드바 고정, 메인만 스크롤 (원페이지 원칙)
  const layoutStyle = {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gridTemplateRows: "60px calc(100vh - 60px)",
    gridTemplateAreas: `
      "header header"
      "sidebar main"
    `,
    height: "100vh",
    background: "var(--background-color)",
    color: "var(--text-color)",
  };

  const headerStyle = { gridArea: "header", position: "sticky", top: 0, zIndex: 10 };
  const sidebarStyle = { gridArea: "sidebar", position: "sticky", top: 60, height: "calc(100vh - 60px)", overflow: "hidden" };
  const mainStyle = { gridArea: "main", overflow: "auto" }; // 메인만 스크롤

  // 페이지 스위치 (UI 변경 없음, 기존 페이지 그대로 연결)
  let content = null;
  if (section === "dashboard") {
    content = (
      <div style={{ padding: 16 }}>
        <h2>대시보드</h2>
        <div className="card" style={{ padding: 12, marginTop: 8 }}>
          모든 카테고리 이슈 상황판은 추후 연동 예정입니다. (개발중)
        </div>
      </div>
    );
  } else if (section === "engineers" && !param) {
    // 기술인 리스트
    content = <EngineersList />;
  } else if (section === "engineers" && param) {
    // 기술인 상세
    content = <EngineerDetail engId={param} />;
  } else {
    // 사이드바의 나머지 메뉴는 구조만 잡고 "개발중" 표기
    const pretty = {
      edu: "교육훈련",
      cert: "자격사항", // 기존 '면허' → '자격사항'으로 표기 변경
      biz: "업/면허",
      finance: "청구/재무",
      affiliates: "관계사",
      tax: "세금계산서",
      pq: "PQ",
      weekly: "주간회의",
      bidding: "입찰",
    }[section] || section;

    content = (
      <div style={{ padding: 16 }}>
        <h2>{pretty}</h2>
        <div className="card" style={{ padding: 12, marginTop: 8 }}>
          {pretty} 모듈은 현재 개발중입니다.
        </div>
      </div>
    );
  }

  return (
    <div style={layoutStyle}>
      <div style={headerStyle}>
        <Header />
      </div>

      <div style={sidebarStyle}>
        <Sidebar />
      </div>

      <main style={mainStyle}>
        {content}
      </main>
    </div>
  );
}
