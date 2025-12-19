
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getAccommodation } from "../../api/accommodationAPI";
import { addFavorite, getFavorites, removeFavorite } from "../../api/favoriteAPI";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaWifi,
  FaParking,
  FaQuestionCircle,
  FaBath,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import {
  getAccommodationPhotos,
  getAccommodationPhotoBlobUrl,
} from "../../api/accommodationPhotoAPI";
import { getRoomsByAccommodation } from "../../api/roomAPI";
import { getRoomPhotos, getRoomPhotoBlobUrl } from "../../api/roomPhotoAPI";
import {
  getDailyPoliciesByRoomAndRange,
  evaluatePoliciesForStay,
} from "../../api/DailyRoomPolicyAPI";

export default function AccommodationDetail({ userId }) {
  const { id } = useParams();
  const location = useLocation();

  // ✅ SearchResultPage에서 넘겨준 날짜/인원 쿼리 파라미터
  // 예: /accommodation/1?checkIn=2025-12-18&checkOut=2026-01-01&guests=2&userId=1
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "";

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ 객실은 accommodation.rooms가 아니라 별도 API 응답(rooms state)로 렌더링
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  // ✅ roomId → 대표 이미지 URL 매핑
  const [roomPhotoUrlMap, setRoomPhotoUrlMap] = useState({});

  // ✅ roomId → 가격/예약 가능 여부 매핑
  // { [roomId]: { price: number|null, isBookable: boolean, nights: number } }
  const [roomPriceMap, setRoomPriceMap] = useState({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getAccommodation(id);
        setAccommodation(data);
      } catch (err) {
        console.error("숙소 상세 조회 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setRoomsLoading(true);
        const list = await getRoomsByAccommodation(id);
        setRooms(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("객실 목록 조회 실패:", err);
        setRooms([]);
      } finally {
        setRoomsLoading(false);
      }
    })();
  }, [id]);

  /* ----------------- 날짜 유틸 ----------------- */
  const toISODate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // checkOut(퇴실일)은 숙박일에 포함되지 않으므로, 정책 조회 endDate는 (checkOut - 1일)로 맞춘다.
  const getInclusiveEndDateForStay = (checkInStr, checkOutStr) => {
    if (!checkInStr || !checkOutStr) return "";
    const out = new Date(checkOutStr);
    if (Number.isNaN(out.getTime())) return "";
    out.setDate(out.getDate() - 1);
    return toISODate(out);
  };

  const numericId = id
    ? Number(id)
    : accommodation?.accommodationId
    ? Number(accommodation.accommodationId)
    : null;

  /* ----------------- 객실 대표 사진 로딩 (roomId → 대표 photoId → blob URL) ----------------- */
  useEffect(() => {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      setRoomPhotoUrlMap({});
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const entries = await Promise.allSettled(
          rooms.map(async (room) => {
            const roomId = room?.roomId;
            if (!roomId) return [null, null];

            const list = await getRoomPhotos(roomId);
            const photos = Array.isArray(list) ? list : [];

            // 대표사진 우선: isMain=true → 그다음 sortOrder 오름차순 → 그다음 첫 번째
            const main =
              photos.find((p) => p?.isMain === true) ||
              photos
                .slice()
                .sort(
                  (a, b) =>
                    (a?.sortOrder ?? 9999) - (b?.sortOrder ?? 9999)
                )[0];

            const photoId = main?.imageId ?? main?.photoId ?? null;
            const url = photoId ? getRoomPhotoBlobUrl(photoId) : null;

            return [String(roomId), url];
          })
        );

        if (cancelled) return;

        const next = {};
        entries.forEach((r) => {
          if (r.status !== "fulfilled") return;
          const [k, v] = r.value || [];
          if (!k) return;
          next[k] = v;
        });

        setRoomPhotoUrlMap(next);
      } catch (e) {
        console.error("객실 대표사진 로딩 실패:", e);
        if (!cancelled) setRoomPhotoUrlMap({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rooms]);

  /* ----------------- 객실 가격 로딩 (1박 최저가) ----------------- */
  useEffect(() => {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      setRoomPriceMap({});
      return;
    }

    // 날짜가 없으면 가격 로딩 불가
    if (!checkIn || !checkOut) {
      setRoomPriceMap({});
      return;
    }

    const endDate = getInclusiveEndDateForStay(checkIn, checkOut);
    if (!endDate) {
      setRoomPriceMap({});
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const entries = await Promise.allSettled(
          rooms.map(async (room) => {
            const roomId = room?.roomId;
            if (!roomId) return [null, null];

            const policies = await getDailyPoliciesByRoomAndRange(
              roomId,
              checkIn,
              endDate
            );

            const evaluated = evaluatePoliciesForStay(policies, {
              mode: "MIN_PER_NIGHT",
            });

            return [
              String(roomId),
              {
                price:
                  typeof evaluated.displayPrice === "number"
                    ? evaluated.displayPrice
                    : null,
                isBookable: evaluated.isBookable,
                nights: evaluated.nights,
              },
            ];
          })
        );

        if (cancelled) return;

        const next = {};
        entries.forEach((r) => {
          if (r.status !== "fulfilled") return;
          const [k, v] = r.value || [];
          if (!k) return;
          next[k] = v;
        });

        setRoomPriceMap(next);
      } catch (e) {
        console.error("객실 가격 로딩 실패:", e);
        if (!cancelled) setRoomPriceMap({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rooms, checkIn, checkOut]);

  /* ----------------- 사진 관련 ----------------- */
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const list = await getAccommodationPhotos(id);
        setPhotos(list ?? []);
      } catch (err) {
        console.error("숙소 이미지 조회 실패:", err);
      }
    })();
  }, [id]);

  // ✅ 이미지 순서: 대표(isMain) 먼저, 나머지 순서대로
  const images = useMemo(() => {
    if (!Array.isArray(photos) || photos.length === 0)
      return ["/placeholder-room.jpg"];

    const main = photos.find((p) => p.isMain === true) || photos[0];
    const ordered = [main, ...photos.filter((p) => p !== main)];

    return ordered
      .map((p) => getAccommodationPhotoBlobUrl(p.photoId))
      .filter(Boolean);
  }, [photos]);

  // ✅ 상단에 3장(정사각형)으로 보여줄 이미지(대표 + 다음 2장)
  const topImages = useMemo(() => {
    const filled = (images ?? []).slice(0, 3);
    while (filled.length < 3) filled.push("/placeholder-room.jpg");
    return filled;
  }, [images]);

  const heroImage = useMemo(() => {
    if (!images || images.length === 0) return "/placeholder-room.jpg";
    return images[0];
  }, [images]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (idx) => {
    setCurrentIndex(idx);
    setIsGalleryOpen(true);
  };
  const closeGallery = () => setIsGalleryOpen(false);
  const goPrev = () =>
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const goNext = () =>
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));

  /* ----------------- 찜(즐겨찾기) ----------------- */
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!userId || !numericId) return;

    (async () => {
      try {
        const list = await getFavorites(userId);
        const exists = (list ?? []).some(
          (f) => Number(f.accommodationId) === numericId
        );
        setIsFavorite(exists);
      } catch (e) {
        console.error("찜 여부 조회 실패:", e);
      }
    })();
  }, [userId, numericId]);

  const toggleFavorite = async () => {
    if (!userId || !numericId || favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(userId, numericId);
        setIsFavorite(false);
        alert("찜 목록에서 삭제 되었습니다.");
      } else {
        await addFavorite(userId, numericId);
        setIsFavorite(true);
        alert("찜 목록에 추가 되었습니다.");
      }
    } catch (e) {
      console.error("찜 토글 실패:", e);
      alert("찜 처리 중 오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  /* ----------------- 섹션 refs & 스크롤 ----------------- */
  const topRef = useRef(null);
  const overviewRef = useRef(null);
  const roomsRef = useRef(null);
  const roomsTitleRef = useRef(null);
  const servicesRef = useRef(null);
  const servicesTitleRef = useRef(null);
  const infoRef = useRef(null);
  const cancelRef = useRef(null);
  const sellerRef = useRef(null);
  const locationRef = useRef(null);
  const locationTitleRef = useRef(null);
  const reviewsRef = useRef(null);
  const reviewsTitleRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");

  const scrollToRef = (ref) => {
    // ✅ 롤백: 섹션 제목이 안정적으로 보이도록 scroll-margin-top + scrollIntoView 사용
    if (!ref?.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const sections = [
      { key: "overview", ref: overviewRef },
      { key: "rooms", ref: roomsRef },
      { key: "services", ref: servicesRef },
      { key: "info", ref: infoRef },
      { key: "cancel", ref: cancelRef },
      { key: "seller", ref: sellerRef },
      { key: "location", ref: locationRef },
      { key: "reviews", ref: reviewsRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const found = sections.find((s) => s.ref.current === entry.target);
          if (found) setActiveTab(found.key);
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0.1 }
    );

    sections.forEach((s) => s.ref.current && observer.observe(s.ref.current));
    return () => observer.disconnect();
  }, []);

  /* ----------------- 서비스 모달 ----------------- */
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const openServiceModal = () => setIsServiceModalOpen(true);
  const closeServiceModal = () => setIsServiceModalOpen(false);

  const amenities = accommodation?.amenities || [];

  const amenityIcon = (name) => {
    if (name.includes("와이파이") || name.includes("무선")) return <FaWifi />;
    if (name.includes("주차")) return <FaParking />;
    if (
      name.includes("욕실") ||
      name.includes("욕조") ||
      name.includes("욕실용품")
    )
      return <FaBath />;
    return <FaQuestionCircle />;
  };

  /* ----------------- 로딩/에러/null 방어 ----------------- */
  if (loading)
    return <div className="bg-white p-6">숙소 정보를 불러오는 중입니다...</div>;
  if (error)
    return (
      <div className="bg-white p-6">숙소 정보를 불러오는 중 오류가 발생했습니다.</div>
    );
  if (!accommodation) return null;

  const rating = accommodation.ratingAvg ?? 0;
  const reviewCount = accommodation.reviewCount ?? 0;

  /* ----------------- 타입 배지(호텔/펜션/모텔) ----------------- */
  const rawType = accommodation.accommodationType || accommodation.type || "";
  const typeMap = {
    HOTEL: "호텔",
    PENSION: "펜션",
    MOTEL: "모텔",
    RESORT: "리조트",
    GUESTHOUSE: "게스트하우스",
  };
  const typeLabel =
    typeMap[String(rawType).toUpperCase()] ||
    (rawType ? String(rawType) : "숙소");

  return (
    <div className="min-h-screen bg-white" ref={topRef}>
      {/* ----------------- (1) 첫번째 사진 영역 ----------------- */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
        <div className="mt-4 rounded-2xl overflow-hidden bg-gray-100">
          {/* ✅ 상단 사진 3장(정사각형) 나란히: ㅁㅁㅁ */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100">
            {topImages.map((src, idx) => (
              <button
                key={idx}
                type="button"
                className="w-full aspect-square overflow-hidden rounded-xl bg-gray-200"
                onClick={() => openGallery(idx)}
                aria-label={`사진 크게 보기 ${idx + 1}`}
              >
                <img
                  src={src}
                  alt={`${accommodation.name} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-room.jpg";
                  }}
                />
              </button>
            ))}
          </div>

          <div className="h-3 bg-gray-100" />
        </div>

        {/* ----------------- (3) 중간 라인 전체: 연회색 밴드 ----------------- */}
        <div
          className="mt-4 bg-gray-50 rounded-2xl px-4 md:px-6 py-5 scroll-mt-28"
          ref={overviewRef}
        >
          {/* 숙소명 + 타입 + 찜 */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {accommodation.name}
                </h1>

                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-700">
                  {typeLabel}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1">{accommodation.address}</p>
              {accommodation.city && (
                <p className="text-sm text-gray-500">({accommodation.city})</p>
              )}
            </div>

            <button
              type="button"
              onClick={toggleFavorite}
              disabled={favLoading}
              className="mt-1 bg-white border border-gray-200 rounded-xl w-12 h-12 flex items-center justify-center"
              aria-label="찜"
            >
              {isFavorite ? (
                <FaHeart className="text-2xl text-red-500" />
              ) : (
                <FaRegHeart className="text-2xl text-gray-400" />
              )}
            </button>
          </div>

          {/* 개요 카드들 */}
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <button
              type="button"
              onClick={() => scrollToRef(reviewsTitleRef)}
              className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-sm font-semibold">
                  <FaStar />
                  {Number(rating).toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">
                  {Number(reviewCount).toLocaleString()}명 평가
                </span>
              </div>
              {accommodation.shortReview && (
                <p className="text-sm text-gray-700 line-clamp-2">
                  {accommodation.shortReview}
                </p>
              )}
            </button>

            <button
              type="button"
              onClick={openServiceModal}
              className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">서비스 및 부대시설</span>
                <span className="text-xs text-gray-500">전체 보기 &gt;</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
                {amenities.slice(0, 6).map((a) => (
                  <span
                    key={a.amenityId || a.name}
                    className="inline-flex items-center gap-1"
                  >
                    <span>{amenityIcon(a.name || "")}</span>
                    <span>{a.name}</span>
                  </span>
                ))}
                {amenities.length === 0 && (
                  <span className="text-gray-400 text-sm">
                    등록된 편의시설이 없습니다.
                  </span>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => scrollToRef(locationTitleRef)}
              className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">위치 정보</span>
                <span className="text-xs text-blue-600">지도보기 &gt;</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700 mt-1">
                <MdLocationOn className="mt-0.5 text-gray-500" />
                <div>
                  <div>{accommodation.address}</div>
                  {accommodation.city && (
                    <div className="text-gray-500">({accommodation.city})</div>
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ----------------- (4) 서비스 모달 ----------------- */}
        {isServiceModalOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center"
            onClick={closeServiceModal}
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeServiceModal}
                className="absolute top-4 right-4 text-gray-800 text-xl leading-none"
                aria-label="닫기"
              >
                ✕
              </button>

              <h2 className="text-lg font-semibold -mt-1 mb-4">
                서비스 및 부대시설
              </h2>

              {amenities.length === 0 ? (
                <p className="text-sm text-gray-500">등록된 편의시설이 없습니다.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((a) => (
                    <div
                      key={a.amenityId || a.name}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <span>{amenityIcon(a.name || "")}</span>
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- (5) 탭바 ----------------- */}
        <div className="sticky top-16 z-20 bg-white border-b border-gray-200 mt-6">
          <div className="flex items-center justify-between">
            <nav className="flex gap-5 text-sm md:text-base px-1 ml-2 overflow-x-auto pt-2">
              <button
                type="button"
                className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2 ${
                  activeTab === "overview"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-700"
                }`}
                onClick={() => {
                  // ✅ 개요는 맨 위로
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setActiveTab("overview");
                }}
              >
                개요
              </button>

              <button
                type="button"
                className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2  ${
                  activeTab === "rooms"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-700"
                }`}
                onClick={() => {
                  // ✅ 객실 선택 섹션이 위에 보이게
                  scrollToRef(roomsTitleRef);
                  setActiveTab("rooms");
                }}
              >
                객실
              </button>

              <button
                type="button"
                className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2 ${
                  activeTab === "services"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-700"
                }`}
                onClick={() => {
                  // ✅ 서비스 및 부대시설 섹션이 위에 보이게
                  scrollToRef(servicesTitleRef);
                  setActiveTab("services");
                }}
              >
                서비스 및 부대시설
              </button>

              <button
                type="button"
                className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2  ${
                  activeTab === "location"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-700"
                }`}
                onClick={() => {
                  // ✅ 위치 섹션이 위에 보이게
                  scrollToRef(locationTitleRef);
                  setActiveTab("location");
                }}
              >
                위치
              </button>

              <button
                type="button"
                className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2  ${
                  activeTab === "reviews"
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-700"
                }`}
                onClick={() => {
                  // ✅ 리뷰 섹션이 위에 보이게
                  scrollToRef(reviewsTitleRef);
                  setActiveTab("reviews");
                }}
              >
                리뷰
              </button>
            </nav>

            <button
              type="button"
              onClick={() => {
                // ✅ 객실보기 = 객실이 맨 위에 보이게
                scrollToRef(roomsTitleRef);
                setActiveTab("rooms");
              }}
              className="inline-flex items-center justify-center mr-2 px-4 py-2 text-sm font-semibold border border-blue-600 text-blue-600 rounded-full bg-white hover:bg-blue-50"
            >
              객실보기
            </button>
          </div>
        </div>

        {/* ----------------- ✅ 객실 섹션: rooms(state)로 렌더링 ----------------- */}
        <section ref={roomsRef} className="mt-4 space-y-4 px-1 scroll-mt-28">
          <h2 ref={roomsTitleRef} className="text-xl font-semibold mb-2 scroll-mt-40">
            객실 선택
          </h2>

          {roomsLoading ? (
            <p className="text-sm text-gray-500">객실 정보를 불러오는 중...</p>
          ) : Array.isArray(rooms) && rooms.length > 0 ? (
            rooms.map((room) => {
              // ✅ DB/DTO 필드명이 조금 달라도 기준/최대 인원은 최대한 찾아서 표시
              const baseOcc =
                room.standardCapacity ??
                room.baseOccupancy ??
                room.basePerson ??
                room.standardOccupancy ??
                room.standardPerson ??
                room.minOccupancy ??
                room.minPerson ??
                room.capacityBase ??
                null;

              const maxOcc =
                room.maxCapacity ??
                room.maxOccupancy ??
                room.maxPerson ??
                room.maximumOccupancy ??
                room.maximumPerson ??
                room.capacityMax ??
                null;

              const priceInfo = roomPriceMap[String(room.roomId)];

              // ✅ 선택 버튼 활성 조건: 날짜 있음 + 전 기간 예약 가능(isBookable=true) + 가격 존재
              const isBookable =
                checkIn &&
                checkOut &&
                priceInfo?.isBookable === true &&
                typeof priceInfo?.price === "number";

              return (
                <div
                  key={room.roomId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4"
                >
                  <div className="w-full md:w-56 h-40 bg-gray-100 rounded-lg overflow-hidden">
                    {roomPhotoUrlMap[String(room.roomId)] ? (
                      <img
                        src={roomPhotoUrlMap[String(room.roomId)]}
                        alt={room.name ?? room.roomName ?? "객실"}
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
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {room.roomName ?? room.name ?? "객실"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        기준 {baseOcc ?? "-"}인 · 최대 {maxOcc ?? "-"}인
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-left">
                        {typeof priceInfo?.price === "number" ? (
                          <>
                            <div className="text-xs text-gray-500">1박 최저가</div>
                            <div className="text-lg font-bold text-blue-600">
                              {priceInfo.price.toLocaleString()}원
                            </div>
                          </>
                        ) : checkIn && checkOut ? (
                          priceInfo?.isBookable === false ? (
                            <div className="text-xs text-red-500 font-semibold">
                              예약 불가
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">가격 정보 없음</div>
                          )
                        ) : (
                          <div className="text-xs text-gray-400">날짜 선택 필요</div>
                        )}
                      </div>

                      <button
                        // ✅ 예약 가능일 때만 클릭 가능
                        disabled={!isBookable}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                          isBookable
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        선택
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">등록된 객실 정보가 없습니다.</p>
          )}
        </section>

        {/* 아래 섹션들은 기존 코드 그대로 유지 */}
        <section ref={servicesRef} className="mt-6 space-y-3 px-1 scroll-mt-28">
          <h2 ref={servicesTitleRef} className="text-xl font-semibold scroll-mt-40">
            서비스 및 부대시설
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            {amenities.length === 0 ? (
              <p className="text-sm text-gray-500">등록된 편의시설이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenities.map((a) => (
                  <div
                    key={a.amenityId || a.name}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span>{amenityIcon(a.name || "")}</span>
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section ref={infoRef} className="mt-6 space-y-3 px-1">
          <h2 className="text-xl font-semibold">숙소 이용정보</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
            <div>
              <span className="font-semibold">체크인</span>: {accommodation.checkinTime ?? "-"}
            </div>
            <div>
              <span className="font-semibold">체크아웃</span>: {accommodation.checkoutTime ?? "-"}
            </div>
            {accommodation.description && (
              <p className="mt-2 whitespace-pre-line">{accommodation.description}</p>
            )}
          </div>
        </section>

        <section ref={cancelRef} className="mt-6 space-y-3 px-1">
          <h2 className="text-xl font-semibold">취소 및 환불 규정</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
            {accommodation.cancelPolicy ? (
              <p className="whitespace-pre-line">{accommodation.cancelPolicy}</p>
            ) : (
              <p className="text-gray-500">취소/환불 규정이 등록되어 있지 않습니다.</p>
            )}
          </div>
        </section>

        <section ref={sellerRef} className="mt-6 space-y-3 px-1">
          <h2 className="text-xl font-semibold">판매자 정보</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
            {accommodation.sellerName || accommodation.sellerContact ? (
              <>
                {accommodation.sellerName && (
                  <div>
                    <span className="font-semibold">상호</span>: {accommodation.sellerName}
                  </div>
                )}
                {accommodation.sellerContact && (
                  <div>
                    <span className="font-semibold">연락처</span>: {accommodation.sellerContact}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">판매자 정보가 등록되어 있지 않습니다.</p>
            )}
          </div>
        </section>

        <section ref={locationRef} className="mt-6 space-y-3 px-1 scroll-mt-28">
          <h2 ref={locationTitleRef} className="text-xl font-semibold scroll-mt-40">
            위치
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
            <div className="flex items-start gap-2">
              <MdLocationOn className="mt-0.5 text-gray-500" />
              <div>
                <div>{accommodation.address}</div>
                {accommodation.city && (
                  <div className="text-gray-500">({accommodation.city})</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 리뷰/갤러리 등 아래쪽 기존 코드가 있다면 그대로 이어서 유지하면 됩니다. */}
        {isGalleryOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
            onClick={closeGallery}
          >
            <div
              className="relative max-w-4xl w-full px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentIndex]}
                alt={`갤러리 이미지 ${currentIndex + 1}`}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ›
              </button>
              <button
                type="button"
                onClick={closeGallery}
                className="absolute top-2 right-2 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
