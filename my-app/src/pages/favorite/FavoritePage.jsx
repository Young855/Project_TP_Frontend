// src/pages/favorite/FavoritePage.jsx
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";

import FavoriteList from "./FavoriteList";
import { useUrlUser } from "../../hooks/useUrlUser";

// 찜 목록 최상위 페이지
// - URL: /favorites 또는 /favorites?userId=1 형식
// - 내부에서는 카드 형태의 FavoriteList만 사용
export default function FavoritePage({ userId: propUserId }) {
  const navigate = useNavigate();
  const { userId: urlUserId } = useUrlUser();

  const userId = Number(propUserId ?? urlUserId ?? 1);

  const handleGoToSearch = () => {
    // 메인 페이지로 바로 이동
    navigate(`/?userId=${userId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-10">
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">찜 목록</h1>
          <p className="mt-1 text-sm text-gray-500">
   
          </p>
        </div>
        <button
        type="button"
        onClick={handleGoToSearch}
        className="px-4 py-2 md:px-6 md:py-2.5 rounded-lg 
                    border border-blue-500 
                    text-blue-600 
                    text-sm md:text-base font-bold
                    bg-white hover:bg-blue-50 
                    transition-colors"
        >
        숙소 찾으러 가기
</button>
      </div>

      {/* 찜 목록 카드 리스트 */}
      <Routes>
        {/* 기본: /favorites → 나의 찜 목록 카드들 */}
        <Route index element={<FavoriteList userId={userId} />} />

        {/* 그 외 서브 경로는 전부 /favorites 루트로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/favorites" replace />} />
      </Routes>
    </div>
  );
}
