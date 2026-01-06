import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// components
import OverviewBand from "@/components/accommodation/detail/OverviewBand";
import StickyTabs from "@/components/accommodation/detail/StickyTabs";
import RoomSection from "@/components/accommodation/detail/RoomSection";
import InfoSection from "@/components/accommodation/detail/InfoSection";
import ServiceSection from "@/components/accommodation/detail/ServiceSection";
import ServiceModal from "@/components/accommodation/detail/ServiceModal";
import LocationSection from "@/components/accommodation/detail/LocationSection";
import CancelSection from "@/components/accommodation/detail/CancelSection";
import SellerSection from "@/components/accommodation/detail/SellerSection";
import GalleryModal from "@/components/accommodation/detail/GalleryModal";

// hooks
import useAccommodationDetail from "@/hooks/accommodation/detail/useAccommodationDetail";
import useAccommodationPhoto from "@/hooks/accommodation/detail/useAccommodationPhoto";
import useActiveTabObserver from "@/hooks/accommodation/detail/useActiveTabObserver";
import useFavorite from "@/hooks/accommodation/detail/useFavorite";
import useRoom from "@/hooks/accommodation/detail/useRoom";
import useRoomMainPhoto from "@/hooks/accommodation/detail/useRoomMainPhoto";
import useRoomPrice from "@/hooks/accommodation/detail/useRoomPrice";

export default function AccommodationRoomDetail({ userId }) {
  const { id } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  // SearchResultPage 등에서 넘어온 쿼리
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "";

  // 데이터 로딩
  const {
    accommodation,
    loading: accommodationLoading,
    error: accommodationError,
  } = useAccommodationDetail(id);

  const { rooms, roomsLoading } = useRoom(id);

  // ✅ 객실 대표사진(roomId -> url) / 객실 가격(roomId -> price)
  const roomPhotoUrlMap = useRoomMainPhoto(rooms);
  const { roomPriceMap, loading: priceLoading } =
    useRoomPrice({ rooms, checkIn, checkOut });

  const { images, topImages } = useAccommodationPhoto(id);

  const {
    isFavorite,
    favLoading,
    toggleFavorite,
    numericId: numericAccommodationId,
  } = useFavorite({ userId, accommodationId: id });

  // ✅ 낙관적 UI용 로컬 찜 상태
  const [localFavorite, setLocalFavorite] = useState(null);
  const effectiveFavorite = localFavorite ?? isFavorite;

  // 서버 상태가 바뀌면(local null일 때) 동기화
  useEffect(() => {
    if (localFavorite === null) return;
    setLocalFavorite(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFavorite]);

  // refs
  const overviewRef = useRef(null);
  const roomsRef = useRef(null);
  const roomsTitleRef = useRef(null);
  const servicesRef = useRef(null);
  const servicesTitleRef = useRef(null);
  const locationRef = useRef(null);
  const locationTitleRef = useRef(null);
  const reviewsRef = useRef(null);
  const reviewsTitleRef = useRef(null);
  const cancelRef = useRef(null);
  const sellerRef = useRef(null);

  const scrollToRef = (ref) => {
    if (!ref?.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const { activeTab } = useActiveTabObserver({
    overviewRef,
    roomsRef,
    roomsTitleRef,
    servicesRef,
    servicesTitleRef,
    locationRef,
    locationTitleRef,
    reviewsRef,
    reviewsTitleRef,
  });

  // 모달
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [serviceOpen, setServiceOpen] = useState(false);

  const openGallery = (idx) => {
    setCurrentIndex(idx);
    setIsGalleryOpen(true);
  };
  const closeGallery = () => setIsGalleryOpen(false);
  const goPrev = () => setCurrentIndex((p) => (p > 0 ? p - 1 : p));
  const goNext = () =>
    setCurrentIndex((p) => (p < images.length - 1 ? p + 1 : p));

  // ✅ 찜 버튼: 즉시 UI 변경 + alert + 전파 차단
  const handleToggleFavorite = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    const before = effectiveFavorite;
    const next = !before;

    // 1) UI는 즉시 반영
    setLocalFavorite(next);

    try {
      // 2) 서버 반영
      await toggleFavorite();

      // 3) 사용자 알림
      alert(next ? "찜이 완료되었습니다." : "찜이 해제되었습니다.");
    } catch (err) {
      // 실패하면 원복
      setLocalFavorite(before);
      alert("찜 처리 중 오류가 발생했습니다.");
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  // 로딩/에러
  if (accommodationLoading) {
    return <div className="bg-white p-6">숙소 정보를 불러오는 중입니다...</div>;
  }
  if (accommodationError) {
    return (
      <div className="bg-white p-6">
        숙소 정보를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }
  if (!accommodation) return null;

  // 표시값
  const rating = accommodation.ratingAvg ?? 0;
  const reviewCount = accommodation.reviewCount ?? 0;

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

  const amenities = Array.isArray(accommodation?.amenities)
    ? accommodation.amenities
    : [];

  // 객실 선택
  const handleSelectRoom = (room) => {
    // 비로그인 처리 :alert만
    if (!userId || Number(userId) <= 0) {
    alert("로그인 후 이용 가능합니다.");
    return;
  }
    const roomId = room?.roomId ?? room?.id;
    navigate(
      `/bookings/new?userId=${encodeURIComponent}(
        userId
    )}&roomId=${encodeURIComponent(
      roomId
    )}&checkinDate=${encodeURIComponent(
      checkinDate
    )}&checkoutDate=${encodeURIComponent(
      checkout
    )}&guests=${encodeURIComponent(guests)} `
  );
};

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
        {/* 사진 */}
        <OverviewBand
          accommodationName={accommodation.name}
          topImages={topImages}
          onOpenGallery={openGallery}
        />

        {/* 개요 */}
        <div
          ref={overviewRef}
          className="mt-4 bg-gray-50 rounded-2xl px-4 md:px-6 py-5 scroll-mt-28"
        >
          <InfoSection
            accommodation={accommodation}
            typeLabel={typeLabel}
            rating={rating}
            reviewCount={reviewCount}
            isFavorite={effectiveFavorite}
            favLoading={favLoading}
            onToggleFavorite={handleToggleFavorite}
            onGoLocation={() => scrollToRef(locationTitleRef)}
            onGoReviews={() => scrollToRef(reviewsTitleRef)}
            amenities={amenities}
            onOpenAmenityModal={() => setServiceOpen(true)}
          />
        </div>

        {/* 탭 */}
        <StickyTabs
          activeTab={activeTab}
          onClickTab={(key) => {
            if (key === "overview")
              return window.scrollTo({ top: 0, behavior: "smooth" });
            if (key === "rooms") return scrollToRef(roomsTitleRef);
            if (key === "services") return scrollToRef(servicesTitleRef);
            if (key === "location") return scrollToRef(locationTitleRef);
            if (key === "reviews") return scrollToRef(reviewsTitleRef);
          }}
          onClickViewRooms={() => scrollToRef(roomsTitleRef)}
        />

        {/* 객실 */}
        <RoomSection
          roomsRef={roomsRef}
          roomsTitleRef={roomsTitleRef}
          roomsLoading={roomsLoading}
          rooms={rooms}
          checkIn={checkIn}
          checkOut={checkOut}
          roomPhotoUrlMap={roomPhotoUrlMap}
          roomPriceMap={roomPriceMap}
          priceLoading={priceLoading}
          onClickSelectRoom={handleSelectRoom}
        />

        {/* 서비스 */}
        <ServiceSection
          servicesRef={servicesRef}
          servicesTitleRef={servicesTitleRef}
          amenities={amenities}
          onOpenModal={() => setServiceOpen(true)}
        />
        <ServiceModal
          open={serviceOpen}
          onClose={() => setServiceOpen(false)}
          amenities={amenities}
        />

        {/* 취소/판매자 */}
        <CancelSection
          cancelRef={cancelRef}
          cancellationPolicy={accommodation.cancellationPolicy}
        />
        <SellerSection
          sellerRef={sellerRef}
          sellerName={accommodation.sellerName}
          sellerContact={accommodation.sellerContact}
        />

        {/* 위치 */}
        <LocationSection
          locationRef={locationRef}
          locationTitleRef={locationTitleRef}
          address={accommodation.address}
          city={accommodation.city}
        />

        {/* 리뷰 */}
        <section ref={reviewsRef} className="mt-6 space-y-3 px-1 scroll-mt-28">
          <h2
            ref={reviewsTitleRef}
            className="text-xl font-semibold scroll-mt-40"
          >
            리뷰
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">리뷰 영역은 추후 연결</p>
          </div>
        </section>
      </div>

      {/* 갤러리 */}
      <GalleryModal
        open={isGalleryOpen}
        images={images}
        currentIndex={currentIndex}
        onClose={closeGallery}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  );
}
