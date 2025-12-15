import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAccommodation } from "../../api/accommodationAPI";
import { addFavorite, getFavorites, removeFavorite } from "../../api/favoriteAPI";
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
import { getAccommodationPhotos, getAccommodationPhotoBlobUrl } from "../../api/accommodationPhotoAPI";



export default function AccommodationDetail({ userId }) {
  const { id } = useParams();

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const numericId = id
    ? Number(id)
    : accommodation?.accommodationId
    ? Number(accommodation.accommodationId)
    : null;

  /* ----------------- 사진 관련 ----------------- */
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if(!id) return;

    (async () => {
      try {
        const list = await getAccommodationPhotos(id);
        setPhotos(list ?? []);
      } catch (err) {
        console.error("숙소 이미지 조회 실패:", err);
      }
    })();
  }, [id]);

  const heroImage = useMemo(() => {
    if (!photos || photos.length === 0) return "/placeholder-room.jpg";

    const main = photos.find((p) => p.isMain === true) || photos[0];
    return getAccommodationPhotoBlobUrl(main.photoId);
  }, [photos]);

  const images = useMemo(() => {
    if (!photos || photos.length === 0) return ["/placeholder-room.jpg"];
    return photos.map((p) => getAccommodationPhotoBlobUrl(p.photoId));
  }, [photos]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (idx) => {
    setCurrentIndex(idx);
    setIsGalleryOpen(true);
  };
  const closeGallery = () => setIsGalleryOpen(false);
  const goPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
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
  const overviewRef = useRef(null);
  const roomsRef = useRef(null);
  const servicesRef = useRef(null);
  const infoRef = useRef(null);
  const cancelRef = useRef(null);
  const sellerRef = useRef(null);
  const locationRef = useRef(null);
  const reviewsRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");

  const scrollToRef = (ref) => {
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
  if (loading) return <div className="bg-white p-6">숙소 정보를 불러오는 중입니다...</div>;
  if (error) return <div className="bg-white p-6">숙소 정보를 불러오는 중 오류가 발생했습니다.</div>;
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
    typeMap[String(rawType).toUpperCase()] || (rawType ? String(rawType) : "숙소");

  return (
    <div className="min-h-screen bg-white">
      {/* ----------------- (1) 첫번째 사진 영역 ----------------- */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
        <div className="mt-4 rounded-2xl overflow-hidden bg-gray-100 ">
          <button
            type="button"
            className="block w-[480px] md:h-[480px] overflow-hidden"
            onClick={() => openGallery(0)}
            aria-label="사진 크게 보기"
          >
            <img
              src={heroImage}
              alt={accommodation.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-room.jpg";
              }}
            />
          </button>
          {/* ✅ 사진 밑 “얇은 회색 라인” + 배경 맞추기(크기 줄인 라인) */}
          <div className="h-3 bg-gray-100" />
        </div>

        {/* ----------------- (3) 중간 라인 전체: 연회색 밴드 ----------------- */}
        <div className="mt-4 bg-gray-50 rounded-2xl px-4 md:px-6 py-5">
          {/* 숙소명 + 타입 + 찜 */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {accommodation.name}
                </h1>

                {/* ✅ (2) 펜션/호텔/모텔 배지 */}
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
          <div ref={overviewRef} className="grid md:grid-cols-3 gap-4 mt-5">
            <button
              type="button"
              onClick={() => scrollToRef(reviewsRef)}
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
              onClick={() => scrollToRef(locationRef)}
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

        {/* ----------------- (4) 서비스 모달: 제목 살짝 올리고 X 보이게 ----------------- */}
        {isServiceModalOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center"
            onClick={closeServiceModal}
          >
            <div
              className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✅ X가 안 보이던 이슈 해결: absolute로 고정 + 크기/색 지정 */}
              <button
                type="button"
                onClick={closeServiceModal}
                className="absolute top-4 right-4 text-gray-800 text-xl leading-none"
                aria-label="닫기"
              >
                ✕
              </button>

              {/* ✅ 제목 “살짝 올리기”: -mt-1 */}
              <h2 className="text-lg font-semibold -mt-1 mb-4">서비스 및 부대시설</h2>

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

        {/* ----------------- (5) 탭바: 글씨 “살짝 내리기” ----------------- */}
        <div className="sticky top-16 z-20 bg-white border-b border-gray-200 mt-6">
          <div className="flex items-center justify-between">
            {/* ✅ nav 자체에 pt를 주면 글씨가 아래로 내려감 */}
            <nav className="flex gap-5 text-sm md:text-base px-1 ml-2 overflow-x-auto pt-2">
            <button
              type="button"
              className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2 ${
                activeTab === "overview"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(overviewRef)}
            >
              개요
            </button>
              <button
                type="button"
                className={`py-4 border-b-2 ${
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
                className={`py-4 border-b-2 ${
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
                className={`py-4 border-b-2 ${
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
                className={`py-4 border-b-2 ${
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
              className="inline-flex items-center justify-center mr-2 px-4 py-2 text-sm font-semibold border border-blue-600 text-blue-600 rounded-full bg-white hover:bg-blue-50"
            >
              객실보기
            </button>
          </div>
        </div>

        {/* 이하 섹션들은 기존 그대로 */}
        <section ref={roomsRef} className="mt-4 space-y-4 px-1">
          <h2 className="text-xl font-semibold mb-2">객실 선택</h2>

          {Array.isArray(accommodation.rooms) && accommodation.rooms.length > 0 ? (
            accommodation.rooms.map((room) => (
              <div
                key={room.roomId}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4"
              >
                <div className="w-full md:w-56 h-40 bg-gray-100 rounded-lg overflow-hidden">
                  {room.imageUrl ? (
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      이미지 없음
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>
                    <p className="text-sm text-gray-600">
                      기준 {room.baseOccupancy ?? "-"}인 · 최대 {room.maxOccupancy ?? "-"}인
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-right">
                      {typeof room.pricePerNight === "number" ? (
                        <>
                          <div className="text-xs text-gray-500">1박 기준</div>
                          <div className="text-lg font-bold text-blue-600">
                            {room.pricePerNight.toLocaleString()}원
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-400">가격 정보 없음</div>
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
            <p className="text-sm text-gray-500">등록된 객실 정보가 없습니다.</p>
          )}
        </section>

        <section ref={servicesRef} className="mt-6 space-y-3 px-1">
          <h2 className="text-xl font-semibold">서비스 및 부대시설</h2>
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

        <section ref={locationRef} className="mt-6 space-y-3 px-1">
          <h2 className="text-xl font-semibold">위치</h2>
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

            <div className="mt-2 h-40 md:h-52 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              지도 영역 
            </div>
          </div>
        </section>

        <section ref={reviewsRef} className="mt-6 space-y-3 mb-10 px-1">
          <h2 className="text-xl font-semibold">리뷰</h2>

          {Array.isArray(accommodation.reviews) && accommodation.reviews.length > 0 ? (
            <div className="space-y-3">
              {accommodation.reviews.map((r) => (
                <div
                  key={r.reviewId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{r.authorName ?? "익명"}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                      <FaStar />
                      {typeof r.rating === "number" ? r.rating.toFixed(1) : "-"}
                    </span>
                  </div>
                  <p className="whitespace-pre-line">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">아직 등록된 리뷰가 없습니다.</p>
          )}
        </section>
      </div>

      {/* 사진 모달 */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col" onClick={closeGallery}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button type="button" onClick={closeGallery} className="text-lg">
              ✕
            </button>
            <div className="text-sm md:text-base">{accommodation.name}</div>
            <div className="text-xs opacity-0">닫기</div>
          </div>

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
              alt={`${accommodation.name} - ${currentIndex + 1}`}
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
                    idx === currentIndex ? "border-white" : "border-transparent"
                  } rounded-md overflow-hidden w-20 h-16 flex-shrink-0`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
