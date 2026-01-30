import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getFavorites, removeFavorite } from "../../api/favoriteAPI";
import { getAccommodationSummaries } from "../../api/accommodationAPI";
import { calculateTotalPrices } from "../../api/accommodationPriceAPI";
import { getAccommodationPhotoBlobUrl } from "../../api/accommodationPhotoAPI";

import AccommodationCard from "../../components/common/searches/AccommodationCard";

const STORAGE_KEY = "tp_search_criteria";

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

export default function FavoriteList({ userId }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ URL 파라미터
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlCheckIn = params.get("checkIn") || "";
  const urlCheckOut = params.get("checkOut") || "";
  const urlGuests = Number(params.get("guests")) || 2;

  // ✅ localStorage fallback
  const storageCriteria = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        checkIn: parsed.checkIn || "",
        checkOut: parsed.checkOut || "",
        guests: Number(parsed.guests) || 2,
      };
    } catch {
      return null;
    }
  }, []);

  // ✅ FavoriteList가 “실제로 사용할” 날짜/인원 (URL > storage > default)
  const checkIn = urlCheckIn || storageCriteria?.checkIn || getToday();
  const checkOut = urlCheckOut || storageCriteria?.checkOut || getTomorrow();
  const guests = urlGuests || storageCriteria?.guests || 2;

  const [loading, setLoading] = useState(true);

  // 1) favorites raw
  const [favorites, setFavorites] = useState([]);

  // 2) summaries (검색카드용 데이터)
  const [summaryItems, setSummaryItems] = useState([]);

  // 3) 날짜 기반 가격 맵
  const [calculatedPriceMap, setCalculatedPriceMap] = useState({});

  // ✅ URL이 비어있는데 Header는 날짜를 보여주는 상황을 막기 위해
  //    favorites 진입 시 URL을 자동으로 채움(replace)
  useEffect(() => {
    const hasUrlDates = !!urlCheckIn && !!urlCheckOut;
    if (hasUrlDates) return;

    const next = new URLSearchParams(location.search);
    next.set("checkIn", checkIn);
    next.set("checkOut", checkOut);
    next.set("guests", String(guests));

    // replace: 히스토리 깔끔하게
    navigate(`/favorites?${next.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCheckIn, urlCheckOut]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getFavorites(userId);
      setFavorites((list ?? []).map((x) => ({ ...x, isActive: true })));
    } catch (err) {
      console.error("찜 목록 불러오기 오류:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ✅ 찜 목록 로드
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // ✅ 찜된 accommodationId로 summaries 재조회
  useEffect(() => {
    const fetchSummaries = async () => {
      const ids = (favorites ?? [])
        .map((f) => Number(f.accommodationId))
        .filter((id) => Number.isFinite(id) && id > 0);

      if (ids.length === 0) {
        setSummaryItems([]);
        return;
      }

      try {
        const summaries = await getAccommodationSummaries(ids);

        // ids 순서대로 정렬 (API가 순서 보장 안 할 수 있음)
        const map = new Map((summaries ?? []).map((s) => [Number(s.accommodationId), s]));
        const ordered = ids.map((id) => map.get(id)).filter(Boolean);
        setSummaryItems(ordered);
      } catch (err) {
        console.error("찜 숙소 요약 조회 실패:", err);
        setSummaryItems([]);
      }
    };

    fetchSummaries();
  }, [favorites]);

  // ✅ 날짜가 있으면 SearchResultPage처럼 가격 계산
  // (이제 URL이 비어도 checkIn/checkOut fallback이 들어오므로 정상 계산됨)
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setCalculatedPriceMap({});
      return;
    }

    const idsToCalculate = (summaryItems ?? [])
      .map((p) => Number(p.accommodationId))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (idsToCalculate.length === 0) return;

    calculateTotalPrices(idsToCalculate, checkIn, checkOut)
      .then((priceList) => {
        const next = {};
        (priceList ?? []).forEach((item) => {
          if (item.available) next[item.accommodationId] = item.totalPrice;
          else next[item.accommodationId] = 0; // 예약불가
        });
        setCalculatedPriceMap(next);
      })
      .catch((err) => console.error("가격 계산 실패:", err));
  }, [summaryItems, checkIn, checkOut]);

  const handleUnfavorite = async (e, accommodationId) => {
    e.preventDefault();
    e.stopPropagation();

    // optimistic
    setFavorites((prev) =>
      prev.map((f) =>
        Number(f.accommodationId) === Number(accommodationId) ? { ...f, isActive: false } : f
      )
    );

    try {
      await removeFavorite(userId, accommodationId);
      alert("찜 목록에서 삭제되었습니다.");
      await fetchFavorites();
    } catch (err) {
      alert("찜 해제 실패: " + (err.message || ""));
      setFavorites((prev) =>
        prev.map((f) =>
          Number(f.accommodationId) === Number(accommodationId) ? { ...f, isActive: true } : f
        )
      );
    }
  };

  const handleGoDetail = (accommodationId) => {
    const qs = new URLSearchParams();
    qs.set("checkIn", checkIn);
    qs.set("checkOut", checkOut);
    qs.set("guests", String(guests));
    navigate(`/accommodation/${accommodationId}?${qs.toString()}`);
  };

  const renderCard = (p) => {
    const accId = Number(p.accommodationId);
    const totalPrice = calculatedPriceMap[accId];

    // ✅ 이제 날짜가 항상 있으므로 "날짜 선택 필요"가 뜰 일이 거의 없음
    let displayPrice = "요금 확인 중";
    if (!checkIn || !checkOut) displayPrice = "날짜 선택 필요";
    else if (totalPrice === 0) displayPrice = "예약 마감";
    else if (typeof totalPrice === "number") displayPrice = totalPrice;

    const photoUrl = p.mainPhotoId
      ? getAccommodationPhotoBlobUrl(p.mainPhotoId)
      : "/assets/default_hotel.png";

    return (
      <div key={`fav-acc-${accId}`} className="relative">
        <AccommodationCard
          data={p}
          photoUrl={photoUrl}
          isFavorite={true}
          onToggleFavorite={(e) => handleUnfavorite(e, accId)}
          onClick={() => handleGoDetail(accId)}
          totalPrice={displayPrice}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      </div>
    );
  };

  if (loading) return <p>찜 목록을 불러오는 중...</p>;
  if (!loading && (favorites?.length ?? 0) === 0) return <p>찜한 숙소가 없습니다.</p>;
  if (!loading && (summaryItems?.length ?? 0) === 0) return <p>찜 숙소 정보를 불러오지 못했습니다.</p>;

  return <div className="space-y-4">{summaryItems.map((p) => renderCard(p))}</div>;
}
