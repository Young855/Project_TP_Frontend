import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// components
import StickyTabs from "@/components/accommodation/detail/StickyTabs";
import ServiceModal from "@/components/ServiceModal";
import GalleryModal from "@/components/GalleryModal";

// API & Config
import { getRoomPhotos } from "@/api/roomPhotoAPI"; 
import { prepareBooking } from "@/api/bookingAPI"; 
import { ACCOMMODATION_PHOTO_ENDPOINTS, ROOM_PHOTO_ENDPOINTS } from "@/config"; 

// hooks
import useAccommodationDetail from "@/hooks/accommodation/detail/useAccommodationDetail";
import useFavorite from "@/hooks/accommodation/detail/useFavorite";

// -------------------------------------------------------------------------
// [Component] 판매자 정보 모달 (추가됨)
// -------------------------------------------------------------------------
const SellerInfoModal = ({ sellerInfo, onClose }) => {
    // 백엔드 데이터가 없을 경우를 대비한 기본값 처리
    const info = sellerInfo || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">판매자 정보</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
                </div>
                <div className="p-6 text-sm text-gray-700 space-y-4">
                    <div className="flex border-b border-gray-100 pb-3">
                        <span className="w-32 text-gray-500 font-medium shrink-0">상호</span>
                        <span>{info.bizName || "-"}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-3">
                        <span className="w-32 text-gray-500 font-medium shrink-0">대표자명</span>
                        <span>{info.ceoName || "-"}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-3">
                        <span className="w-32 text-gray-500 font-medium shrink-0">주소</span>
                        <span>{info.address || "-"}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-3">
                        <span className="w-32 text-gray-500 font-medium shrink-0">전화번호</span>
                        <span>{info.contactPhone || "-"}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-3">
                        <span className="w-32 text-gray-500 font-medium shrink-0">이메일</span>
                        <span>{info.contactEmail || "-"}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-3">
                        <span className="w-32 text-gray-500 font-medium shrink-0">사업자 번호</span>
                        <span>{info.bizRegNumber || "-"}</span>
                    </div>
                     {/* 통신판매업 번호가 있다면 표시 */}
                    <div className="flex border-b border-gray-100 pb-3">
                        <span className="w-32 text-gray-500 font-medium shrink-0">통신판매업번호</span>
                        <span>{info.onlineBizNumber || "-"}</span>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 p-3 rounded text-xs text-gray-500 leading-relaxed">
                        * 판매자 정보는 판매자의 명시적 동의 없이 영리 목적의 마케팅/광고 등에 활용할 수 없습니다.<br/>
                        이를 어길 시 정보통신망법 등 관련 법령에 의거하여 과태료 부과 및 민형사상 책임을 지게 될 수 있습니다.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AccommodationRoomDetail({ userId }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 쿼리 파라미터 파싱
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().split('T')[0];
  const checkOut = searchParams.get("checkOut") || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const guests = searchParams.get("guests") || "2";

  // 1. 데이터 로딩
  const { accommodation, loading: accLoading } = useAccommodationDetail(id, checkIn, checkOut, guests);
  
  // accommodation.rooms 사용 (통합 데이터)
  const rooms = accommodation?.rooms || [];

  // 2. 갤러리 로직
  const [allGalleryImages, setAllGalleryImages] = useState([]);

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

      // (2) 객실 사진
      const roomPhotoPromises = rooms.map(async (room) => {
        try {
          const rPhotos = await getRoomPhotos(room.roomId);
          return rPhotos.map(p => ({
            id: p.imageId,
            url: ROOM_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(p.imageId),
            description: room.roomName,
            sortOrder: p.sortOrder || 999,
            type: 'room'
          }));
        } catch (e) {
          return [];
        }
      });

      const roomsPhotosResult = await Promise.all(roomPhotoPromises);
      const flattenedRoomPhotos = roomsPhotosResult.flat();

      accPhotos.sort((a, b) => a.sortOrder - b.sortOrder);
      setAllGalleryImages([...accPhotos, ...flattenedRoomPhotos]);
    };

    fetchAllPhotos();
  }, [accommodation, rooms]);

  // 찜하기, 스크롤, 모달 등
  const { isFavorite, toggleFavorite } = useFavorite({ userId, accommodationId: id });
  const [localFavorite, setLocalFavorite] = useState(null);
  const effectiveFavorite = localFavorite ?? isFavorite;

  const handleToggleFavorite = async () => {
    const next = !effectiveFavorite;   // true = 찜 추가, false = 찜 해제
    setLocalFavorite(next);

    try {
      await toggleFavorite();
      if (next) {
        alert("찜이 완료되었습니다.");
      } else {
        alert("찜이 해제되었습니다.");
      }

    } catch (e) {
      // 실패 시 롤백
      setLocalFavorite(!next);
      alert("찜 처리에 실패했습니다.");
    }
  };


  const roomsRef = useRef(null);
  const locationRef = useRef(null);
  const reviewsRef = useRef(null);
  const infoRef = useRef(null); // [추가] 숙소 정보 섹션 참조

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false); // [추가] 판매자 모달 상태
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const handleBooking = async (room) => {
    // 1. 로그인 체크 (필요 시 주석 해제)
    /*
    if (!userId) {
        alert("로그인이 필요한 서비스입니다.");
        // navigate("/login");
        return;
    }
    */

    try {
        // 2. 백엔드에 예약 토큰 요청 (재고 확인 포함됨)
        const response = await prepareBooking({
            roomId: room.roomId,
            checkinDate: checkIn,
            checkoutDate: checkOut
        });

        // 3. 토큰을 Session Storage에 저장
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

        {/* 숙소 정보 헤더 */}
        <div className="px-4 md:px-0 mt-4 mb-8">
           <div className="flex justify-between items-start">
              <div>
                <span className="text-gray-500 text-sm font-bold">{accommodation.type || "호텔/리조트"}</span>
                <h1 className="text-3xl font-bold mt-1 text-gray-900">{accommodation.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                    <span className="bg-yellow-400 text-white px-1.5 py-0.5 rounded text-sm font-bold">{accommodation.ratingAvg || 9.5}</span>
                    <span className="text-gray-600 text-sm">추천해요 ({accommodation.reviewCount || 0}명 평가)</span>
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

        {/* [수정] 탭 메뉴에 '숙소 정보' 추가 */}
        <StickyTabs 
          activeTab="rooms" 
          onTabClick={(tab) => {
             if(tab === 'rooms') scrollToSection(roomsRef);
             if(tab === 'info') scrollToSection(infoRef); // [추가]
             if(tab === 'location') scrollToSection(locationRef);
             if(tab === 'reviews') scrollToSection(reviewsRef);
          }}
          // StickyTabs 컴포넌트가 tabs 배열 props를 지원한다면 아래와 같이 전달
          tabs={[
            { id: 'rooms', label: '객실안내/예약' },
            { id: 'info', label: '숙소정보' },
            { id: 'location', label: '위치/리뷰' }
          ]}
        />

        {/* 4. 객실 리스트 (기존 코드 그대로 유지) */}
        <div ref={roomsRef} className="px-4 md:px-0 py-10 scroll-mt-16">
            <h2 className="text-xl font-bold mb-5">객실 선택</h2>
            <div className="space-y-6">
                {rooms.map((room) => (
                    <div key={room.roomId} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row h-auto md:h-64 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full md:w-1/3 bg-gray-200 relative">
                             <img 
                                src={room.mainPhotoUrl || "/images/no-image.png"} 
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

        {/* 🌟 [추가] 숙소 정보 섹션 (소개, 규정, 판매자정보) */}
        <div ref={infoRef} className="px-4 md:px-0 py-6 scroll-mt-20 space-y-12">
            
            {/* 숙소 소개 */}
            <section>
                <h2 className="text-xl font-bold mb-4">숙소 소개</h2>
                <div className="text-gray-600 leading-7 whitespace-pre-line bg-gray-50 p-6 rounded-xl">
                    {accommodation.description || "등록된 소개글이 없습니다."}
                </div>
            </section>

            {/* 기본 정보 / 취소 규정 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <h2 className="text-xl font-bold mb-4">확인사항 및 기타</h2>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                        <li>위의 정보는 호텔의 사정에 따라 변경될 수 있습니다</li>
                        <li>미성년자는 보호자 동반 없이 이용이 불가합니다</li>
                        <li>이미지는 실제와 상이할 수 있습니다</li>
                        <li>객실가는 세금, 봉사료가 포함된 금액입니다</li>
                        <li>체크인 : {accommodation.checkinTime || "15:00"} | 체크아웃 : {accommodation.checkoutTime || "11:00"}</li>
                    </ul>
                </div>
                <hr></hr>
                <div>
                     <h2 className="text-xl font-bold mb-4">취소 및 환불 규정</h2>
                     <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex justify-between"><span>체크인일 기준 5일 전</span> <span className="font-bold">100% 환불</span></li>
                        <li className="flex justify-between"><span>체크인일 기준 4일 전</span> <span className="font-bold">70% 환불</span></li>
                        <li className="flex justify-between"><span>체크인일 기준 3일 전</span> <span className="font-bold">50% 환불</span></li>
                        <li className="flex justify-between"><span>체크인일 기준 2일 전</span> <span className="font-bold">30% 환불</span></li>
                        <li className="flex justify-between"><span>체크인일 기준 1일 전~당일 및 No-show</span> <span className="font-bold text-red-500">환불 불가</span></li>
                        <li className="text-xs text-gray-400 mt-2">* 취소, 환불 시 수수료가 발생할 수 있습니다.</li>
                     </ul>
                </div>
            </section>

            {/* 판매자 정보 */}
            <section className="pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold mb-4">판매자 정보</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <button 
                        onClick={() => setIsSellerModalOpen(true)}
                        className="text-gray-600 underline hover:text-black flex items-center gap-1 font-medium"
                    >
                        {accommodation.sellerInfo?.bizName || "판매자 정보 보기"} 
                        <span className="text-xs border border-gray-400 rounded-full w-4 h-4 flex items-center justify-center">i</span>
                    </button>
                    <span>|</span>
                    <span>대표자: {accommodation.sellerInfo?.ceoName || "-"}</span>
                </div>
            </section>
        </div>

        <hr className="my-10 border-gray-100"/>

        {/* 위치 정보 (주석 해제 및 활성화) */}
        <div ref={locationRef} className="px-4 md:px-0 py-6 scroll-mt-20">
           <h2 className="text-xl font-bold mb-4">위치 정보</h2>
           <div className="text-gray-600 mb-4">{accommodation.address}</div>
           {/* 지도 API 영역 Placeholder */}
           <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border relative overflow-hidden">
               {/* 실제 지도 연동 시 여기에 Map 컴포넌트 배치 */}
               <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2">🗺️</span>
                    <span>지도 API 영역</span>
                    <span className="text-xs text-gray-500 mt-1">({accommodation.latitude}, {accommodation.longitude})</span>
               </div>
           </div>
        </div>

        {/* 리뷰 (주석 처리된 상태 유지하거나 필요시 해제) */}
        {/*
        <div ref={reviewsRef} className="px-4 md:px-0 py-6 scroll-mt-20">
           <h2 className="text-xl font-bold mb-4">리뷰</h2>
           <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500">
              실제 투숙객들의 리뷰가 표시될 영역입니다.
           </div>
        </div>
        */}
      </div>

      {isServiceOpen && (
        <ServiceModal 
           amenities={accommodation.amenities} 
           onClose={() => setIsServiceOpen(false)} 
        />
      )}

      {isGalleryOpen && (
        <GalleryModal 
            images={allGalleryImages}
            startIndex={galleryStartIndex}
            onClose={() => setIsGalleryOpen(false)}
        />
      )}
      
      {/* 판매자 정보 모달 */}
      {isSellerModalOpen && (
          <SellerInfoModal 
              sellerInfo={accommodation.sellerInfo} 
              onClose={() => setIsSellerModalOpen(false)} 
          />
      )}
    </div>
  );
}