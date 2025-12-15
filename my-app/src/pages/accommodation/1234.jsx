import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAccommodation } from "../../api/accommodationAPI";
import { addFavorite, getFavorites, removeFavorite } from "../../api/favoriteAPI";
import { FaHeart, FaRegHeart, FaStar, FaWifi, FaParking, FaBath, FaQuestionCircle } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

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

  // 안전장치
  const numericId = Number(id || accommodation?.accommodationId);

  /* ----------------- 사진 관련 ----------------- */
  // 대표 이미지 1장만 화면에 표시
  // 클릭 시 모달에서 전체 이미지 보기
  const heroImage = useMemo(() => {
    if (!accommodation) return "/placeholder-room.jpg";

    return (
      accommodation.thumbnailUrl ||
      accommodation.mainImageUrl ||
      accommodation.imageUrl ||
      (Array.isArray(accommodation.images) &&
        accommodation.images.length > 0 &&
        accommodation.images[0]) ||
      (Array.isArray(accommodation.imageUrls) &&
        accommodation.images.length > 0 &&
        accommodation.imageUrls[0]) ||
      "/plaveholder-room.jpg"
    );
  }, [accommodation]);

  const images = useMemo(() => {
    if (!accommodation) return["/plaveholder-room.jpg"];

    if (Array.isArray(accommodation.images) && accommodation.images.length > 0) {
      return accommodation.images;
    }
    if (Array.isArray(accommodation.imageUrls) && accommodation.imageUrls.length > 0) {
      return accommodation.imageUrls;
    }
    return [heroImage];
  }, [accommodation, heroImage]);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (idx) => {
    setCurrentIndex(idx);
    setIsGalleryOpen(true);
  };
  const closeGallery = () => setIsGalleryOpen(false);
  const goPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev -1 : prev));
  const goNext = () => setCurrentIndex((prev) => (prev < images.length -1 ? prev + 1 : prev));

  /* ----------------- 찜(즐겨찾기) ----------------- */
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!userId || !numericId) return;

    (async () => {
      try {
        const list = await getFavorites(userId);
        const exists = (list ?? []).some((f) => Number(f.accommodationId) === numericId);
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

    sections.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current);
    });

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
    if (name.includes("욕실") || name.includes("욕조") || name.includes("욕실용품")) return <FaBath />;
    return <FaQuestionCircle />;
  };

  /* ----------------- 로딩/에러/null 방어 ----------------- */
  if (loading) return <div>숙소 정보를 불러오는 중입니다...</div>;
  if (error) return <div>숙소 정보를 불러오는 중 오류가 발생했습니다.</div>;
  if (!accommodation) return null;

  const rating = accommodation.ratingAvg ?? 0;
  const reviewCount = accommodation.reviewCount ?? 0;
  const typeLabel = accommodation.accommodationType || "숙소";

  // 대표 가격(상단 우측 하단에 노출)
const heroPrice = typeof accommodation.minPrice === "number" ? accommodation.minPrice : null;

  /* ----------------- JSX ----------------- */
  return (
    // 배경 흰색
    <div className="min-h-screen bg-white space-y-6">
      {/* 사진 영역 -> 사진만 */}
      <div className="relative overflow-hidden rounded-2xl bg-black/5">
        <button
          type="button"
          className="block w-full h-[260px] md:h-[360px] overflow-hidden"
          onClick={() => openGallery(0)}
          aria-label="사진 크게 보기"
        >
          <img
            src={heroImage}
            alt={accommodation.name}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
      
      {/* 이미지 아래 영역: 숙소명/찜 버튼은 여기서만 */}
      <div className="flex items-start justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {accommodation.name}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{accommodation.address}</p>
          {accommodation.city && <p className="text-sm text-gray-500">({accommodation.city})</p>}
        </div>

        <button
          type="button"
          onClick={toggleFavorite}
          disabled={favLoading}
          className="mt-1"
          aria-label="찜"
        >
          {isFavorite ? (
            <FaHeart className="text-2xl text-red-500" />
          ) : (
            <FaRegHeart className="text-2xl text-gray-400" />
          )}
        </button>
      </div>

      {/* 개요(요약 카드들) */}
      <div ref={overviewRef} className="grid md:grid-cols-3 gap-4 px-1">
        {/* 평점 카드 (리뷰로 이동) */}
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
            <span className="text-sm text-gray-600">{Number(reviewCount).toLocaleString()}명 평가</span>
          </div>
          {accommodation.shortReview && (
            <p className="text-sm text-gray-700 line-clamp-2">{accommodation.shortReview}</p>
          )}
        </button>

        {/* 서비스 카드 (모달) */}
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
              <span key={a.amenityId || a.name} className="inline-flex items-center gap-1">
                <span>{amenityIcon(a.name || "")}</span>
                <span>{a.name}</span>
              </span>
            ))}
            {amenities.length === 0 && (
              <span className="text-gray-400 text-sm">등록된 편의시설이 없습니다.</span>
            )}
          </div>
        </button>

        {/* 위치 카드 (위치 섹션으로 이동) */}
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
              {accommodation.city && <div className="text-gray-500">({accommodation.city})</div>}
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
              <h2 className="text-lg font-semibold">서비스 및 부대시설</h2>
              <button type="button" onClick={closeServiceModal}>✕</button>
            </div>

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

      {/* ✅ 4) 탭바: "저 칸에서" 살짝 내리기 + 헤더 아래에 sticky */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 mt-4">
        <div className="flex items-center justify-between">
          <nav className="flex gap-5 text-sm md:text-base px-1 mt-3 ml-4 overflow-x-auto">
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "rooms" ? "border-gray-900 font-semibold" : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(roomsRef)}
            >
              개요
            </button>
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "rooms" ? "border-gray-900 font-semibold" : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(roomsRef)}
            >
              객실
            </button>
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "services" ? "border-gray-900 font-semibold" : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(servicesRef)}
            >
              서비스 및 부대시설
            </button>
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "location" ? "border-gray-900 font-semibold" : "border-transparent text-gray-700"
              }`}
              onClick={() => scrollToRef(locationRef)}
            >
              위치
            </button>
            <button
              type="button"
              className={`py-3 border-b-2 ${
                activeTab === "reviews" ? "border-gray-900 font-semibold" : "border-transparent text-gray-700"
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

      {/* 객실 */}
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
                  <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
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

      {/* 서비스 */}
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

      <section ref={infoRef} className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">숙소 이용정보</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
          <div>
            <span className="font-semibold">체크인</span>: {accommodation.checkinTime ?? "-"}
          </div>
          <div>
            <span className="font-semibold">체크아웃</span>: {accommodation.checkoutTime ?? "-"}
          </div>
          {accommodation.description && <p className="mt-2 whitespace-pre-line">{accommodation.description}</p>}
        </div>
      </section>

      {/* 취소 및 환불 규정 섹션 */}
      <section ref={cancelRef} className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">취소 및 환불 규정</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
          {accommodation.cancelPolicy ? (
            <p className="whitespace-pre-line">{accommodation.cancelPolicy}</p>
          ) : (
            <p className="text-gray-500">취소/환불 규정이 등록되어 있지 않습니다.</p>
          )}
        </div>
      </section>
      
      {/* 판매자 정보 섹션 */}
      <section ref={sellerRef} className="mt-6 space-y-3">
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

      {/* 위치 */}
      <section ref={locationRef} className="mt-6 space-y-3 px-1">
        <h2 className="text-xl font-semibold">위치</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-700 space-y-2">
          <div className="flex items-start gap-2">
            <MdLocationOn className="mt-0.5 text-gray-500" />
            <div>
              <div>{accommodation.address}</div>
              {accommodation.city && <div className="text-gray-500">({accommodation.city})</div>}
            </div>
          </div>

          <div className="mt-2 h-40 md:h-52 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            지도 영역 (추후 구현)
          </div>
        </div>
      </section>

      {/* 리뷰 */}
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

      {/* 풀스크린 사진 모달 */}
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