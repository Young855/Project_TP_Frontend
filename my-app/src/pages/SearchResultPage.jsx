import React from 'react';
import { Star, Heart } from 'lucide-react';
import { mockAccommodations } from '../data/mockData';

/**
 * 숙소 검색 결과 페이지
 * @param {object} props
 * @param {object} props.searchParams - 검색 파라미터
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {function} props.setSelectedAccommodation - 선택된 숙소 설정
 */
const SearchResultsPage = ({ searchParams, setPage, setSelectedAccommodation }) => {
  const handleSelect = (accommodation) => {
    setSelectedAccommodation(accommodation);
    setPage('accommodation-detail');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold mb-6">
        '{searchParams.destination || '전체'}' 검색 결과
        <span className="text-lg font-normal text-gray-600 ml-2">
          ({searchParams.checkIn} ~ {searchParams.checkOut} / {searchParams.guests}명)
        </span>
      </h2>

      {/* 필터 (구현은 생략) */}
      <div className="mb-4 flex space-x-2">
        <button className="filter-chip">가격</button>
        <button className="filter-chip">리뷰 평점</button>
        <button className="filter-chip">시설</button>
      </div>

      {/* 숙소 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockAccommodations.map((acc) => (
          <div 
            key={acc.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleSelect(acc)}
          >
            <div className="relative">
              <img src={acc.imageUrl} alt={acc.title} className="w-full h-48 object-cover" />
              <button className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-md text-gray-600 hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">{acc.location}</span>
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-semibold">{acc.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({acc.reviewCount})</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">{acc.title}</h3>
              <p className="text-xl font-bold text-gray-800 mt-2">
                {acc.price.toLocaleString()}원
                <span className="text-base font-normal text-gray-600"> / 1박</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;