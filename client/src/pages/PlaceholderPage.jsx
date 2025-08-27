import React from "react";

const TITLE_MAP = {
  dashboard:  "대시보드",
  trainings:  "교육훈련",
  licenses:   "업/면허",
  billing:    "청구/재무",
  affiliates: "관계사",
  tax:        "세금계산서",
  pq:         "PQ",
  weekly:     "주간회의",
  bids:       "입찰",
};

export default function PlaceholderPage({ titleKey = "dashboard" }) {
  const title = TITLE_MAP[titleKey] || titleKey;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{title}</div>
      <div className="muted">개발중</div>
    </div>
  );
}
