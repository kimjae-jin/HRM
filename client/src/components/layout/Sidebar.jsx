import React, { useMemo } from "react";

const NAV = [
  { key:"engineers",  label:"기술인",     href:"#/engineers",  dev:false, icon:"user" },
  { key:"projects",   label:"프로젝트",   href:"#/projects",   dev:true,  icon:"folder" },
  { key:"trainings",  label:"교육훈련",   href:"#/trainings",  dev:true,  icon:"grad" },
  { key:"licenses",   label:"업/면허",    href:"#/licenses",   dev:true,  icon:"id" },
  { key:"finance",    label:"청구/재무",  href:"#/finance",    dev:true,  icon:"card" },
  { key:"partners",   label:"관계사",     href:"#/partners",   dev:true,  icon:"bldg" },
  { key:"tax",        label:"세금계산서", href:"#/tax",        dev:true,  icon:"bill" },
  { key:"weekly",     label:"주간회의",   href:"#/weekly",     dev:true,  icon:"cal" },
];

function Ico({name,size=18}){
  const p={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true};
  switch(name){
    case "user":   return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "folder": return <svg {...p}><path d="M3 7h5l2 2h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
    case "grad":   return <svg {...p}><path d="M22 10L12 15 2 10l10-5 10 5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>;
    case "id":     return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="12" r="3"/><path d="M14 8h5M14 12h5M14 16h5"/></svg>;
    case "card":   return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
    case "bldg":   return <svg {...p}><rect x="3" y="3" width="7" height="18"/><rect x="14" y="7" width="7" height="14"/><path d="M3 9h7M14 13h7"/></svg>;
    case "bill":   return <svg {...p}><path d="M4 2h12l4 4v16H4z"/><path d="M14 2v6h6M7 13h10M7 17h10M7 9h3"/></svg>;
    case "cal":    return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>;
    default: return null;
  }
}

export default function Sidebar(){
  const hash = typeof window!=="undefined" ? window.location.hash : "#/engineers";
  const activeKey = useMemo(()=> (hash.match(/^#\/([^/?]+)/)?.[1] ?? "engineers"), [hash]);
  return (
    <aside className="sidebar">
      <ul className="nav-list">
        {NAV.map(n=>{
          const active = activeKey===n.key;
          return (
            <li key={n.key} className="nav-item">
              <a className={`nav-link${active?' active':''}`} href={n.href}>
                <span className="nav-ico"><Ico name={n.icon}/></span>
                <span>{n.label}</span>
                {n.dev && <span className="nav-badge">(개발중)</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
