import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import { addFavorite, getFavorites, removeFavorite } from "../api/favoriteAPI";
import { useUrlUser } from "../hooks/useUrlUser";
import { getAccommodationPhotoBlobUrl, getAccommodationPhotos } from "../api/accommodationPhotoAPI";

// 상단 옵션 & 상수
const ACCOMMODATION_TYPE_OPTIONS = [
  { label: "전체", value: "ALL" },
  { label: "호텔", value: "HOTEL" },
  { label: "펜션", value: "PENSION" },
  { label: "게스트하우스", value: "GUESTHOUSE" },
  { label: "리조트", value: "RESORT" },
];

const SORT_OPTIONS = [
  { label: "추천순", value: "RECOMMENDED" },
  { label: "평점 높은순", value: "RATING_DESC" },
  { label: "리뷰 많은순", value: "REVIEW_DESC" },
  { label: "낮은 가격순", value: "PRICE_ASC" },
  { label: "높은 가격순", value: "PRICE_DESC" },
];


const HASHTAG_OPTIONS = ["#가족여행숙소", "#스파", "#파티룸", "#OTT"];

const COMMON_FACILITY_OPTIONS = [
  "사우나",
  "수영장",
  "바베큐",
  "레스토랑",
  "피트니스",
  "공용주방",
  "매점",
  "조식제공",
  "무료주차",
  "반려견동반",
  "객실내취사",
  "캠프파이어",
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

const MIN_PRICE = 0;
const MAX_PRICE = 500000;
const PRICE_STEP = 10000;

const LEFT_HANDLE_MAX = 400000;
const RIGHT_HANDLE_MIN = 30000;

// "숙소 요약 DTO" 안에서 대표사진 ID를 최대한 유연하게 찾기
function getRepresentativePhotoId(p) {
  return (
    p?.representPhotoId ??
    p?.mainPhotoId ??
    p?.thumbnailPhotoId ??
    p?.thumbPhotoId ??
    p?.photoId ??
    p?.thumbnailId ??
    null
  );
}

// 사진 메타데이터 리스트에서 대표 사진 1장 ID 고르기 (프론트에서만 보강)
function pickRepresentativePhotoIdFromMeta(list) {
  if (!Array.isArray(list) || list.length === 0) return null;

  const rep =
    list.find((x) => x?.isRepresentative === true) ||
    list.find((x) => x?.representative === true) ||
    list.find((x) => x?.isRepresent === true) ||
    list.find((x) => x?.represent === true) ||
    list.find((x) => x?.isMain === true) ||
    list.find((x) => x?.main === true) ||
    list.find((x) => x?.isThumbnail === true) ||
    list.find((x) => x?.thumbnail === true) ||
    null;

  const chosen = rep ?? list[0];

  // 백엔드마다 필드명이 다를 수 있어서 최대한 넓게 커버
  return (
    chosen?.photoId ??
    chosen?.id ??
    chosen?.accommodationPhotoId ??
    chosen?.accommodationPhotoID ??
    chosen?.photo_id ??
    null
  );
}

function getPriceValue(p) {
  const v = p.minPrice ?? p.pricePerNight ?? p.price ?? p.lowestPrice;
  return typeof v === "number" ? v : null;
}

function PriceRangeSlider({ min, max, step, minValue, maxValue, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const toPercent = (value) => ((value - min) / (max - min)) * 100;

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      const clientX = e.clientX;
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
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging, min, max, step, minValue, maxValue, onChange]);

  const minPercent = toPercent(minValue);
  const maxPercent = toPercent(maxValue);

  return (
    <div className="mt-2">
      <div ref={trackRef} className="relative h-10 w-4/5">
        <div className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 rounded-full bg-gray-200" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-blue-500"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

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

export default function SearchResultPage() {
  const navigate = useNavigate();
  const location = useLocation
  const { state } = useLocation();
  const { userId } = useUrlUser();
  const originalResults = state?.results || [];
  const criteria = state?.criteria || {};

  useEffect(() => {
  // criteria가 없으면 스킵
  if (!criteria?.checkIn || !criteria?.checkOut) return;

  const params = new URLSearchParams(location.search);

  // URL에 없으면 criteria로 채움
  if (!params.get("checkIn")) params.set("checkIn", criteria.checkIn);
  if (!params.get("checkOut")) params.set("checkOut", criteria.checkOut);

  const guests = criteria?.guests ?? criteria?.totalGuests;
  if (guests != null && !params.get("guests")) params.set("guests", String(guests));

  if (userId && !params.get("userId")) params.set("userId", String(userId));

  const nextSearch = `?${params.toString()}`;

  // 이미 같은 쿼리면 무한루프 방지
  if (nextSearch === location.search) return;

  navigate(
    { pathname: location.pathname, search: nextSearch },
    { replace: true, state }
  );
}, [criteria, location.pathname, location.search, navigate, state, userId]);


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

  const [sortOption, setSortOption] = useState("RECOMMENDED");

  // 찜 상태를 저장하는 상태값
  const [favoriteMap, setFavoriteMap] = useState({});

  // 대표사진 URL 캐시: { [accommodationId]: "blobUrl" | null }
  const [photoUrlMap, setPhotoUrlMap] = useState({});

  // 최초 페이지 진입 시 찜 목록 불러오는 로직
  // 1. URL에서 userId 추출
  // 2. getFavorites(userId) 호출
  // 3. 결과를 { accommodation: true } 형태로 변환
  // 4. favoriteMap 세팅
  // -> 페이지 새로고침 시 찜 상태가 유지되는 이유

  useEffect(() => {
    const uid = Number(userId);
    if (!Number.isFinite(uid)) {
      console.warn("[찜] userId 파싱 실패:", userId);
      return;
    }

    (async () => {
      try {
        const list = await getFavorites(uid);
        const nextMap = {};
        (list ?? []).forEach((fav) => {
          const aid = Number(fav?.accommodationId);
          if (Number.isFinite(aid)) nextMap[aid] = true;
        });
        setFavoriteMap(nextMap);
      } catch (err) {
        console.error("찜 목록 불러오기 실패:", err);
      }
    })();
  }, [userId]);

  const toggleInSet = (setFn, value) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const resetFilters = () => {
    setExcludeSoldOut(false);
    setSelectedType("ALL");
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setSelectedTags(new Set());
    setSelectedCommonFacilities(new Set());
    setSelectedRoomFacilities(new Set());
  };

  const displayResults = useMemo(() => {
    let list = originalResults.filter((p) => {
      if (excludeSoldOut && p.isSoldOut === true) return false;

      if (selectedType !== "ALL") {
        if ((p.accommodationType || "").toUpperCase() !== selectedType) {
          return false;
        }
      }

      const price = getPriceValue(p);
      if (price != null) {
        if (price < minPrice || price > maxPrice) return false;
      }

      if (selectedTags.size > 0) {
        const tags = p.tags || p.hashtags || [];
        const tagNames = tags.map((t) =>
          typeof t === "string" ? t : t.name || t.label || ""
        );
        for (const need of selectedTags) {
          if (!tagNames.includes(need)) return false;
        }
      }

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

      return true;
    });

    switch (sortOption) {
      case "RATING_DESC":
        list = [...list].sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
        break;
      case "REVIEW_DESC": {
        const getReview = (x) => x.reviewCount ?? x.reviewCnt ?? x.reviewTotal ?? 0;
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
    sortOption,
  ]);

  // ✅ 대표사진: (1) 결과 DTO에 photoId가 있으면 그걸 사용
  //            (2) 없으면 프론트에서 getAccommodationPhotos(accommodationId)로 메타를 가져와 대표사진 1장을 고름
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const tasks = (displayResults ?? [])
          .filter((p) => p?.accommodationId != null)
          .map(async (p) => {
            const accommodationId = p.accommodationId;

            // 1) DTO에서 바로 찾기
            let photoId = getRepresentativePhotoId(p);

            // 2) 없으면 메타 호출해서 1장 고르기
            if (!photoId) {
              try {
                const meta = await getAccommodationPhotos(accommodationId);
                photoId = pickRepresentativePhotoIdFromMeta(meta);
              } catch (e) {
                // 메타 실패면 null 유지
              }
            }

            const url = photoId ? getAccommodationPhotoBlobUrl(photoId) : null;
            return [accommodationId, url];
          });

        const settled = await Promise.allSettled(tasks);
        const next = {};
        for (const r of settled) {
          if (r.status === "fulfilled") {
            const [accommodationId, url] = r.value;
            next[accommodationId] = url;
          }
        }

        if (!cancelled) setPhotoUrlMap(next);
      } catch (err) {
        console.error("대표사진 로딩 실패:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [displayResults]);

const handleGoDetail = (accommodationId) => {
  const params = new URLSearchParams(location.search);

  // SearchResultPage는 URL에 날짜가 없을 수 있으니(criteria에서 보강)
  if (criteria?.checkIn && !params.get("checkIn")) params.set("checkIn", criteria.checkIn);
  if (criteria?.checkOut && !params.get("checkOut")) params.set("checkOut", criteria.checkOut);

  // 인원도 필요하면 같이(네 criteria에 키가 guests/totalGuests 등일 수 있음)
  const guests = criteria?.guests ?? criteria?.totalGuests;
  if (guests != null && !params.get("guests")) params.set("guests", String(guests));

  // userId도 유지 (현재 URL이 /search-results?userId=1 이니까)
  if (userId && !params.get("userId")) params.set("userId", String(userId));

  const qs = params.toString();
  navigate(`/accommodation/${accommodationId}${qs ? `?${qs}` : ""}`);
};

  // 하트 클릭 시 동작 로직
  const toggleFavorite = async (e, accommodationId) => { // 현재 숙소가 찜 상태인지 확인해서 
                                                         // 아니면 addFavorite 호출(찜 추가)
                                                         // 맞으면 removeFavorite 호출(찜 해제)
                                                         // 하고서 UI는 먼저 바꿔놓고 결과에 따라 동기화 및 롤백

    e.preventDefault();         // 기본 동작 막기 (예 : 버튼이 폼 submit 같은 걸 유발하는 상황 방지) 예시 설명
    e.stopPropagation();        // 부모 클릭 이벤트로 "전파"되는걸 차단
                                // - onClick={() => handleGoDetail(accommodationId)}로 상세 페이지 이동이 걸려있다. 
                                // - 그래서 하트를 누를 때 상세 페이지로 튕지기 않게 막는 용도 
                                // 이거도 다시 설명 부탁

    // URL에서 뽑은 userId가 숫자로 변환 가능한지 확인
    // 숙소 ID도 숫자인지 확인
    // 여기서 걸리면 API를 아예 안 쏜다 -> 불필요한 500/400 방지
    const uid = Number(userId);
    const aid = Number(accommodationId);

    if (!Number.isFinite(uid)) {
      alert("userId가 없어서 찜을 처리할 수 없습니다. (?userId=1 확인)");
      return;
    }
    if (!Number.isFinite(aid)) return;

    // "현재 찜 상태" 판단 기준
    // - DB를 직접 보는게 아니라
    // - 프론트 상태를 보고 "지금 찜인가?" 판단
    // - favoriteMap[2] === true -> currentlyFavorite = true (찜 ON)
    // - 없으면/false면 -> currentlyFavorite = false (찜 OFF\)
    const currentlyFavorite = !!favoriteMap[aid];

    // 1. UI 먼저 바꾼다
    // - 하트를 누르는 순간
    //   - 찜이었으면 -> UI는 먼저 회색으로 바뀐다
    //   - 찜이 아니었으면 -> UI는 먼저 빨강으로 바뀐다
    // 즉, API 결과를 기다리지 않고 UI를 선반영 하는 구조 
    setFavoriteMap((prev) => ({
      ...prev,
      [aid]: !currentlyFavorite,
    }));
    try {
      // 2. 실제 서버에 찜 추가 및 해제 요청
      // - currentlyFavorite이 false면 -> addFavorite 호출
      // - currentlyFavorite이 true면 -> removeFavorite 호출
      // - 여기서 500이 나면 catch로 떨어진다 
      if (!currentlyFavorite) {
        await addFavorite(uid, aid);
        alert("찜 목록에 추가 되었습니다.");
      } else {
        await removeFavorite(uid, aid);
        alert("찜 목록에서 삭제 되었습니다.");
      }

      // 3. 서버 기준으로 한 번 더 찜 목록 동기화
      // - "프론트가 생각하는 찜 상태"와 "서버 실제 찜 상태"가 어긋날 수 있으니
      // - getFavorites로 다시 받아서 favoriteMap을 서버 기준으로 재구성하자. 
      // - 여기서 실패하면 
      // - 이 코드는 실패해도 그냥 무시해서
      // - UI는 낙관적 토글 상태를 유지한다. (UX 유지)
      // 그럼 찜 실패가 자꾸 뜨는건 여기서 오류인건가 ?
      try {
        const list = await getFavorites(uid);
        const nextMap = {};
        (list ?? []).forEach((fav) => {
          const fid = Number(fav?.accommodationId);
          if (Number.isFinite(fid)) nextMap[fid] = true;
        });
        setFavoriteMap(nextMap);
      } catch (syncErr) {
        // 동기화 실패는 무시(토글 UX 유지)
      }

      // 실패 처리 : API 실패면 UI 롤백
      // - add/remove 요청이 실패하면
      //   - "찜 실패" alert
      //   - 그리고 아까 미리 바꿔놨던 UI를 원래대로 되돌림 (롤백)
      // 여기 문제인가 ?
    } catch (error) {
      console.error("찜 토글 실패:", error);
      alert("찜 실패");

      // 실패하면 롤백
      setFavoriteMap((prev) => ({
        ...prev,
        [aid]: currentlyFavorite,
      }));
    }
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

          <div className="border-t pt-3 mt-3">
            <h3 className="text-sm font-semibold mb-2">숙소 유형</h3>
            <div className="space-y-1 text-sm">
              {ACCOMMODATION_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="accommodationType"
                    value={opt.value}
                    checked={selectedType === opt.value}
                    onChange={() => setSelectedType(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

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

          <div className="border-t pt-3 mt-3 space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">공용 시설</h3>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {COMMON_FACILITY_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleInSet(setSelectedCommonFacilities, f)}
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
                    onClick={() => toggleInSet(setSelectedRoomFacilities, f)}
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
              <div className="flex flex-wrap gap-x-2 gap-y-0.5" />
            </div>
          </div>
        </aside>

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
                const photoUrl = Number.isFinite(accommodationId)
                  ? photoUrlMap[accommodationId]
                  : null;

                return (
                  <div
                    key={accommodationId}
                    className="relative bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleGoDetail(accommodationId)}
                  >
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, accommodationId)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-md bg-white border border-gray-300 flex items-center justify-center p-0 leading-none"
                      aria-label="찜 토글"
                    >
                      {favoriteMap[accommodationId] ? (
                        // 빨간 하트 (찜 ON) - 모양 고정
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-7 h-7"
                          fill="#ff4d4d"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                                  2 5.42 4.42 3 7.5 3
                                  c1.74 0 3.41.81 4.5 2.09
                                  C13.09 3.81 14.76 3 16.5 3
                                  19.58 3 22 5.42 22 8.5
                                  c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        // 회색 하트 (찜 OFF)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="w-7 h-7"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733C11.285 4.876 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      )}
                    </button>

                    <div className="w-full md:w-40 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-room.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {p.address} {p.city ? `(${p.city})` : ""}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {p.accommodationType}
                          {p.checkinTime && p.checkoutTime
                            ? ` · 체크인 ${p.checkinTime} / 체크아웃 ${p.checkoutTime}`
                            : ""}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {p.ratingAvg != null ? (
                            <span className="font-semibold text-yellow-600">
                              ★ {p.ratingAvg.toFixed ? p.ratingAvg.toFixed(1) : p.ratingAvg}
                            </span>
                          ) : (
                            <span className="text-gray-400">평점 없음</span>
                          )}
                        </div>

                        <div className="text-right">
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
                              <span className="text-xs text-gray-500"> / 1박</span>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">가격 정보 없음</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
