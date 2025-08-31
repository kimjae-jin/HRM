import React from "react";

const items = [
  { href:"#/engineers", label:"기술인" },
  { href:"#/projects",  label:"프로젝트 (개발중)" },
  { href:"#/trainings", label:"교육훈련 (개발중)" },
  { href:"#/licenses",  label:"업/면허 (개발중)" },
  { href:"#/finance",   label:"청구/재무 (개발중)" },
  { href:"#/partners",  label:"관계사 (개발중)" },
  { href:"#/tax",       label:"세금계산서 (개발중)" },
  { href:"#/weekly",    label:"주간회의 (개발중)" },
];

export default function Sidebar(){
  const hash = typeof window !== "undefined" ? window.location.hash || "#/engineers" : "#/engineers";
  return (
    <aside className="sidebar">
      <div className="nav-group">메뉴</div>
      <nav>
        {items.map(it=>{
          const active = hash.startsWith(it.href);
          return (
            <a key={it.href} className={`nav-item ${active?'active':''}`} href={it.href}>
              {it.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
