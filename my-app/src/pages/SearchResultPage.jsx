import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Hooks
import { useAccommodationFilter } from "../hooks/useAccommodationFilter";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver"; 

// Components
import SearchFilterSidebar from "../components/common/searches/SearchFilterSidebar";
import AccommodationCard from "../components/common/searches/AccommodationCard";

// Constants & API
import { SORT_OPTIONS } from "../constants/SearchOption";
import { calculateTotalPrices } from "../api/accommodationPriceAPI";
import { getFavoriteIdMap, addFavorite, removeFavorite } from "../api/favoriteAPI"; 
import { searchAccommodationsWithMainPhoto, getAccommodationSummaries } from "../api/accommodationAPI"; 
import { getAccommodationPhotoBlobUrl } from "../api/accommodationPhotoAPI"; 

// [변경] getUserByAccount 제거
// import { getUserByAccount } from "../api/userAPI"; 

// AI & User Preference API
import { getAiRecommendations } from "../api/recommendationAPI";
import { getUserPreference } from "../api/userPrefAPI"; 

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useLocation();
  
  // [변경] localStorage에서 userId를 바로 읽어와 초기값 설정 (동기 처리)
  // 이제 "확인 중" 단계가 없으므로 AI 추천이 깜빡임 없이 바로 실행됩니다.
  const [realUserId] = useState(() => {
    const savedId = localStorage.getItem("userId");
    return savedId ? Number(savedId) : null;
  });

  // 1. 초기 데이터 설정
  const params = new URLSearchParams(location.search);
  const initialCriteria = {
    destination: params.get("keyword") || state?.criteria?.destination || "",
    checkIn: params.get("checkIn") || state?.criteria?.checkIn || "",
    checkOut: params.get("checkOut") || state?.criteria?.checkOut || "",
    guests: params.get("guests") || state?.criteria?.guests || state?.criteria?.totalGuests || 2,
  };

  const [criteria] = useState(initialCriteria);

  // 2. 데이터 상태 관리
  const [results, setResults] = useState([]); 
  const [page, setPage] = useState(0);        
  const [isLoading, setIsLoading] = useState(false);
  const [isLast, setIsLast] = useState(false); 
  const [totalCount, setTotalCount] = useState(0);

  // AI 추천 관련 상태
  const [aiDisplayItems, setAiDisplayItems] = useState([]); 
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 부가 정보 상태
  const [calculatedPriceMap, setCalculatedPriceMap] = useState({});
  const [favoriteMap, setFavoriteMap] = useState({});

  // [삭제] AccountId로 User를 조회하던 useEffect 제거
  /* useEffect(() => { ... }, []); */

  // -----------------------------------------------------------
  // [Logic A] AI 추천 로직
  // -----------------------------------------------------------
useEffect(() => {
    if (!criteria.destination) return;

    const fetchAiData = async () => {
      setIsAiLoading(true);
      setAiDisplayItems([]); 

      let userPreferenceText = "";
      // 추가 옵션 객체 초기화
      let searchOptions = {
        accommodationType: null,
        minPrice: 0,
        maxPrice: 0
      };

      if (realUserId) {
        try {
          const prefData = await getUserPreference(realUserId);
          if (prefData) {
            // 1. 취향 텍스트 설정
            userPreferenceText = prefData.preferenceText || "";
            
            // 2. 추가 데이터(타입, 예산) 설정
            searchOptions = {
                accommodationType: prefData.accommodationType || null,
                minPrice: prefData.minBudget || 0,
                maxPrice: prefData.maxBudget || 0
            };
          }
        } catch (prefError) {
          console.warn("유저 취향 정보 없음 (기본 추천 모드로 진행)");
        }
      }

      try {
        // 3. 변경된 API 호출 (옵션 전달)
        const recommendedIds = await getAiRecommendations(
            criteria.destination, 
            userPreferenceText,
            searchOptions // 옵션 객체 전달
        );

        if (recommendedIds && recommendedIds.length > 0) {
            const idsToQuery = recommendedIds.map(item => {
                return typeof item === 'object' ? (item.accommodationId || item.id) : item;
            });
            console.log("AI 추천 ID 목록 변환:", idsToQuery);

            const summaries = await getAccommodationSummaries(idsToQuery);
            setAiDisplayItems(summaries);
        }
      } catch (error) {
        console.error("AI 추천 로직 실패:", error);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiData();
  }, [criteria.destination, realUserId]);

  // -----------------------------------------------------------
  // [Logic B] 기본 숙소 검색 데이터 페칭 (기존 동일)
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchAccommodations = async () => {
      if (isLoading) return; 
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
        setResults((prev) => page === 0 ? newItems : [...prev, ...newItems]);
        setIsLast(data.last);
        if (page === 0) setTotalCount(data.totalElements);
      } catch (error) {
        console.error("숙소 리스트 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccommodations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); 


  // -----------------------------------------------------------
  // [Logic C] 필터링 Hook (기존 동일)
  // -----------------------------------------------------------
  const {
    excludeSoldOut, setExcludeSoldOut, selectedType, setSelectedType,
    minPrice, setMinPrice, maxPrice, setMaxPrice,
    selectedTags, setSelectedTags,
    selectedCommonFacilities, setSelectedCommonFacilities,
    selectedRoomFacilities, setSelectedRoomFacilities,
    sortOption, setSortOption, toggleInSet, resetFilters, displayResults 
  } = useAccommodationFilter(results);


  // -----------------------------------------------------------
  // [Logic D] 가격 및 찜 목록 로딩
  // -----------------------------------------------------------
  useEffect(() => {
    if (!criteria.checkIn || !criteria.checkOut) return;
    const allItems = [...displayResults, ...aiDisplayItems];
    if (allItems.length === 0) return;

    const idsToCalculate = allItems
        .map(p => Number(p.accommodationId))
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
  }, [displayResults, aiDisplayItems, criteria.checkIn, criteria.checkOut]);

  // 찜 목록 조회
  useEffect(() => {
    if (realUserId) {
      getFavoriteIdMap(realUserId).then(setFavoriteMap);
    } else {
      setFavoriteMap({});
    }
  }, [realUserId]);


  // -----------------------------------------------------------
  // [Logic E] 이벤트 핸들러 & 렌더링 헬퍼
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
    e.preventDefault(); e.stopPropagation();
    
    if (!realUserId) {
        if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
          navigate("/user/login"); 
        }
        return;
    }

    const isFav = !!favoriteMap[accommodationId];
    setFavoriteMap((prev) => ({ ...prev, [accommodationId]: !isFav }));

    try {
      if (isFav) {
        await removeFavorite(realUserId, accommodationId);
        alert("찜 목록에서 삭제되었습니다.");
      } else {
        await addFavorite(realUserId, accommodationId);
        alert("찜 목록에 추가되었습니다.");
      }
    } catch (error) {
      console.error("찜 처리 실패:", error);
      setFavoriteMap((prev) => ({ ...prev, [accommodationId]: isFav }));
      alert("처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const renderCard = (p) => {
    const accId = Number(p.accommodationId);
    const calculatedTotalPrice = calculatedPriceMap[accId];
    const displayPrice = (calculatedTotalPrice === 0) ? "예약 마감" : (calculatedTotalPrice || "요금 확인 중");
    const isFavorite = !!favoriteMap[accId];

    const photoUrl = p.mainPhotoId
      ? getAccommodationPhotoBlobUrl(p.mainPhotoId)
      : "/assets/default_hotel.png";

    return (
      <AccommodationCard
        key={`acc-${accId}`}
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
  };

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
          {/* AI 추천 섹션 */}
          {(isAiLoading || aiDisplayItems.length > 0) && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 mb-8">
              <div className="mb-4">
                 <h3 className="font-bold text-lg text-blue-600 flex items-center gap-2">
                   ✨ {realUserId ? "AI 맞춤 추천" : "인기 숙소 추천"}
                 </h3>
                 <p className="text-sm text-gray-500 mt-1">
                   {realUserId 
                     ? "고객님의 여행 취향을 분석하여 딱 맞는 숙소를 찾아냈어요." 
                     : "여행객들에게 가장 사랑받는 인기 숙소들을 만나보세요."}
                 </p>
              </div>

              {isAiLoading ? (
                 <div className="py-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg animate-pulse">
                    AI가 숙소를 분석하고 있습니다... 🤖
                 </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                    {aiDisplayItems.map(p => (
                         <div key={p.accommodationId} className="border-2 border-blue-100 rounded-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg z-10 font-bold">
                                AI Pick
                            </div>
                            {renderCard(p)}
                         </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* 일반 검색 결과 */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 border-b pb-2 gap-2">
            <h1 className="text-xl font-bold text-gray-800">
                {criteria.destination 
                    ? `'${criteria.destination}' 검색 결과 ${totalCount}개` 
                    : `숙소 검색 결과 ${totalCount}개`}
            </h1>
             <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none border border-gray-300 rounded-md py-2 pl-3 pr-8 bg-white text-sm text-gray-700 hover:border-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: `right 0.5rem center`,
                backgroundRepeat: `no-repeat`,
                backgroundSize: `1.5em 1.5em`
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {displayResults.length === 0 && !isLoading ? (
            <div className="py-12 bg-white rounded-xl shadow text-center text-gray-500">
              <p className="text-lg">조건에 맞는 숙소가 없습니다.</p>
              <p className="text-sm mt-2">다른 날짜나 지역으로 검색해보세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayResults.map((p) => renderCard(p))}
            </div>
          )}

          {!isLast && (
            <div ref={observerRef} className="h-20 flex justify-center items-center mt-6">
              {isLoading && <span className="text-gray-500 font-medium">숙소를 더 불러오는 중...</span>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}