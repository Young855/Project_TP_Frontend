import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import FavoriteCreate from "./FavoriteCreate";
import FavoriteDetail from "./FavoriteDetail";
import FavoriteEdit from "./FavoriteEdit";
import FavoriteList from "./FavoriteList";

const pageWrap = {
  minHeight: "calc(100vh - 120px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const card = {
  width: "100%",
  maxWidth: 960,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  padding: 24,
};

const header = { textAlign: "center", marginBottom: 16 };
const small = { color: "#777", display: "block", marginTop: 6 };
const nav = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  marginBottom: 16,
};

export default function FavoritePage({ userId }) {
  return (
    <div style={pageWrap}>
      <div style={card}>
        {/* 헤더 */}
        <header style={header}>
          <h1 style={{ fontSize: 22, margin: 0 }}>찜 목록</h1>

        </header>

        {/* 상단 네비게이션 탭 */}
        <nav style={nav}>
          <Tab to="/?focus=search">추가</Tab>
        </nav>

        {/* 하위 라우트 영역 */}
        <Routes>
          <Route index element={<FavoriteList userId={userId} />} />
          <Route path="create" element={<Navigate to="/?focus=search" replace />} />
          <Route path=":id" element={<FavoriteDetail userId={userId} />} />
          <Route path=":id/edit" element={<FavoriteEdit userId={userId} />} />
          <Route path="*" element={<Navigate to="/favorites" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function Tab({ to, end, children }) {
  const baseStyle = {
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    border: "1px solid #e5e7eb",
    color: "#374151",
    fontWeight: 600,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        ...baseStyle,
        backgroundColor: isActive ? "#f3f4f6" : "#fff",
      })}
    >
      {children}
    </NavLink>
  );
}
