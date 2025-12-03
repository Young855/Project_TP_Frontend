import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import AccommodationDetail from "./AccommodationRoomDetail";

export default function AccommodationPage({ userId: propUserId }) {
  const [searchParams] = useSearchParams();

  // FavoritePage랑 동일한 패턴
  const userId = (propUserId ?? searchParams.get("userId")) || 1;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Routes>
        {/* /accommodations/:id -> 상세 페이지 */}
        <Route path=":id" 
        element={<AccommodationDetail userId={userId} />} />

        {/* index는 검색 페이지로 돌려보냄 (원하면 수정) */}
        <Route
          index 
          element={<Navigate to="/?focus=search" replace />}
        />

        {/* 그 외 잘못된 경로도 검색으로 보냄 */}
        <Route
          path="*"
          element={<Navigate to="/?focus=search" replace />}
        />
      </Routes>
    </div>
  );
}
