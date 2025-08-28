import React from "react";

const items = [
  { key:"engineers", label:"기술인" },
  { key:"교육훈련", label:"교육훈련" },
  { key:"자격사항", label:"자격사항" },
  { key:"업면허", label:"업/면허" },
  { key:"청구재무", label:"청구/재무" },
  { key:"관계사", label:"관계사" },
  { key:"세금계산서", label:"세금계산서" },
  { key:"PQ", label:"PQ" },
  { key:"주간회의", label:"주간회의" },
  { key:"입찰", label:"입찰" },
];

export default function Sidebar({ route }){
  return (
    <aside className="sidebar">
      {items.map(it=>{
        const href = it.key==="engineers" ? "#/engineers" : `#/${it.key}`;
        const active = (route === it.key) || (route==="engineers" && it.key==="engineers");
        return <a key={it.key} href={href} className={`side-link ${active?"active":""}`}>• {it.label}</a>;
      })}
    </aside>
  )
}
