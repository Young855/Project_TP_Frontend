// src/pages/favorite/FavoriteList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getFavorites, removeFavorite } from "../../api/favoriteAPI";
import { getAccommodationPhotoBlobUrl } from "../../api/accommodationPhotoAPI";
import { calculateTotalPrices } from "../../api/accommodationPriceAPI";

// ✅ 검색결과 카드 컴포넌트 재사용 (모양/위치 동일하게)
import AccommodationCard from "../../components/common/searches/AccommodationCard"; 
// ⚠️ 위 import 경로는 네 프로젝트 구조에 따라 다를 수 있음.
// SearchResultPage 기준 경로가 "./components/common/searches/AccommodationCard" 였으니까,
// FavoriteList가 있는 위치에 맞게 경로 맞춰줘.


// ✅ 찜 목록 대표사진 src 결정 (기존 로직 유지)
function resolveFavoriteThumbnailSrc(fav) {
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

  return "/assets/default_hotel.png";
}

export default function FavoriteList({ userId, checkIn, checkOut, guests }) {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 총액 맵 (accommodationId -> totalPrice)
  const [calculatedPriceMap, setCalculatedPriceMap] = useState({});

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

  // ✅ A안: checkIn/checkOut 있을 때만 검색결과와 동일한 총액 계산
  useEffect(() => {
    if (!checkIn || !checkOut) return;
    if (!favorites || favorites.length === 0) return;

    const idsToCalculate = favorites
      .map((f) => Number(f.accommodationId))
      .filter((id) => !isNaN(id) && id > 0)
      .filter((id) => calculatedPriceMap[id] === undefined);

    if (idsToCalculate.length === 0) return;

    calculateTotalPrices(idsToCalculate, checkIn, checkOut)
      .then((priceList) => {
        setCalculatedPriceMap((prev) => {
          const next = { ...prev };
          priceList.forEach((item) => {
            // SearchResultPage랑 동일: available이면 totalPrice, 아니면 0(예약마감 처리용)
            next[item.accommodationId] = item.available ? item.totalPrice : 0;
          });
          return next;
        });
      })
      .catch((err) => console.error("가격 계산 실패:", err));
  }, [favorites, checkIn, checkOut]); // calculatedPriceMap은 의존성에 넣지 않음(검색결과와 동일)

  const handleUnfavorite = async (e, favorite) => {
    e.preventDefault();
    e.stopPropagation();

    // optimistic
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

  const handleGoDetail = (accommodationId) => {
    const qs = new URLSearchParams();
    if (userId) qs.set("userId", String(userId));
    if (checkIn) qs.set("checkIn", checkIn);
    if (checkOut) qs.set("checkOut", checkOut);
    if (guests) qs.set("guests", String(guests));

    const query = qs.toString();
    navigate(`/accommodation/${accommodationId}${query ? `?${query}` : ""}`);
  };

  if (loading) return <p>찜 목록을 불러오는 중...</p>;
  if (!loading && favorites.length === 0) return <p>찜한 숙소가 없습니다.</p>;

  return (
    <div className="space-y-3">
      {favorites.map((fav) => {
        const accId = Number(fav.accommodationId);

        // ✅ AccommodationCard가 기대하는 data 형태로 normalize
        const data = {
          accommodationId: accId,
          name: fav.accommodationName || fav.name || `숙소 #${accId}`,
          address: fav.address || "주소 정보 없음",
          ratingAvg: fav.ratingAvg ?? fav.reviewScore ?? 0,
          accommodationType: fav.accommodationType ?? fav.type ?? "PENSION",
          checkinTime: fav.checkinTime ?? "15:00:00",
        };

        const photoUrl = resolveFavoriteThumbnailSrc(fav);

        // ✅ 총액 표시 (검색결과와 동일한 룰)
        const calculatedTotalPrice = calculatedPriceMap[accId];
        const displayPrice =
          calculatedTotalPrice === 0 ? "예약 마감" : calculatedTotalPrice;

        const isActive = fav.isActive !== false;
        if (!isActive) return null; // 삭제중이면 숨김 (기존 UX 유지)

        return (
          <AccommodationCard
            key={fav.favoriteId ?? accId}
            data={data}
            photoUrl={photoUrl}
            isFavorite={true}
            onToggleFavorite={(e) => handleUnfavorite(e, fav)}
            onClick={() => handleGoDetail(accId)}
            totalPrice={checkIn && checkOut ? displayPrice : "가격 정보 없음"}
            checkIn={checkIn}
            checkOut={checkOut}
          />
        );
      })}
    </div>
  );
}
