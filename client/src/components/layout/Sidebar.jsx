import React from "react";

const Ico = ({name})=>{
  // 모든 아이콘은 currentColor(단색) 사용
  const common = {viewBox:"0 0 24 24", width:18, height:18};
  switch(name){
    case "engineer": return (<svg {...common}><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2Z"/></svg>);
    case "folder": return (<svg {...common}><path d="M3 5h6l2 2h10v12a2 2 0 0 1-2 2H3zM3 19V7"/></svg>);
    case "cap": return (<svg {...common}><path d="M12 3 2 8l10 5 10-5-4-2v6h-2V6z"/></svg>);
    case "license": return (<svg {...common}><path d="M6 3h12a1 1 0 0 1 1 1v16l-7-3-7 3V4a1 1 0 0 1 1-1Z"/></svg>);
    case "money": return (<svg {...common}><path d="M3 7h18v10H3zM7 12h10M7 12a3 3 0 1 0 10 0"/></svg>);
    case "hand": return (<svg {...common}><path d="M3 12l4 8h10l4-8-9-2z"/></svg>);
    case "receipt": return (<svg {...common}><path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1zM8 7h8M8 11h8M8 15h6"/></svg>);
    case "chart": return (<svg {...common}><path d="M4 20V4M8 16v4M12 10v10M16 6v14M20 2v18"/></svg>);
    case "calendar": return (<svg {...common}><path d="M7 2v3m10-3v3M3 8h18v12H3z"/></svg>);
    case "tag": return (<svg {...common}><path d="M3 12V5h7l11 11-7 7zM8 8h.01"/></svg>);
    default: return (<svg {...common}><circle cx="12" cy="12" r="9"/></svg>);
  }
};

export default function Sidebar({ collapsed=false, onToggleCollapse=()=>{} }) {
  const Item = ({href, icon, label, active}) => (
    <li>
      <a className="nav-item" href={href} aria-current={active?'page':undefined}>
        <span className="ico"><Ico name={icon} /></span>
        <span className="label">{label}</span>
      </a>
    </li>
  );
  const hash = typeof window!=="undefined" ? window.location.hash : "#/engineers";

  return (
    <aside className="sidebar">
      <div className="toggle" title={collapsed?"펼치기":"접기"} onClick={onToggleCollapse}>
        {collapsed ? "»" : "«"}
      </div>

      <div className="section-title">메뉴</div>
      <ul className="nav-list">
        <Item href="#/engineers" icon="engineer" label="기술인"           active={hash.startsWith("#/engineers")} />
        <Item href="#/projects"  icon="folder"   label="(개발중) 프로젝트" />
        <Item href="#/training"  icon="cap"      label="(개발중) 교육훈련" />
        <Item href="#/licenses"  icon="license"  label="(개발중) 업/면허" />
        <Item href="#/finance"   icon="money"    label="(개발중) 청구/재무" />
        <Item href="#/partners"  icon="hand"     label="(개발중) 관계사" />
        <Item href="#/tax"       icon="receipt"  label="(개발중) 세금계산서" />
        <Item href="#/pq"        icon="chart"    label="(개발중) PQ" />
        <Item href="#/meetings"  icon="calendar" label="(개발중) 주간회의" />
        <Item href="#/bids"      icon="tag"      label="(개발중) 입찰" />
      </ul>
    </aside>
  );
}
