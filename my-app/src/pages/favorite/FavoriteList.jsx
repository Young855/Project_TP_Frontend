// src/pages/favorite/FavoriteList.jsx
import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../../api/favoriteAPI";

export default function FavoriteList({ userId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 찜 목록 불러오기
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const list = await getFavorites(userId);
      // 화면 상태용 isActive 플래그를 붙여서 관리한다.
      const normalized = (list ?? []).map((fav) => ({
        ...fav,
        isActive: true, // 처음엔 전부 "찜된 상태"로 보이게
      }));
      setFavorites(normalized);
    } catch (err) {
      console.error("목록 불러오기 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // userId가 바뀌면 다시 조회
  }, [userId]);

  // 찜 해제 버튼 클릭
  const handleUnfavorite = async (favorite) => {
    // 1차로 UI만 회색 하트로 바꿔준다. (낙관적 업데이트)
    setFavorites((prev) =>
      prev.map((f) =>
        f.favoriteId === favorite.favoriteId ? { ...f, isActive: false } : f
      )
    );

    try {
      // 실제 서버에서는 찜 삭제
      await removeFavorite(userId, favorite.accommodationId);
      // 여기서는 목록에서 제거하지 않는다.
      // → 새로고침 또는 페이지 다시 들어왔을 때 getFavorites() 결과에서 아예 사라진다.
    } catch (err) {
      alert("찜 해제 실패: " + (err.message || ""));
      // 실패 시 다시 빨간 하트로 롤백
      setFavorites((prev) =>
        prev.map((f) =>
          f.favoriteId === favorite.favoriteId ? { ...f, isActive: true } : f
        )
      );
    }
  };

  if (loading) {
    return <p>찜 목록을 불러오는 중...</p>;
  }

  if (!loading && favorites.length === 0) {
    return <p>찜한 숙소가 없습니다.</p>;
  }

  // SearchResultPage 에서 쓰는 숙소 요약 필드 이름에 맞춰서 사용하면 된다.
  // 예시는 propertyName, address, thumbnailUrl, reviewScore, reviewCount, minPrice 기준.
  return (
    <div className="space-y-4">
      {favorites.map((fav) => {

        const name = fav.accommodationName || fav.name || `숙소 #${fav.accommodationName}`;
        const address = fav.address || "주소 정보 없음";
        const thumbnailUrl = fav.thumbnailUrl;
        const reviewScore = fav.reviewScore;
        const reviewCount = fav.reviewCount;
        const minPrice = fav.minPrice; // 없으면 "가격 정보 없음" 표시
        const isActive = fav.isActive !== false; // 기본값 true

        return (
          <div
            key={fav.favoriteId}
            className={`flex gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow ${
              isActive ? "" : "opacity-70"
            }`}
          >
            {/* 썸네일 영역 */}
            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* 텍스트 + 하트 버튼 영역 */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{address}</p>

                  {/* 필요하면 타입/체크인/체크아웃 정보 등 SearchResultPage 와 맞춰서 추가 */}
                  {reviewScore != null && (
                    <div className="mt-2 flex items-center text-sm text-gray-700">
                      <span className="mr-1">★</span>
                      <span className="font-medium mr-1">{reviewScore}</span>
                      {reviewCount != null && (
                        <span className="text-gray-400">({reviewCount})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 우상단 하트 (찜 해제 버튼) */}
                <button
                  type="button"
                  onClick={() => handleUnfavorite(fav)}
                  aria-label={isActive ? "찜 해제" : "이미 해제된 찜"}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-red-400 hover:bg-red-50"
                >
                  <span
                    className={`text-xl leading-none ${
                      isActive ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {isActive ? "❤" : "♡"}
                  </span>
                </button>
              </div>

              {/* 가격 영역 */}
              <div className="mt-4 flex justify-end items-center text-sm text-gray-700">
                {minPrice != null ? (
                  <span>
                    1박 최저가
                    <span className="ml-2 font-semibold">
                      {minPrice.toLocaleString()}원
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-400">가격 정보 없음</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
