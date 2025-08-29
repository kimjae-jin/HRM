import React from "react";

export default function BreadcrumbBar({ text="Home" }){
  return (
    <div className="page-head">
      <div className="breadcrumb">{text}</div>
    </div>
  );
}
