import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { getProperty } from "../../api/propertyAPI"; 
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../../api/favoriteAPI";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaWifi,
  FaParking,
  FaBath,
  FaQuestionCircle,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

export default function AccommodationDetail({ userId }) {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getProperty(id); 
        setProperty(data);
      } catch (err) {
        console.error("숙소 상세 조회 실패:", error);
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 안전장치
  const numericId = Number(id || property.propertyId);

  /* ----------------- 사진 관련 상태 ----------------- */
  const images = useMemo(() => {
    // 실제 필드 이름에 맞게 바꿔 써야 함
    // 예: property.imageUrls, property.photos 등
    if (!property) {
      return ["/placeholder-room.jpg"]
    }
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images;
    }
    if (Array.isArray(property.imageUrls) && property.imageUrls.length > 0) {
      return property.imageUrls;
    }
    // 임시 플레이스홀더
    return ["/placeholder-room.jpg"];
  }, [property]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (idx) => {
    setCurrentIndex(idx);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => setIsGalleryOpen(false);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  /* ----------------- 찜(즐겨찾기) ----------------- */
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!userId || !numericId) return;

    (async () => {
      try {
        const list = await getFavorites(userId);
        const exists = list.some(
          (f) =>
            f.targetType === "PROPERTY" &&
            Number(f.targetId) === numericId
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
        await removeFavorite(userId, "PROPERTY", numericId);
        setIsFavorite(false);
      } else {
        await addFavorite(userId, {
          targetType: "PROPERTY",
          targetId: numericId,
        });
        setIsFavorite(true);
      }
    } catch (e) {
      console.error("찜 토글 실패:", e);
      alert("찜 처리 중 오류가 발생했습니다.");
    } finally {
      setFavLoading(false);
    }
  };

  /* ----------------- 섹션 refs & 스크롤 ----------------- */
  const overviewRef = useRef(null);
  const roomsRef = useRef(null);
  const servicesRef = useRef(null);
  const infoRef = useRef(null);
  const locationRef = useRef(null);
  const reviewsRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");

  const scrollToRef = (ref) => {
    if (!ref?.current) return;
    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const sections = [
      { key: "overview", ref: overviewRef },
      { key: "rooms", ref: roomsRef },
      { key: "services", ref: servicesRef },
      { key: "location", ref: locationRef },
      { key: "reviews", ref: reviewsRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const found = sections.find(
            (s) => s.ref.current === entry.target
          );
          if (found) {
            setActiveTab(found.key);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0.1,
      }
    );

    sections.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current);
    });

    return () => observer.disconnect();
  }, []);

  /* ----------------- 서비스 모달 ----------------- */
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const openServiceModal = () => setIsServiceModalOpen(true);
  const closeServiceModal = () => setIsServiceModalOpen(false);

  const amenities = property?.amenities || [];

  const amenityIcon = (name) => {
    // 이름은 DB에 맞게 수정
    if (name.includes("와이파이") || name.includes("무선")) {
      return <FaWifi />;
    }
    if (name.includes("주차")) {
      return <FaParking />;
    }
    if (name.includes("욕실") || name.includes("욕조") || name.includes("욕실용품")) {
      return <FaBath />;
    }
    return <FaQuestionCircle />;
  };

  // 🔹 여기서 먼저 로딩/에러/null 방어
  if (loading) {
    return <div>숙소 정보를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div>숙소 정보를 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!property) {
    // 데이터가 없으면 일단 아무것도 렌더링하지 않음
    return null;
  }

  // 🔹 이제부터는 property가 null이 아님이 보장됨
  const rating = property.ratingAvg ?? 0;
  const reviewCount = property.reviewCount ?? 0;


  /* ----------------- JSX ----------------- */
  return (
    <div className="space-y-6">
      {/* 상단 사진 그리드 */}
      <div className="grid grid-cols-4 gap-2 h-[260px] md:h-[340px] overflow-hidden rounded-xl bg-black/5">
        {/* 왼쪽 큰 이미지 */}
        <button
          type="button"
          className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden"
          onClick={() => openGallery(0)}
        >
          <img
            src={images[0]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </button>

        {/* 오른쪽 나머지 썸네일 3장 정도 */}
        {images.slice(1, 4).map((img, idx) => (
          <button
            key={idx + 1}
            type="button"
            className="hidden md:block relative overflow-hidden"
            onClick={() => openGallery(idx + 1)}
          >
            <img
              src={img}
              alt={`${property.name} - ${idx + 2}`}
              className="w-full h-full object-cover"
            />
            {idx === 2 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-sm">
                +{images.length - 4}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 풀스크린 사진 모달 */}
      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex flex-col"
          onClick={closeGallery}
        >
          {/* 상단 바 */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button
              type="button"
              onClick={closeGallery}
              className="text-lg"
            >
              ✕
            </button>
            <div className="text-sm md:text-base">
              {property.name}
            </div>
            <div className="text-xs opacity-0">닫기</div>
          </div>

          {/* 메인 이미지 + 좌우 화살표 */}
          <div
            className="flex-1 flex items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center"
              >
                {"<"}
              </button>
            )}

            <img
              src={images[currentIndex]}
              alt={`${property.name} - ${currentIndex + 1}`}
              className="max-h-[70vh] max-w-[90vw] object-contain rounded-lg"
            />

            {currentIndex < images.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-9 h-9 flex items-center justify-center"
              >
                {">"}
              </button>
            )}
          </div>

          {/* 하단 썸네일 영역 */}
          <div
            className="w-full bg-black/70 py-3 px-4 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`border ${
                    idx === currentIndex
                      ? "border-white"
                      : "border-transparent"
                  } rounded-md overflow-hidden w-20 h-16 flex-shrink-0`}
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 숙소 이름 + 찜 */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            {property.propertyType || "숙소"}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {property.name}
          </h1>
        </div>
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={favLoading}
          className="mt-1"
        >
          {isFavorite ? (
            <FaHeart className="text-2xl text-red-500" />
          ) : (
            <FaRegHeart className="text-2xl text-gray-400" />
          )}
        </button>
      </div>

      {/* 개요 카드들 */}
      <div ref={overviewRef} className="grid md:grid-cols-3 gap-4">
        {/* 평점 카드 */}
        <button
          type="button"
          onClick={() => scrollToRef(reviewsRef)}
          className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-sm font-semibold">
              <FaStar />
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              {reviewCount.toLocaleString()}명 평가
            </span>
          </div>
          {property.shortReview && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {property.shortReview}
            </p>
          )}
        </button>

        {/* 서비스 요약 카드 */}
        <button
          type="button"
          onClick={openServiceModal}
          className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">
              서비스 및 부대시설
            </span>
            <span className="text-xs text-gray-500">
              전체 보기 &gt;
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-700">
            {amenities.slice(0, 4).map((a) => (
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

        {/* 위치 카드 */}
        <button
          type="button"
          onClick={() => scrollToRef(locationRef)}
          className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">
              위치 정보
            </span>
            <span className="text-xs text-blue-600">
              지도보기 &gt;
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-700 mt-1">
            <MdLocationOn className="mt-0.5 text-gray-500" />
            <div>
              <div>{property.address}</div>
              {property.city && (
                <div className="text-gray-500">
                  ({property.city})
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* 서비스 전체 모달 */}
      {isServiceModalOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center"
          onClick={closeServiceModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                서비스 및 부대시설
              </h2>
              <button
                type="button"
                onClick={closeServiceModal}
              >
                ✕
              </button>
            </div>
            {amenities.length === 0 ? (
              <p className="text-sm text-gray-500">
                등록된 편의시설이 없습니다.
              </p>
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

      {/* 상단 탭바 + 객실보기 버튼 */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 mt-4">
        <div className="flex items-center justify-between">
          <nav className="flex gap-6 text-sm md:text-base px-1 mt-3 ml-4">
             <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "overview"
                  ? "border-gray-900 font-semibold"
                  : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(overviewRef)}
            >
              개요
            </button>
             <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "rooms"
                  ? "border-gray-900 font-semibold"
                  : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(roomsRef)}
            >
              객실
            </button>
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "services"
                  ? "border-gray-900 font-semibold"
                  : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(servicesRef)}
            >
              서비스 및 부대시설
            </button>
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "location"
                  ? "border-gray-900 font-semibold"
                  : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(locationRef)}
            >
              위치
            </button>
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "reviews"
                  ? "border-gray-900 font-semibold"
                  : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(reviewsRef)}
            >
              리뷰
            </button>
          </nav>

          <button
            type="button"
            onClick={() => scrollToRef(roomsRef)}
            className="inline-flex items-center justify-center mt-4 px-4 py-2 mr-4 text-sm font-semibold border border-blue-600 text-blue-600 rounded-full bg-white hoover:bg-blue-50"
          >
            객실보기
          </button>
        </div>
      </div>

      {/* 1) 객실 선택 섹션 */}
      <section
        ref={roomsRef}
        className="mt-4 space-y-4"
      >
        <h2 className="text-xl font-semibold mb-2">
          객실 선택
        </h2>
        {/* TODO: 실제 room 데이터 구조에 맞게 교체 필요 */}
        {Array.isArray(property.rooms) &&
        property.rooms.length > 0 ? (
          property.rooms.map((room) => (
            <div
              key={room.roomId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4"
            >
              <div className="w-full md:w-56 h-40 bg-gray-100 rounded-lg overflow-hidden">
                {room.imageUrl && (
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    기준 {room.baseOccupancy ?? "-"}인 · 최대{" "}
                    {room.maxOccupancy ?? "-"}인
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-right">
                    {room.pricePerNight && (
                      <>
                        <div className="text-xs text-gray-500">
                          1박 기준
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          {room.pricePerNight.toLocaleString()}원
                        </div>
                      </>
                    )}
                  </div>
                  <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    선택
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            등록된 객실 정보가 없습니다.
          </p>
        )}
      </section>

      {/* 2) 서비스 및 부대시설 섹션 */}
      <section
        ref={servicesRef}
        className="mt-6 space-y-3"
      >
        <h2 className="text-xl font-semibold">
          서비스 및 부대시설
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {amenities.length === 0 ? (
            <p className="text-sm text-gray-500">
              등록된 편의시설이 없습니다.
            </p>
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

      {/* 3) 숙소 이용정보 섹션 */}
      <section
        ref={infoRef}
        className="mt-6 space-y-3"
      >
        <h2 className="text-xl font-semibold">
          숙소 이용정보
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
          <div>
            <span className="font-semibold">체크인</span>:{" "}
            {property.checkinTime ?? "-"}
          </div>
          <div>
            <span className="font-semibold">체크아웃</span>:{" "}
            {property.checkoutTime ?? "-"}
          </div>
          {property.description && (
            <p className="mt-2 whitespace-pre-line">
              {property.description}
            </p>
          )}
        </div>
      </section>

      {/* 4) 위치 섹션 */}
      <section
        ref={locationRef}
        className="mt-6 space-y-3"
      >
        <h2 className="text-xl font-semibold">
          위치
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
          <div className="flex items-start gap-2">
            <MdLocationOn className="mt-0.5 text-gray-500" />
            <div>
              <div>{property.address}</div>
              {property.city && (
                <div className="text-gray-500">
                  ({property.city})
                </div>
              )}
            </div>
          </div>
          {/* 실제 지도 컴포넌트는 여기 넣으면 됨 (카카오/네이버 등) */}
          <div className="mt-2 h-40 md:h-52 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            지도 영역 (추후 구현)
          </div>
        </div>
      </section>

      {/* 5) 리뷰 섹션 */}
      <section
        ref={reviewsRef}
        className="mt-6 space-y-3 mb-10"
      >
        <h2 className="text-xl font-semibold">
          리뷰
        </h2>
        {/* TODO: 실제 리뷰 데이터 연결 필요 */}
        {Array.isArray(property.reviews) &&
        property.reviews.length > 0 ? (
          <div className="space-y-3">
            {property.reviews.map((r) => (
              <div
                key={r.reviewId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-800"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">
                    {r.authorName ?? "익명"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                    <FaStar />
                    {r.rating?.toFixed(1) ?? "-"}
                  </span>
                </div>
                <p className="whitespace-pre-line">
                  {r.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            아직 등록된 리뷰가 없습니다.
          </p>
        )}
      </section>
    </div>
  );
}
