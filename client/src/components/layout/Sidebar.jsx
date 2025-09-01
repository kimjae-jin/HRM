import React, { useMemo } from "react";

const items = [
  { key:"engineers",  label:"기술인",           href:"#/engineers",   dev:false,  ico:"👤" },
  { key:"projects",   label:"프로젝트",         href:"#/projects",    dev:true,   ico:"📁" },
  { key:"trainings",  label:"교육훈련",         href:"#/trainings",   dev:true,   ico:"🎓" },
  { key:"licenses",   label:"업/면허",          href:"#/licenses",    dev:true,   ico:"🪪" },
  { key:"finance",    label:"청구/재무",        href:"#/finance",     dev:true,   ico:"💳" },
  { key:"partners",   label:"관계사",           href:"#/partners",    dev:true,   ico:"🏢" },
  { key:"tax",        label:"세금계산서",       href:"#/tax",         dev:true,   ico:"🧾" },
  { key:"weekly",     label:"주간회의",         href:"#/weekly",      dev:true,   ico:"🗓️" },
];

export default function Sidebar(){
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const activeKey = useMemo(() => {
    const m = hash.match(/^#\/([^/?]+)/);
    return m ? m[1] : "engineers";
  }, [hash]);

  return (
    <aside className="sidebar">
      <div className="brand">HRM</div>

      <div className="nav-group-title">메뉴</div>
      <ul className="nav-list" role="navigation" aria-label="주요 메뉴">
        {items.map(it => {
          const active = hash.startsWith(it.href);
          return (
            <li className="nav-item" key={it.key}>
              <a className={`nav-link${active ? " active":""}`} href={it.href}>
                <span className="nav-ico" aria-hidden>{it.ico}</span>
                <span>{it.label}</span>
                {it.dev && <span className="nav-badge">(개발중)</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
