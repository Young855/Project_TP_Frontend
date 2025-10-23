import React from 'react';
import { MapPin, Star } from 'lucide-react';

/**
 * 숙소 상세 페이지
 * @param {object} props
 * @param {object} props.accommodation - 선택된 숙소
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {boolean} props.isLoggedIn - 로그인 여부
 */
const AccommodationDetailPage = ({ accommodation, setPage, isLoggedIn }) => {
  if (!accommodation) return null;

  const handleBooking = () => {
    if (isLoggedIn) {
      setPage('booking');
    } else {
      // R013: 비회원이 예약 시 로그인 페이지로 리다이렉트
      setPage('login-required', { next: 'booking' });
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <img src={accommodation.imageUrl} alt={accommodation.title} className="w-full h-64 md:h-96 object-cover" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{accommodation.title}</h1>
              <p className="text-lg text-gray-600 mt-1">
                <MapPin size={18} className="inline-block mr-1" />
                {accommodation.location}
              </p>
            </div>
            <div className="flex items-center mt-2 md:mt-0">
              <Star size={20} className="text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-xl font-bold">{accommodation.rating}</span>
              <span className="text-lg text-gray-500 ml-2">({accommodation.reviewCount}개 리뷰)</span>
            </div>
          </div>
          
          <div className="border-t border-b border-gray-200 py-6 my-6">
            <h2 className="text-xl font-semibold mb-4">숙소 정보</h2>
            <p className="text-gray-700 leading-relaxed">
              {accommodation.title}에서 편안한 휴식을 경험하세요. 
              최고의 서비스와 시설이 준비되어 있습니다. 
              (상세 설명 텍스트 영역)
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">주요 편의시설</h2>
            <div className="flex flex-wrap gap-4">
              <span className="amenity-chip">무료 Wi-Fi</span>
              <span className="amenity-chip">주차 가능</span>
              <span className="amenity-chip">수영장</span>
              <span className="amenity-chip">레스토랑</span>
              <span className="amenity-chip">피트니스 센터</span>
            </div>
          </div>

          {/* 후기 (R005: 비회원도 목록 열람 가능) */}
          <div>
            <h2 className="text-xl font-semibold mb-4">후기</h2>
            <div className="space-y-4">
              {/* Mock Review */}
              <div className="border p-4 rounded-lg">
                <div className="flex items-center mb-1">
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <Star size={16} className="text-gray-300 fill-gray-300" />
                  </div>
                  <span className="text-sm text-gray-500 ml-2">2025. 10. 20</span>
                </div>
                <p className="text-gray-800">"정말 깨끗하고 좋았어요. 위치도 최고!"</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 예약 버튼 영역 */}
        <div className="p-6 bg-gray-50 border-t sticky bottom-0">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg text-gray-700">1박</span>
              <p className="text-2xl font-bold text-gray-900">{accommodation.price.toLocaleString()}원</p>
            </div>
            <button onClick={handleBooking} className="btn-primary text-lg px-8 py-3">
              예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationDetailPage;