import React from "react";

export default function Sidebar() {
  const menus = [
    { key: "dashboard", label: "대시보드" },
    { key: "engineers", label: "기술인" },
    { key: "training", label: "교육훈련" },
    { key: "qualifications", label: "자격사항" },
    { key: "bizlicenses", label: "업/면허" },
    { key: "finance", label: "청구/재무" },
    { key: "partners", label: "관계사" },
    { key: "invoices", label: "세금계산서" },
    { key: "pq", label: "PQ" },
    { key: "meetings", label: "주간회의" },
    { key: "bids", label: "입찰" },
  ];

  return (
    <div style={{
      width: "220px",
      background: "var(--sidebar-bg, #2c3e50)",
      color: "#fff",
      padding: "20px"
    }}>
      <h3 style={{ marginBottom: "20px" }}>HRM System</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {menus.map(m => (
          <li key={m.key} style={{ margin: "10px 0" }}>
            <a
              href={`#${m.key}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {m.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
