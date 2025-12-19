import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFavorites, removeFavorite } from "../../api/favoriteAPI";
import { getAccommodationPhotoBlobUrl } from "../../api/accommodationPhotoAPI";

// ✅ 찜 목록 대표사진 src 결정
function resolveFavoriteThumbnailSrc(fav) {
  // 1) photoId 계열(대표 → 메인 → 썸네일 우선)
  const photoId =
    fav?.representPhotoId ??
    fav?.mainPhotoId ??
    fav?.thumbnailPhotoId ??
    fav?.thumbPhotoId ??
    fav?.photoId ??
    fav?.thumbnailId ??
    null;

  if (photoId != null && String(photoId).trim().length > 0) {
    return getAccommodationPhotoBlobUrl(photoId);
  }

  // 2) url 계열(문자열 URL이 내려오는 경우)
  const url =
    fav?.thumbnailUrl ??
    fav?.thumbnailImageUrl ??
    fav?.imageUrl ??
    fav?.photoUrl ??
    fav?.mainImageUrl ??
    null;

  if (typeof url === "string" && url.trim().length > 0) {
    return url;
  }

  return null;
}

export default function FavoriteList({ userId }) {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const list = await getFavorites(userId);
      const normalized = (list ?? []).map((fav) => ({
        ...fav,
        isActive: true,
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
  }, [userId]);

  const handleUnfavorite = async (favorite) => {
    setFavorites((prev) =>
      prev.map((f) =>
        f.favoriteId === favorite.favoriteId ? { ...f, isActive: false } : f
      )
    );

    try {
      await removeFavorite(userId, favorite.accommodationId);
      alert("찜 목록에서 삭제되었습니다.");
      await fetchFavorites();
    } catch (err) {
      alert("찜 해제 실패: " + (err.message || ""));
      setFavorites((prev) =>
        prev.map((f) =>
          f.favoriteId === favorite.favoriteId ? { ...f, isActive: true } : f
        )
      );
    }
  };

  if (loading) return <p>찜 목록을 불러오는 중...</p>;
  if (!loading && favorites.length === 0) return <p>찜한 숙소가 없습니다.</p>;

  return (
    <div className="space-y-4">
      {favorites.map((fav) => {
        const name =
          fav.accommodationName || fav.name || `숙소 #${fav.accommodationId}`;
        const address = fav.address || "주소 정보 없음";
        const reviewScore = fav.reviewScore;
        const reviewCount = fav.reviewCount;
        const minPrice = fav.minPrice;
        const isActive = fav.isActive !== false;

        const thumbSrc = resolveFavoriteThumbnailSrc(fav);

        return (
          <div
            key={fav.favoriteId}
            className={`flex gap-4 p-4 border border-gray-200 rounded-xl bg-gray-100 hover:bg-gray-200 hover:shadow-md transition-all ${
              isActive ? "" : "opacity-70"
            }`}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (fav.accommodationId != null) {
                navigate(`/accommodation/${fav.accommodationId}?userId=${userId}`);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (fav.accommodationId != null) {
                  navigate(`/accommodation/${fav.accommodationId}?userId=${userId}`);
                }
              }
            }}
          >
            {/* 썸네일 */}
            <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {thumbSrc ? (
                <img
                  src={thumbSrc}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentAccommodation.src = "/placeholder-room.jpg";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 내용 */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col items-start">
                  <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
                  <p className="mt-1 text-sm text-gray-600">{address}</p>

                  {reviewScore != null && (
                    <div className="mt-2 flex items-center text-sm text-gray-700">
                      <span className="mr-1">★</span>
                      <span className="font-medium mr-1">{reviewScore}</span>
                      {reviewCount != null && (
                        <span className="text-gray-500">({reviewCount})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 하트 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfavorite(fav);
                  }}
                  aria-label={isActive ? "찜 해제" : "이미 해제된 찜"}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:border-red-400 hover:bg-red-50 bg-white"
                >
                  <span className={`text-xl ${isActive ? "text-red-500" : "text-gray-400"}`}>
                    {isActive ? "❤" : "♡"}
                  </span>
                </button>
              </div>

              <div className="mt-4 flex justify-end items-center text-sm text-gray-700">
                {minPrice != null ? (
                  <span>
                    1박 최저가
                    <span className="ml-2 font-semibold">
                      {minPrice.toLocaleString()}원
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-500">가격 정보 없음</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
