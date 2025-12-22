import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUrlUser } from "../hooks/useUrlUser";

// Hooks
import { useAccommodationFilter } from "../hooks/useAccommodationFilter";
import { useAccommodationFavorites } from "../hooks/useAccommodationFavorites";
import { useAccommodationImages } from "../hooks/useAccommodationImages";

// Components
import SearchFilterSidebar from "../components/common/searches/SearchFilterSidebar";
import AccommodationCard from "../components/common/searches/AccommodationCard";

// Constants & API
import { SORT_OPTIONS } from "../constants/SearchOption.js"; // 파일명 SearchOption.js (s 없음) 주의
import { calculateTotalPrices } from "../api/accommodationPriceAPI";

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useLocation();
  const { userId } = useUrlUser();

  // state가 없거나 새로고침 등으로 유실되었을 때를 대비한 기본값 처리
  const originalResults = state?.results || [];
  const criteria = state?.criteria || {};

  // 계산된 총 가격을 저장할 State
  const [calculatedPriceMap, setCalculatedPriceMap] = useState({});

  // 1. URL 동기화 로직 (페이지 진입시 쿼리 파라미터 세팅)
  useEffect(() => {
    if (!criteria?.checkIn || !criteria?.checkOut) return;

    const params = new URLSearchParams(location.search);

    if (!params.get("checkIn")) params.set("checkIn", criteria.checkIn);
    if (!params.get("checkOut")) params.set("checkOut", criteria.checkOut);

    const guests = criteria?.guests ?? criteria?.totalGuests;
    if (guests != null && !params.get("guests")) params.set("guests", String(guests));

    if (userId && !params.get("userId")) params.set("userId", String(userId));

    const nextSearch = `?${params.toString()}`;
    if (nextSearch === location.search) return;

    navigate(
      { pathname: location.pathname, search: nextSearch },
      { replace: true, state }
    );
  }, [criteria, location.pathname, location.search, navigate, state, userId]);

  // 2. 필터 Custom Hook 호출 (displayResults가 여기서 생성됩니다)
  // [중요] useEffect보다 먼저 호출되어야 합니다.
  const {
    excludeSoldOut, setExcludeSoldOut,
    selectedType, setSelectedType,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    selectedTags, setSelectedTags,
    selectedCommonFacilities, setSelectedCommonFacilities,
    selectedRoomFacilities, setSelectedRoomFacilities,
    sortOption, setSortOption,
    toggleInSet,
    resetFilters,
    displayResults // 필터링된 결과 리스트
  } = useAccommodationFilter(originalResults);

  // 3. 가격 계산 API 호출 (displayResults가 생성된 후 실행)
  useEffect(() => {
    // 날짜가 없거나 숙소가 없으면 계산 안 함
    if (!criteria.checkIn || !criteria.checkOut || displayResults.length === 0) {
      return;
    }

    // 현재 화면에 나온 숙소 ID들만 수집
    const ids = displayResults.map((p) => Number(p.accommodationId));

    // API 호출
    calculateTotalPrices(ids, criteria.checkIn, criteria.checkOut)
      .then((priceList) => {
        const newMap = {};
        priceList.forEach((item) => {
          if (item.available) {
            newMap[item.accommodationId] = item.totalPrice;
          }
        });
        setCalculatedPriceMap(newMap);
      })
      .catch((err) => {
        console.error("가격 계산 실패:", err);
      });
  }, [displayResults, criteria.checkIn, criteria.checkOut]);

  // 4. 나머지 Custom Hooks 호출
  // 찜하기 로직
  const { favoriteMap, toggleFavorite } = useAccommodationFavorites(userId);

  // 이미지 로딩 로직
  const { photoUrlMap } = useAccommodationImages(displayResults);

  // 5. 페이지 이동 핸들러
  const handleGoDetail = (accommodationId) => {
    const params = new URLSearchParams(location.search);

    if (criteria?.checkIn && !params.get("checkIn")) params.set("checkIn", criteria.checkIn);
    if (criteria?.checkOut && !params.get("checkOut")) params.set("checkOut", criteria.checkOut);

    const guests = criteria?.guests ?? criteria?.totalGuests;
    if (guests != null && !params.get("guests")) params.set("guests", String(guests));

    if (userId && !params.get("userId")) params.set("userId", String(userId));

    const qs = params.toString();
    navigate(`/accommodation/${accommodationId}${qs ? `?${qs}` : ""}`);
  };

  // 6. 예외 처리 (검색 데이터 없음)
  if (!state) {
    return (
      <div className="p-8 text-center text-gray-500">
        메인 페이지에서 검색 후 다시 방문해 주세요.
      </div>
    );
  }

  const titleText = criteria.destination
    ? `'${criteria.destination}' 검색 결과 ${displayResults.length}개`
    : `숙소 검색 결과 ${displayResults.length}개`;

  // 7. 렌더링
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        
        {/* 좌측 필터 사이드바 */}
        <SearchFilterSidebar
          excludeSoldOut={excludeSoldOut}
          setExcludeSoldOut={setExcludeSoldOut}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          selectedCommonFacilities={selectedCommonFacilities}
          setSelectedCommonFacilities={setSelectedCommonFacilities}
          selectedRoomFacilities={selectedRoomFacilities}
          setSelectedRoomFacilities={setSelectedRoomFacilities}
          toggleInSet={toggleInSet}
          resetFilters={resetFilters}
        />

        {/* 우측 검색 결과 영역 */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">{titleText}</h1>
          </div>

          <div className="flex items-center justify-end -mt-11 mb-4">
            <div className="relative inline-block text-sm">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none border border-gray-300 rounded-md py-1.5 pl-3 pr-8 bg-white text-gray-700 hover:border-gray-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {displayResults.length === 0 ? (
            <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">
              조건에 맞는 숙소가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {displayResults.map((p) => {
                const accommodationId = Number(p.accommodationId);
                const calculatedTotalPrice = calculatedPriceMap[accommodationId];
                const displayPrice = (calculatedTotalPrice === 0) 
                    ? "예약가능한 객실이 없습니다" 
                    : calculatedTotalPrice;
                return (
                  <AccommodationCard
                    key={accommodationId}
                    data={p}
                    photoUrl={photoUrlMap[accommodationId]}
                    isFavorite={favoriteMap[accommodationId]}
                    onToggleFavorite={(e) => toggleFavorite(e, accommodationId)}
                    onClick={() => handleGoDetail(accommodationId)}
                    totalPrice={displayPrice}
                    checkIn={criteria.checkIn}
                    checkOut={criteria.checkOut}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}