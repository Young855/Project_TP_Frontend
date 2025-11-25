import { Routes, Route, useNavigate, useSearchParams, Navigate } from "react-router-dom";

import FavoriteDetail from "./FavoriteDetail";
import FavoriteEdit from "./FavoriteEdit";
import FavoriteList from "./FavoriteList";

export default function FavoritePage({ userId: propUserId }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ?? 와 || 함께 쓸 때는 괄호로 감싸기
  const userId = (propUserId ?? searchParams.get("userId")) || 1;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">찜 목록</h1>

        <button
          className="btn-primary"
          onClick={() => navigate("/?focus=search")}
        >
          숙소 찾으러 가기
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <Routes>
          <Route index element={<FavoriteList userId={userId} />} />

          {/* create 라우트: 검색 페이지로 리다이렉트 */}
          <Route
            path="create"
            element={<Navigate to="/?focus=search" replace />}
          />

          <Route path=":id" element={<FavoriteDetail userId={userId} />} />
          <Route path=":id/edit" element={<FavoriteEdit userId={userId} />} />

          <Route path="*" element={<Navigate to="/favorites" replace />} />
        </Routes>
      </div>
    </div>
  );
}
