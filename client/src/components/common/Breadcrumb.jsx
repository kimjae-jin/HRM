import React, { useEffect, useState } from "react";

function makeTrailFromHash(hash) {
  const items = ["홈"];
  if (hash.startsWith("#/engineers")) items.push("기술인");
  else if (hash.startsWith("#/engineer/")) items.push("기술인", "상세");
  else if (hash.startsWith("#/projects")) items.push("프로젝트(개발중)");
  else if (hash.startsWith("#/edu")) items.push("교육훈련(개발중)");
  else if (hash.startsWith("#/quals")) items.push("자격사항(개발중)");
  else if (hash.startsWith("#/licenses")) items.push("업/면허(개발중)");
  else if (hash.startsWith("#/finance")) items.push("청구/재무(개발중)");
  else if (hash.startsWith("#/partners")) items.push("관계사(개발중)");
  return items;
}

export default function Breadcrumb() {
  const [hash, setHash] = useState(window.location.hash || "#/engineers");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/engineers");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const trail = makeTrailFromHash(hash);

  return (
    <div className="breadcrumb">
      <a href="#/engineers" className="crumb">홈</a>
      {trail.slice(1).map((t, i) => (
        <span key={i}>
          <span className="crumb-sep"> / </span>
          <span className="crumb">{t}</span>
        </span>
      ))}
    </div>
  );
}
