import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";

// 상단 옵션 & 상수
// 왼쪽 필터의 숙소 유형 라디오 버튼 목록
// label은 화면에 보이는 한글, value는 실제 필터에 사용되는 값
const PROPERTY_TYPE_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "호텔", value: "HOTEL" },
  { label: "펜션", value: "PENSION" },
  { label: "게스트하우스", value: "GUESTHOUSE" },
  { label: "리조트", value: "RESORT" },
];

// 정렬 옵션 (여기어때 느낌)
const SORT_OPTIONS = [
  { label: "추천순", value: "RECOMMENDED" },
  { label: "평점 높은순", value: "RATING_DESC" },
  { label: "리뷰 많은순", value: "REVIEW_DESC" },
  { label: "낮은 가격순", value: "PRICE_ASC" },
  { label: "높은 가격순", value: "PRICE_DESC" },
];

// #취향 / 공용시설 / 객실 내 시설 / 기타 시설 버튼에 쓰이는 문자열들
const HASHTAG_OPTIONS = [
  "#가족여행숙소",
  "#스파",
  "#파티룸",
  "#OTT",
];

const COMMON_FACILITY_OPTIONS = [
  "사우나",
  "수영장",
  "바베큐",
  "레스토랑",
  "피트니스",
  "공용주방",
  "매점",
];

const ROOM_FACILITY_OPTIONS = [
  "스파/월풀",
  "객실스파",
  "미니바",
  "무선인터넷",
  "에어컨",
  "욕실용품",
  "개인금고",
];

const ETC_FACILITY_OPTIONS = [
  "조식제공",
  "무료주차",
  "반려견동반",
  "객실내취사",
  "캠프파이어",
];

// 가격 슬라이더 전체 구간 : 0 ~ 50만
// 왼쪽 원은 최대 40만원까지, 오른쪽 원은 최소 3만원까지 내려갈 수 있게 제한
const MIN_PRICE = 0;
const MAX_PRICE = 500000;
const PRICE_STEP = 10000;

const LEFT_HANDLE_MAX = 400000; // 왼쪽 원이 갈 수 있는 최대값 : 40만원
const RIGHT_HANDLE_MIN = 30000; // 오른쪽 원이 갈 수 있는 최소값 : 3만원

// 특정 숙소의 "대표 가격"을 하나 뽑는 헬퍼 (필터/정렬에서 같이 사용)
function getPriceValue(p) {
  const v = p.minPrice ?? p.pricePerNight ?? p.price ?? p.lowestPrice;
  return typeof v === "number" ? v : null;
}

// PriceRangeSlider 설명
// 부모(SearchResultPage) 에서 내려주는 값
// min, max : 전체 슬라이더 구간(0 ~ 500000)
// step : 1만원 단위 스텝
// minValue, maxValue : 현재 선택된 최소 / 최대 가격
// onChange(newMin, newMax) : 핸들 드래그할 때 호출해서 부모 state 업데이트하는 콜백

// 내부 상태 & 퍼센트 변환
// trackRef : 슬라이더 트랙 <div> DOM 잡으려고 쓰는 ref
// dragding : 지금 드래그 중인 핸들 종류
// toPercent : 실제 값을 0~100% 위치로 변환해서 CSS left/width 계산할 때 사용
function PriceRangeSlider({ min, max, step, minValue, maxValue, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null); // 'min' | 'max' | null

  const toPercent = (value) => ((value - min) / (max - min)) * 100;

  // 드래그 로직(useEffect)
  // 마우스 / 손가락의 X 좌표를 갖고온다.
  // 트랙의 왼쪽 기준으로 얼마나 이동했는지 비율(ratio) 계산 -> 0 ~ 1 사이로 clamp
  // 그 비율을 가격값으로 환산하고 (min ~ max 사이), 스텝(1만) 단위로 반올림
  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      let ratio = (clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));

      let value = min + (max - min) * ratio;
      value = Math.round(value / step) * step;

      if (dragging === "min") {
        value = Math.max(min, value);
        value = Math.min(value, maxValue);
        value = Math.min(value, LEFT_HANDLE_MAX);
        onChange(value, maxValue);
      } else if (dragging === "max") {
        value = Math.min(value, max);
        value = Math.max(value, minValue);
        value = Math.max(value, RIGHT_HANDLE_MIN);
        onChange(minValue, value);
      }
    };

    const stopDrag = () => setDragging(null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", stopDrag);
    window.addEventListener("touchcancel", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", stopDrag);
      window.removeEventListener("touchcancel", stopDrag);
    };
  }, [dragging, min, max, step, minValue, maxValue, onChange]);

  const minPercent = toPercent(minValue);
  const maxPercent = toPercent(maxValue);

  return (
    <div className="mt-2">
      <div ref={trackRef} className="relative h-10 w-4/5">
        {/* 회색 전체 트랙 */}
        <div className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 rounded-full bg-gray-200" />
        {/* 파란 선택 구간 */}
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-blue-500"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* 왼쪽 흰 원 */}
        <button
          type="button"
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `calc(${minPercent}% - 0.625rem)`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            boxShadow: "0 0 4px rgba(0,0,0,0.15)",
          }}
          onMouseDown={() => setDragging("min")}
          onTouchStart={(e) => {
            e.preventDefault();
            setDragging("min");
          }}
        />

        {/* 오른쪽 흰 원 */}
        <button
          type="button"
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `calc(${maxPercent}% - 0.625rem)`,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            boxShadow: "0 0 4px rgba(0,0,0,0.15)",
          }}
          onMouseDown={() => setDragging("max")}
          onTouchStart={(e) => {
            e.preventDefault();
            setDragging("max");
          }}
        />
      </div>
    </div>
  );
}

// 기본 세팅 & 상태
// 메인 검색 페이지에서 navigate("/search-result", { state: {results, criteria }}) 이런 식으로 넘겨준 걸 받는 부분
// results: 백엔드에서 날아온 숙소 리스트 원본
//  ㄴ> results는 SearchResultPage.jsx 내부에 존재 x
//      AccomodationAPI를 검색 페이지에서 불러와서 SearchResultPage에 넘기는 구조
export default function SearchResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const originalResults = state?.results || [];
  const criteria = state?.criteria || {};

  // 🔹 필터 상태
  const [excludeSoldOut, setExcludeSoldOut] = useState(false);
  const [selectedType, setSelectedType] = useState("ALL");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const [selectedTags, setSelectedTags] = useState(new Set());
  const [selectedCommonFacilities, setSelectedCommonFacilities] = useState(
    new Set()
  );
  const [selectedRoomFacilities, setSelectedRoomFacilities] = useState(
    new Set()
  );
  const [selectedEtcFacilities, setSelectedEtcFacilities] = useState(
    new Set()
  );

  // 정렬 옵션 상태
  const [sortOption, setSortOption] = useState("RECOMMENDED");

  // 토글용 헬퍼
  const toggleInSet = (setFn, value) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  // 필터 초기화
  const resetFilters = () => {
    setExcludeSoldOut(false);
    setSelectedType("ALL");
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setSelectedTags(new Set());
    setSelectedCommonFacilities(new Set());
    setSelectedRoomFacilities(new Set());
    setSelectedEtcFacilities(new Set());
  };

  // 실제 필터링 + 정렬
  const displayResults = useMemo(() => {
    // 1차: 필터링
    let list = originalResults.filter((p) => {
      // 1) 매진 숙소 제외
      if (excludeSoldOut && p.isSoldOut === true) return false;

      // 2) 숙소 유형
      if (selectedType !== "ALL") {
        if ((p.propertyType || "").toUpperCase() !== selectedType) {
          return false;
        }
      }

      // 3) 가격 필터
      const price = getPriceValue(p);
      if (price != null) {
        if (price < minPrice || price > maxPrice) return false;
      }

      // 4) #취향 태그
      if (selectedTags.size > 0) {
        const tags = p.tags || p.hashtags || [];
        const tagNames = tags.map((t) =>
          typeof t === "string" ? t : t.name || t.label || ""
        );
        for (const need of selectedTags) {
          if (!tagNames.includes(need)) return false;
        }
      }

      // 5) 시설 (amenities)
      const amenities = Array.isArray(p.amenities)
        ? p.amenities.map((a) =>
            typeof a === "string" ? a : a.name || a.amenityName || ""
          )
        : [];

      if (selectedCommonFacilities.size > 0) {
        for (const need of selectedCommonFacilities) {
          if (!amenities.includes(need)) return false;
        }
      }
      if (selectedRoomFacilities.size > 0) {
        for (const need of selectedRoomFacilities) {
          if (!amenities.includes(need)) return false;
        }
      }
      if (selectedEtcFacilities.size > 0) {
        for (const need of selectedEtcFacilities) {
          if (!amenities.includes(need)) return false;
        }
      }

      return true;
    });

    // 2차: 정렬
    switch (sortOption) {
      case "RATING_DESC":
        list = [...list].sort(
          (a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0)
        );
        break;
      case "REVIEW_DESC": {
        const getReview = (x) =>
          x.reviewCount ?? x.reviewCnt ?? x.reviewTotal ?? 0;
        list = [...list].sort((a, b) => getReview(b) - getReview(a));
        break;
      }
      case "PRICE_ASC":
        list = [...list].sort((a, b) => {
          const pa = getPriceValue(a);
          const pb = getPriceValue(b);
          const va = pa == null ? Number.POSITIVE_INFINITY : pa;
          const vb = pb == null ? Number.POSITIVE_INFINITY : pb;
          return va - vb;
        });
        break;
      case "PRICE_DESC":
        list = [...list].sort((a, b) => {
          const pa = getPriceValue(a);
          const pb = getPriceValue(b);
          const va = pa == null ? Number.NEGATIVE_INFINITY : pa;
          const vb = pb == null ? Number.NEGATIVE_INFINITY : pb;
          return vb - va;
        });
        break;
      case "RECOMMENDED":
      default:
        // 원래 순서 유지
        break;
    }

    return list;
  }, [
    originalResults,
    excludeSoldOut,
    selectedType,
    minPrice,
    maxPrice,
    selectedTags,
    selectedCommonFacilities,
    selectedRoomFacilities,
    selectedEtcFacilities,
    sortOption,
  ]);

  const handleGoDetail = (propertyId) => {
    navigate(`/accommodation/${propertyId}`);
  };

  // 상단 검색 요약 버튼 클릭 시 -> 메인 페이지로 돌아가서 검색 수정
  const handleModifySearch = () => {
    navigate("/", { state: { criteria } });
  };

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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* 🔹 왼쪽 필터 영역 */}
        <aside className="w-64 bg-white rounded-xl shadow-sm p-4 h-fit sticky top-20 hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">필터</h2>
            <button
              onClick={resetFilters}
              className="px-2 py-1 test-sm text-gray-600 rounded-md hover:bg-gray-100 transition"
            >
              초기화
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={excludeSoldOut}
              onChange={(e) => setExcludeSoldOut(e.target.checked)}
            />
            <span>매진 숙소 제외</span>
          </label>

          {/* 숙소 유형 */}
          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-semibold mb-2">숙소 유형</h3>
            <div className="space-y-1 text-sm">
              {PROPERTY_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="propertyType"
                    value={opt.value}
                    checked={selectedType === opt.value}
                    onChange={() => setSelectedType(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 가격 */}
          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-semibold mb-2">가격 (1박 기준)</h3>
            <PriceRangeSlider
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={PRICE_STEP}
              minValue={minPrice}
              maxValue={maxPrice}
              onChange={(newMin, newMax) => {
                setMinPrice(newMin);
                setMaxPrice(newMax);
              }}
            />

            <div className="mt-2 text-xs text-gray-600">
              {minPrice.toLocaleString()}원 ~ {maxPrice.toLocaleString()}원
              {maxPrice === MAX_PRICE ? " 이상" : ""}
            </div>
          </div>

          {/* #취향 */}
          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-semibold mb-2">#취향</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              {HASHTAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInSet(setSelectedTags, tag)}
                  className={`px-2 py-1 rounded-full text-xs border ${
                    selectedTags.has(tag)
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 시설 */}
          <div className="border-t pt-3 mt-3 space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">공용 시설</h3>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {COMMON_FACILITY_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() =>
                      toggleInSet(setSelectedCommonFacilities, f)
                    }
                    className={`px-2 py-1 rounded-full text-xs border ${
                      selectedCommonFacilities.has(f)
                        ? "bg-blue-50 text-blue-600 border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-1">객실 내 시설</h3>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {ROOM_FACILITY_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() =>
                      toggleInSet(setSelectedRoomFacilities, f)
                    }
                    className={`px-2 py-1 rounded-full text-xs border ${
                      selectedRoomFacilities.has(f)
                        ? "bg-blue-50 text-blue-600 border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-1">기타 시설</h3>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {ETC_FACILITY_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleInSet(setSelectedEtcFacilities, f)}
                    className={`px-2 py-1 rounded-full text-xs border ${
                      selectedEtcFacilities.has(f)
                        ? "bg-blue-50 text-blue-600 border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 오른쪽 결과 리스트 영역 */}
        <section className="flex-1">
          {/* 상단: 제목 + 검색 요약 버튼 */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">{titleText}</h1>

           
          </div>

          {/* 두 번째 줄: 총 개수 + 정렬 드롭다운 */}
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
              {displayResults.map((p) => (
                <div
                  key={p.propertyId}
                  className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => handleGoDetail(p.propertyId)}
                >
                  {/* 썸네일 자리 (이미지 없으면 회색 박스) */}
                  <div className="w-full md:w-40 h-32 bg-gray-200 rounded-lg flex-shrink-0" />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {p.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {p.address} {p.city ? `(${p.city})` : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {p.propertyType}
                        {p.checkinTime && p.checkoutTime
                          ? ` · 체크인 ${p.checkinTime} / 체크아웃 ${p.checkoutTime}`
                          : ""}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        {p.ratingAvg != null ? (
                          <span className="font-semibold text-yellow-600">
                            ★{" "}
                            {p.ratingAvg.toFixed
                              ? p.ratingAvg.toFixed(1)
                              : p.ratingAvg}
                          </span>
                        ) : (
                          <span className="text-gray-400">평점 없음</span>
                        )}
                      </div>

                      <div className="text-right">
                        {/* 가격 필드가 있으면 보여주기 */}
                        {"minPrice" in p ||
                        "pricePerNight" in p ||
                        "price" in p ||
                        "lowestPrice" in p ? (
                          <div className="text-base font-bold text-blue-600">
                            {(
                              p.minPrice ??
                              p.pricePerNight ??
                              p.price ??
                              p.lowestPrice
                            ).toLocaleString()}
                            원
                            <span className="text-xs text-gray-500">
                              {" "}
                              / 1박
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            가격 정보 없음
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
