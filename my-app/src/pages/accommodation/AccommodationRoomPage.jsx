import { Routes, Route, Navigate } from "react-router-dom";
import AccommodationRoomDetail from "./AccommodationRoomDetail";

/**
 * /accommodation/* 아래 라우팅을 처리하는 페이지 래퍼
 * - App.jsx에서 path: 'accommodation/*' 로 위임받기 때문에
 *   여기서 ':id' 같은 하위 라우트를 반드시 잡아줘야 useParams()가 동작함.
 */
export default function AccommodationRoomPage() {
  // ✅ 가장 흔한 형태: localStorage에 userId 저장
  const userId = Number(localStorage.getItem("userId")) || 1;

  return (
    <Routes>
      {/* /accommodation/1 같은 상세 */}
      <Route path=":id" element={<AccommodationRoomDetail userId={userId} />} />

      {/* (선택) /accommodation 으로 들어오면 search-results로 보내거나, 목록 페이지로 연결 */}
      <Route path="" element={<Navigate to="/search-results" replace />} />
    </Routes>
  );
}
