import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUrlUser } from "../hooks/useUrlUser";

// Hooks
import { useAccommodationFilter } from "../hooks/useAccommodationFilter";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver"; 

// Components
import SearchFilterSidebar from "../components/common/searches/SearchFilterSidebar";
import AccommodationCard from "../components/common/searches/AccommodationCard";

// Constants & API
import { SORT_OPTIONS } from "../constants/SearchOption";
import { ACCOMMODATION_PHOTO_ENDPOINTS } from "../config"; 
import { calculateTotalPrices } from "../api/accommodationPriceAPI";
import { getFavoriteIdMap, addFavorite, removeFavorite } from "../api/favoriteAPI"; 
import { searchAccommodationsWithMainPhoto } from "../api/accommodationAPI"; 

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const { userId } = useUrlUser();

const criteria = useMemo(() => {
  const params = new URLSearchParams(location.search);
  return {
    destination: params.get("keyword") || state?.criteria?.destination || "",
    checkIn: params.get("checkIn") || state?.criteria?.checkIn || "",
    checkOut: params.get("checkOut") || state?.criteria?.checkOut || "",
    guests: params.get("guests") || state?.criteria?.guests || 2,
  };
}, [location.search, state]);



  // 2. 데이터 상태 관리
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);       
  const [isLast, setIsLast] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [calculatedPriceMap, setCalculatedPriceMap] = useState({});

  // ✅ criteria 변경 = 새 검색 → 상태 초기화
  useEffect(() => {
    setResults([]);
    setPage(0);
    setIsLast(false);
    setTotalCount(0);
    setCalculatedPriceMap({});
  }, [
    criteria.destination,
    criteria.checkIn,
    criteria.checkOut,
    criteria.guests,
  ]);

  // 3. 부가 정보 상태 관리
  const [favoriteMap, setFavoriteMap] = useState({});


  // ✅ page 또는 criteria 변경 시 검색 API 호출
  useEffect(() => {
    
    const fetchAccommodations = async () => {
      if (isLoading) return;
      if (!criteria.checkIn || !criteria.checkOut) return;

      setIsLoading(true);
      try {
        const searchParams = {
          keyword: criteria.destination || "",
          checkIn: criteria.checkIn,
          checkOut: criteria.checkOut,
          guests: criteria.guests,
        };
        
        const data = await searchAccommodationsWithMainPhoto(searchParams, page, 10);
        
        const newItems = data.content || [];

        setResults((prev) =>
          page === 0 ? newItems : [...prev, ...newItems]
        );

        setIsLast(!!data.last);
        if (page === 0) setTotalCount(data.totalElements || 0);
      } catch (error) {
        console.error("숙소 리스트 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccommodations();
  }, [
    page,
    criteria.destination,
    criteria.checkIn,
    criteria.checkOut,
    criteria.guests,
  ]);


  // -----------------------------------------------------------
  // [Logic C] 필터링 Hook
  // -----------------------------------------------------------
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
    displayResults 
  } = useAccommodationFilter(results);

  // -----------------------------------------------------------
  // [Logic D] 가격 및 찜 로딩
  // -----------------------------------------------------------
  
  // D-1. 가격 계산
  useEffect(() => {
    
    if (!criteria.checkIn || !criteria.checkOut || displayResults.length === 0) return;

    const idsToCalculate = displayResults
        .map(p => Number(p.accommodationId))
        // ★ 아래 줄을 추가하여 NaN이나 0, null 같은 잘못된 값을 걸러내세요.
        .filter(id => !isNaN(id) && id > 0) 
        .filter(id => calculatedPriceMap[id] === undefined);

    if (idsToCalculate.length === 0) return;

    calculateTotalPrices(idsToCalculate, criteria.checkIn, criteria.checkOut)
      .then((priceList) => {
        setCalculatedPriceMap((prev) => {
            const newMap = { ...prev };
            priceList.forEach((item) => {
                if (item.available) newMap[item.accommodationId] = item.totalPrice;
            });
            return newMap;
        });
      })
      .catch((err) => console.error("가격 계산 실패:", err));
  }, [displayResults, criteria.checkIn, criteria.checkOut]); // calculatedPriceMap 의존성 제거

  // D-2. 찜 목록 로딩
  useEffect(() => {
    if (userId) {
      getFavoriteIdMap(userId).then(setFavoriteMap);
    }
  }, [userId]);

  // -----------------------------------------------------------
  // [Logic E] 이벤트 핸들러
  // -----------------------------------------------------------
  const handleObserver = useCallback(() => {
    if (!isLoading && !isLast) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, isLast]);

  const observerRef = useIntersectionObserver(handleObserver);

  const handleGoDetail = (accommodationId) => {
    const params = new URLSearchParams(location.search);
    if (criteria.checkIn && !params.get("checkIn")) params.set("checkIn", criteria.checkIn);
    if (criteria.checkOut && !params.get("checkOut")) params.set("checkOut", criteria.checkOut);
    
    const qs = params.toString();
    navigate(`/accommodation/${accommodationId}${qs ? `?${qs}` : ""}`);
  };

  const handleToggleFavorite = async (e, accommodationId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    const isFav = !!favoriteMap[accommodationId];
    setFavoriteMap((prev) => ({ ...prev, [accommodationId]: !isFav }));

    try {
      if (isFav) {
        await removeFavorite(userId, accommodationId);
        alert("찜 목록에서 삭제되었습니다."); 
      } else {
        await addFavorite(userId, accommodationId);
        alert("찜 목록에 추가되었습니다."); 
      }
    } catch (error) {
      setFavoriteMap((prev) => ({ ...prev, [accommodationId]: isFav }));
      console.error(error);
      alert("요청 처리에 실패했습니다."); 
    }
  };
  const titleText = criteria.destination
    ? `'${criteria.destination}' 검색 결과 ${totalCount}개`
    : `숙소 검색 결과 ${totalCount}개`;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        <SearchFilterSidebar
          excludeSoldOut={excludeSoldOut} setExcludeSoldOut={setExcludeSoldOut}
          selectedType={selectedType} setSelectedType={setSelectedType}
          minPrice={minPrice} setMinPrice={setMinPrice}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          selectedTags={selectedTags} setSelectedTags={setSelectedTags}
          selectedCommonFacilities={selectedCommonFacilities} setSelectedCommonFacilities={setSelectedCommonFacilities}
          selectedRoomFacilities={selectedRoomFacilities} setSelectedRoomFacilities={setSelectedRoomFacilities}
          toggleInSet={toggleInSet} resetFilters={resetFilters}
        />

        <section className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">{titleText}</h1>
          </div>
          <div className="flex items-center justify-end -mt-11 mb-4">
             <div className="relative inline-block text-sm">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none border
                border-gray-300 rounded-md py-1.5 pl-3 pr-8 bg-white text-gray-700 
                hover:border-gray-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {displayResults.length === 0 && !isLoading ? (
            <div className="p-6 bg-white rounded-xl shadow text-center text-gray-500">
              조건에 맞는 숙소가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {displayResults.map((p) => {
                const accId = Number(p.accommodationId);
                const calculatedTotalPrice = calculatedPriceMap[accId];
                const displayPrice = (calculatedTotalPrice === 0) ? "예약 마감" : calculatedTotalPrice;
                const isFavorite = !!favoriteMap[accId];
                const photoUrl = p.mainPhotoId
                  ? ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(p.mainPhotoId)
                  : "/assets/default_hotel.png";

                return (
                  <AccommodationCard
                    key={accId}
                    data={p}
                    photoUrl={photoUrl} 
                    isFavorite={isFavorite}
                    onToggleFavorite={(e) => handleToggleFavorite(e, accId)}
                    onClick={() => handleGoDetail(accId)}
                    totalPrice={displayPrice}
                    checkIn={criteria.checkIn}
                    checkOut={criteria.checkOut}
                  />
                );
              })}
            </div>
          )}

          {!isLast && (
            <div ref={observerRef} className="h-20 flex justify-center items-center mt-4">
              {isLoading && <span className="text-gray-500">숙소를 불러오는 중...</span>}
            </div>
          )}
          {isLast && displayResults.length > 0 && (
             <div className="text-center text-gray-400 py-6 text-sm">모든 숙소를 확인했습니다.</div>
          )}
        </section>
      </div>
    </div>
  );
}