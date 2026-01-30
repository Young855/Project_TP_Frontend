import { useState } from "react";
import { useNavigate, useParams, useLoaderData, useNavigation } from "react-router-dom"; 
import { deleteAccommodation } from "../../api/accommodationAPI";
import { usePartner } from "../../context/PartnerContext"; 
import { ACCOMMODATION_PHOTO_ENDPOINTS } from '../../config'; // ✅ config 파일 경로 확인 필요
import { 
  MapPin, Clock, Star, Building, User, ArrowLeft, Edit, Trash2, 
  CheckCircle, XCircle, Image as ImageIcon, Home, Info 
} from 'lucide-react';

const Spinner = ({ color = "text-white" }) => (
  <svg className={`animate-spin -ml-1 mr-2 h-4 w-4 ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// 상태 뱃지 스타일 함수
const getAuthBadgeColor = (authStatus) => {
  switch(authStatus) {
      case 'CONFIRM': return 'bg-green-100 text-green-700 border-green-200';
      case 'DECLINED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; 
  }
};

const AccommodationDetailPage = () => {
  const { accommodation } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading"; 
  const { refreshPartnerData } = usePartner();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 이미 이동 중이거나 삭제 중이면 클릭 차단
  const isBusy = isDeleting || isNavigating;

  const handleDelete = async () => {
    if (isBusy) return;

    if (window.confirm(`숙소 '${accommodation.name}'을(를) 정말 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`)) {
        try {
            setIsDeleting(true);
            await deleteAccommodation(id);
            await refreshPartnerData();
            navigate('/partner/accommodations'); 
        } catch (error) {
            console.error(error);
            alert("숙소 삭제 중 오류가 발생했습니다. 예약 내역을 확인해주세요.");
            setIsDeleting(false);
        }
    }
  };

  // 대표 이미지 찾기 (isMain 우선, 없으면 첫 번째)
  // [주의] PartnerAccommodationPage.jsx에서는 photoId를 사용했으므로 여기서도 photoId 사용
  const mainPhoto = accommodation.photos?.find(p => p.isMain) || accommodation.photos?.[0];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      
      {/* 1. 상단 헤더 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/partner/accommodations')} 
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
            title="목록으로 돌아가기"
            disabled={isBusy}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getAuthBadgeColor(accommodation.auth)}`}>
                    {accommodation.auth || 'PENDING'}
                </span>
                <span className="text-gray-500 text-sm font-medium flex items-center gap-1">
                    <Building className="w-3 h-3" /> {accommodation.accommodationType}
                </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {accommodation.name}
            </h1>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => navigate(`/partner/accommodations/${id}/edit`)} 
            disabled={isBusy} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isNavigating ? <Spinner /> : <Edit className="w-4 h-4" />}
            정보 수정
          </button>
          
          {accommodation.auth !== 'CONFIRM' && (
            <button 
                onClick={handleDelete}
                disabled={isBusy} 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDeleting ? <Spinner color="text-red-600" /> : <Trash2 className="w-4 h-4" />}
                숙소 삭제
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. 좌측: 이미지 및 핵심 요약 정보 */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* 이미지 카드 */}
            <div className="bg-gray-100 rounded-xl overflow-hidden shadow-sm aspect-[4/3] relative border border-gray-200 group">
                {mainPhoto ? (
                    <img 
                        src={ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(mainPhoto.photoId)} 
                        alt={accommodation.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                        <span className="font-medium">등록된 이미지가 없습니다</span>
                    </div>
                )}
                <div className="absolute bottom-3 right-3">
                    <button className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition backdrop-blur-sm flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        사진 관리 ({accommodation.photos?.length || 0})
                    </button>
                </div>
            </div>

            {/* 핵심 정보 카드 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 space-y-5">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">위치 정보</h3>
                        <p className="text-gray-900 font-medium">{accommodation.address}</p>
                        <p className="text-gray-500 text-sm mt-0.5">{accommodation.city}</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">체크인 / 체크아웃</h3>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div className="text-center">
                                <span className="block text-xs text-gray-500 mb-1">Check-in</span>
                                <span className="block font-bold text-blue-600 text-lg">{accommodation.checkinTime || "-"}</span>
                            </div>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div className="text-center">
                                <span className="block text-xs text-gray-500 mb-1">Check-out</span>
                                <span className="block font-bold text-red-500 text-lg">{accommodation.checkoutTime || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-0.5">파트너 정보</h3>
                         <p className="text-gray-900">{accommodation.partnerName || "정보 없음"}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. 우측: 상세 설명 및 편의시설 */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 평점 및 요약 배너 */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                        <span className="text-sm text-blue-600 font-bold uppercase">Average Rating</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">{accommodation.ratingAvg ?? "0.0"}</span>
                            <span className="text-gray-500">/ 5.0</span>
                        </div>
                    </div>
                </div>
                
                {/* 리뷰 카운트 등 추가 정보가 있다면 여기에 표시 */}
                <div className="text-sm text-blue-800 font-medium px-4 py-2 bg-blue-100 rounded-lg">
                    고객들이 신뢰하는 숙소입니다
                </div>
            </div>

            {/* 숙소 설명 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" /> 숙소 소개
                </h2>
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {accommodation.description || "등록된 숙소 설명이 없습니다."}
                    </p>
                </div>
            </div>

            {/* 편의시설 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-green-500" /> 편의시설
                </h2>
                {accommodation.amenities && accommodation.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {accommodation.amenities.map(amenity => (
                            <span 
                                key={amenity.amenityId} 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
                            >
                                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                {amenity.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>등록된 편의시설이 없습니다.</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailPage;