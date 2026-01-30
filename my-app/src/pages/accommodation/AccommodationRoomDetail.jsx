import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// components
import StickyTabs from "@/components/accommodation/detail/StickyTabs";
import ServiceModal from "@/components/accommodation/detail/ServiceModal";
import GalleryModal from "@/components/accommodation/detail/GalleryModal";
import SellerInfoModal from "@/components/SellerModal"; // [추가] 판매자 정보 모달

// API & Config
import { getRoomPhotos } from "@/api/roomPhotoAPI"; 
import { prepareBooking } from "@/api/bookingAPI";
import { getReviewList } from "@/api/reviewAPI";
import { getPartnerByAccommodationId } from "@/api/partnerAPI"; // [추가] 파트너 조회 API
import { ACCOMMODATION_PHOTO_ENDPOINTS, ROOM_PHOTO_ENDPOINTS } from "@/config"; 

// hooks
import useAccommodationDetail from "@/hooks/accommodation/detail/useAccommodationDetail";
import useFavorite from "@/hooks/accommodation/detail/useFavorite";

export default function AccommodationRoomDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 쿼리 파라미터 파싱
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().split('T')[0];
  const checkOut = searchParams.get("checkOut") || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const guests = searchParams.get("guests") || "2";

  // 1. 데이터 로딩 (숙소 상세 정보)
  const { accommodation, loading: accLoading } = useAccommodationDetail(id, checkIn, checkOut, guests);
  
  const rooms = accommodation?.rooms || [];

  // 2. 갤러리 로직 & 객실별 대표 이미지 관리
  const [allGalleryImages, setAllGalleryImages] = useState([]);
  const [roomMainPhotos, setRoomMainPhotos] = useState({}); // { roomId: "url" } 매핑

  useEffect(() => {
    if (!accommodation || !rooms) return;

    const fetchAllPhotos = async () => {
      // (1) 숙소 사진
      const accPhotos = accommodation.photos?.map(p => ({
        id: p.imageId || p.photoId,
        url: ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(p.imageId || p.photoId),
        description: "숙소 전경",
        sortOrder: p.sortOrder || 999,
        type: 'accommodation'
      })) || [];

      // (2) 객실 사진 병렬 호출
      const roomPhotoPromises = rooms.map(async (room) => {
        try {
          const rPhotos = await getRoomPhotos(room.roomId);
          return rPhotos.map(p => ({
            id: p.imageId,
            url: ROOM_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(p.imageId),
            description: room.roomName,
            sortOrder: p.sortOrder || 999,
            type: 'room',
            roomId: room.roomId // 정렬 등을 위해 ID 유지
          }));
        } catch (e) {
          return [];
        }
      });

      const roomsPhotosResult = await Promise.all(roomPhotoPromises);
      
      // 객실별 대표 이미지(sortOrder 1순위) 추출하여 매핑 생성
      const newMainPhotoMap = {};
      rooms.forEach((room, index) => {
          const photos = roomsPhotosResult[index]; // rooms와 순서 동일
          if (photos && photos.length > 0) {
              // sortOrder 기준 오름차순 정렬 (가장 낮은 숫자가 대표 사진)
              photos.sort((a, b) => a.sortOrder - b.sortOrder);
              newMainPhotoMap[room.roomId] = photos[0].url;
          }
      });
      setRoomMainPhotos(newMainPhotoMap);

      // 갤러리용 전체 사진 병합
      const flattenedRoomPhotos = roomsPhotosResult.flat();
      accPhotos.sort((a, b) => a.sortOrder - b.sortOrder); // 숙소 사진도 정렬
      setAllGalleryImages([...accPhotos, ...flattenedRoomPhotos]);
    };

    fetchAllPhotos();
  }, [accommodation, rooms]);

  // ---------------------------------------------------------------
  // [추가] 판매자 정보(Partner) 관련 로직
  // ---------------------------------------------------------------
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);

  const handleOpenSellerInfo = async () => {
      if (partnerInfo) {
          setIsSellerModalOpen(true);
          return;
      }

      try {
          // accommodationId를 이용해 Partner 정보 조회
          const data = await getPartnerByAccommodationId(id);
          setPartnerInfo(data);
          setIsSellerModalOpen(true);
      } catch (error) {
          console.error("판매자 정보 로딩 실패", error);
          alert("판매자 정보를 불러올 수 없습니다. (등록된 판매자가 없거나 오류 발생)");
      }
  };

  // ---------------------------------------------------------------
  // 리뷰 관련 State 및 로직
  // ---------------------------------------------------------------
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    const fetchReviews = async () => {
        try {
            const data = await getReviewList(id, reviewPage, 10);
            setReviews(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("리뷰 로딩 실패", error);
        }
    };
    
    fetchReviews();
  }, [id, reviewPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
        setReviewPage(newPage);
    }
  };

  const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating) => {
      const safeRating = rating || 0;
      return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  };

  // 3. 찜하기 로직
  const token = localStorage.getItem("accessToken");
  const storedUserId = localStorage.getItem("userId");
  
  // 로그인 여부 판단 (토큰과 ID가 모두 있고, "null" 문자열이 아닌 경우)
  const isLogin = !!(token && storedUserId && token !== "null" && token !== "undefined");

  // 훅 호출
  // 비로그인(isLogin = false)이면 userId에 null을 전달 -> useFavorite 내부에서 안전하게 무시됨
  const { isFavorite, toggleFavorite } = useFavorite({ 
      userId: isLogin ? Number(storedUserId) : null, 
      accommodationId: id 
  });
  
  // 화면 표시용 (낙관적 업데이트)
  const [localFavorite, setLocalFavorite] = useState(null);
  const effectiveFavorite = localFavorite ?? isFavorite;

  const handleToggleFavorite = async () => {
    // 버튼 클릭 시: 로그인 상태가 아니면 로그인 페이지로 유도
    if (!isLogin) {
        if (window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
            navigate("/login-selection");
        }
        return; // 여기서 함수를 끝내서 API 요청 자체를 차단
    }

    // 로그인 상태일 때만 실행됨
    const next = !effectiveFavorite; 
    setLocalFavorite(next); 
    
    try { 
        await toggleFavorite(); 
        
        // 성공 메시지
        if (next) {
            alert("숙소를 찜 목록에 담았습니다.");
        } else {
            alert("숙소를 찜 목록에서 삭제했습니다.");
        }
    } catch (error) { 
        setLocalFavorite(!next); // 실패 시 원상복구
        console.error(error);
        alert("오류가 발생했습니다."); 
    }
  };

  const roomsRef = useRef(null);
  const infoRef = useRef(null);     // [추가] 숙소 소개 영역 Ref
  const locationRef = useRef(null);
  const reviewsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const handleBooking = async (room) => {
    try {
        const response = await prepareBooking({
            roomId: room.roomId,
            checkinDate: checkIn,
            checkoutDate: checkOut
        });

        if (response && response.token) {
            sessionStorage.setItem("reservationToken", response.token);
            navigate(`/booking/new`); 
        } else {
            alert("예약 정보를 불러오는 데 실패했습니다.");
        }
    } catch (error) {
        console.error("예약 준비 에러:", error);
        alert("선택하신 객실은 현재 예약할 수 없습니다. (재고 부족 등)");
    }
  };

  if (accLoading) return <div className="p-10 text-center">불러오는 중...</div>;
  if (!accommodation) return <div>숙소 정보가 없습니다.</div>;

  const mainImage = allGalleryImages.find(img => img.type === 'accommodation') || allGalleryImages[0];
  
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* 상단 이미지 영역 */}
        <div className="relative h-[400px] md:h-[500px] grid grid-cols-4 grid-rows-2 gap-2 p-4 cursor-pointer"
             onClick={() => { setGalleryStartIndex(0); setIsGalleryOpen(true); }}>
          <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden group">
             <img src={mainImage?.url} alt="Main" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
             <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          </div>
          {allGalleryImages.slice(1, 5).map((img, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden hidden md:block">
               <img src={img.url} alt="Sub" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-black/80 transition">
             사진 모두 보기 ({allGalleryImages.length})
          </div>
        </div>

        {/* 숙소 정보 */}
        <div className="px-4 md:px-0 mt-4 mb-8">
           <div className="flex justify-between items-start">
              <div>
                <span className="text-gray-500 text-sm font-bold">{accommodation.type || "호텔/리조트"}</span>
                <h1 className="text-3xl font-bold mt-1 text-gray-900">{accommodation.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className="bg-yellow-400 text-white px-1.5 py-0.5 rounded text-sm font-bold">
                        {accommodation.ratingAvg || 5.0}
                    </span>
                    <span className="text-gray-600 text-sm">
                        추천해요 ({accommodation.reviewCount || 0}명 평가)
                    </span>
                </div>
              </div>
              <button onClick={handleToggleFavorite} className="flex flex-col items-center text-gray-400 hover:text-red-500">
                  <span className={`text-2xl ${effectiveFavorite ? "text-red-500" : ""}`}>♥</span>
                  <span className="text-xs">찜하기</span>
              </button>
           </div>
           
           <div className="mt-6 bg-gray-50 rounded-xl p-5 flex flex-col md:flex-row gap-6 border border-gray-100">
              <div className="flex-1 cursor-pointer hover:underline" onClick={() => setIsServiceOpen(true)}>
                  <h3 className="font-bold text-gray-700 mb-2">서비스 및 부대시설</h3>
                  <div className="flex gap-2 text-gray-500 text-sm overflow-hidden whitespace-nowrap">
                      {accommodation.amenities?.slice(0, 5).map(a => a.name).join(", ")}...
                  </div>
              </div>
              <div className="w-px bg-gray-300 hidden md:block"></div>
              <div className="flex-1 cursor-pointer hover:underline" onClick={() => scrollToSection(locationRef)}>
                  <h3 className="font-bold text-gray-700 mb-2">위치 정보</h3>
                  <p className="text-gray-500 text-sm truncate">{accommodation.address}</p>
              </div>
           </div>
        </div>

        {/* 탭 메뉴 */}
        <StickyTabs 
          activeTab="rooms" 
          onTabClick={(tab) => {
             if(tab === 'rooms') scrollToSection(roomsRef);
             if(tab === 'amenities') setIsServiceOpen(true);
             if(tab === 'location') scrollToSection(locationRef);
             if(tab === 'reviews') scrollToSection(reviewsRef);
          }}
        />

        {/* 4. 객실 리스트 */}
        <div ref={roomsRef} className="px-4 md:px-0 py-10 scroll-mt-16">
            <h2 className="text-xl font-bold mb-5">객실 선택</h2>
            <div className="space-y-6">
                {rooms.map((room) => (
                    <div key={room.roomId} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row h-auto md:h-64 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full md:w-1/3 bg-gray-200 relative">
                             {/* 객실별 대표 이미지 (없으면 기본 이미지) */}
                             <img 
                                src={roomMainPhotos[room.roomId] || "/images/no-image.png"} 
                                alt={room.roomName} 
                                className="w-full h-full object-cover" 
                                loading="lazy"
                             />
                        </div>
                        
                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{room.roomName}</h3>
                                <div className="mt-2 text-sm text-gray-500 space-y-1">
                                    <p>기준 {room.standardCapacity}인 / 최대 {room.maxCapacity}인</p>
                                    
                                    <p>
                                      {!room.available 
                                        ? <span className="text-red-500 font-bold">예약 마감 ({room.reason})</span> 
                                        : "입실 15:00 / 퇴실 11:00"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/4 border-l border-gray-100 p-6 flex flex-col justify-end items-end bg-gray-50">
                        {room.available ? (
                            <>
                                {room.remainingStock <= 5 && (
                                    <span className="text-red-500 text-xs font-bold mb-1 animate-pulse">
                                        남은 객실 {room.remainingStock}개
                                    </span>
                                )}

                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded mb-2">
                                    숙박 판매가
                                </span>
                                <div className="text-2xl font-bold text-gray-900 mb-4">
                                    {room.totalPrice.toLocaleString()}원
                                </div>
                                
                                <button 
                                    onClick={() => handleBooking(room)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                                >
                                    예약하기
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-bold text-gray-400 mb-2">
                                    {room.reason || "예약 마감"}
                                </div>
                                <button disabled className="w-full bg-gray-300 text-white font-bold py-3 rounded-lg cursor-not-allowed">
                                    예약 마감
                                </button>
                            </>
                        )}
                    </div>
                    </div>
                ))}
            </div>
        </div>
        
        <hr className="my-10 border-gray-100"/>

        {/* ------------------------------------------------------- */}
        {/* [추가] 숙소 소개 및 판매자 정보 섹션 (위치 정보 위) */}
        {/* ------------------------------------------------------- */}
        <div ref={infoRef} className="px-4 md:px-0 py-6 scroll-mt-20">
            <h2 className="text-xl font-bold mb-4">숙소 소개</h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">
                {accommodation.description || "등록된 숙소 소개가 없습니다."}
            </div>
            
            {/* 판매자 정보 모달 열기 버튼 */}
            <button 
                onClick={handleOpenSellerInfo}
                className="text-sm text-gray-500 underline hover:text-gray-800 transition-colors"
            >
                판매자 정보 확인
            </button>
        </div>

        <hr className="my-10 border-gray-100"/>

        {/* 위치 정보 */}
        <div ref={locationRef} className="px-4 md:px-0 py-6 scroll-mt-20">
           <h2 className="text-xl font-bold mb-4">위치 정보</h2>
           <div className="text-gray-600 mb-4">{accommodation.address}</div>
           <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
               지도 API 연동 영역
           </div>
        </div>

        {/* 리뷰 섹션 */}
        <div ref={reviewsRef} className="px-4 md:px-0 py-6 scroll-mt-20">
           <div className="flex items-center gap-2 mb-6">
               <h2 className="text-xl font-bold">리뷰</h2>
               <span className="text-blue-600 font-bold">{totalElements}개</span>
           </div>

           {reviews.length === 0 ? (
               <div className="bg-gray-50 p-10 rounded-xl text-center text-gray-500">
                   아직 등록된 리뷰가 없습니다.
               </div>
           ) : (
               <div className="space-y-6">
                   {reviews.map((review) => (
                       <div key={review.reviewId} className="border-b border-gray-100 pb-6 last:border-0">
                           <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                       {review.nickname ? review.nickname.charAt(0).toUpperCase() : "U"}
                                   </div>
                                   <div>
                                       <div className="font-bold text-gray-800">{review.nickname || "익명 사용자"}</div>
                                       <div className="text-xs text-gray-400">{formatDate(review.createdAt)}</div>
                                   </div>
                               </div>
                               <div className="text-yellow-400 text-sm tracking-widest">
                                   {renderStars(review.rating)}
                               </div>
                           </div>
                           <div className="pl-13 text-gray-600 leading-relaxed whitespace-pre-wrap">
                               {review.content}
                           </div>
                       </div>
                   ))}

                   <div className="flex justify-center items-center gap-4 mt-8">
                       <button 
                           onClick={() => handlePageChange(reviewPage - 1)}
                           disabled={reviewPage === 0}
                           className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-600"
                       >
                           이전
                       </button>
                       <span className="text-sm text-gray-600 font-medium">
                           {reviewPage + 1} / {totalPages === 0 ? 1 : totalPages}
                       </span>
                       <button 
                           onClick={() => handlePageChange(reviewPage + 1)}
                           disabled={reviewPage >= totalPages - 1}
                           className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-600"
                       >
                           다음
                       </button>
                   </div>
               </div>
           )}
        </div>

      </div>

      {/* 부가 서비스 모달 */}
      {isServiceOpen && (
        <ServiceModal 
           amenities={accommodation.amenities} 
           onClose={() => setIsServiceOpen(false)} 
        />
      )}

      {/* 갤러리 모달 */}
      {isGalleryOpen && (
        <GalleryModal 
            images={allGalleryImages}
            startIndex={galleryStartIndex}
            onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* [추가] 판매자 정보 모달 */}
      <SellerInfoModal 
          isOpen={isSellerModalOpen}
          onClose={() => setIsSellerModalOpen(false)}
          partner={partnerInfo}
      />
    </div>
  );
}