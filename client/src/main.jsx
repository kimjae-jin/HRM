import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// 전역 스타일이 있다면 여기서 import
// import "./styles/App.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
