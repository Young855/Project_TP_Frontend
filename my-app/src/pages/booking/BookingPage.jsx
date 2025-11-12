import { Routes, Route, Link } from "react-router-dom";
import BookingList from "./BookingList";
import BookingCreate from "./BookingCreate";
import BookingDetail from "./BookingDetail";


export default function BookingPage() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          padding: 24,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>예약</h2>
        <nav
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <Link to="">목록</Link>
          <Link to="new">새 예약</Link>
        </nav>

        <Routes>
          <Route index element={<BookingList />} />
          <Route path="new" element={<BookingCreate />} />
          <Route path=":id" element={<BookingDetail />} />
        </Routes>
      </div>
    </div>
  );
}
