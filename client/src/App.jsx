import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";

// Placeholder (개발중 페이지)
function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: "20px" }}>
      <h2>{title}</h2>
      <p>🚧 현재 개발중입니다.</p>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState("engineers");

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      setRoute(hash || "engineers");
    };
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  let content;
  switch (route) {
    case "engineers":
      content = <PlaceholderPage title="기술인 관리" />;
      break;
    case "training":
      content = <PlaceholderPage title="교육훈련 관리" />;
      break;
    case "qualifications":
      content = <PlaceholderPage title="자격사항 관리" />;
      break;
    case "bizlicenses":
      content = <PlaceholderPage title="업/면허 관리" />;
      break;
    case "finance":
      content = <PlaceholderPage title="청구/재무 관리" />;
      break;
    case "partners":
      content = <PlaceholderPage title="관계사 관리" />;
      break;
    case "invoices":
      content = <PlaceholderPage title="세금계산서 관리" />;
      break;
    case "pq":
      content = <PlaceholderPage title="PQ 관리" />;
      break;
    case "meetings":
      content = <PlaceholderPage title="주간회의 관리" />;
      break;
    case "bids":
      content = <PlaceholderPage title="입찰 관리" />;
      break;
    default:
      content = <PlaceholderPage title="대시보드" />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>{content}</main>
    </div>
  );
}
