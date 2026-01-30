import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

/**
 * @param {Array} images - 보여줄 이미지 객체 배열 [{ id, url, description, type }]
 * @param {Number} startIndex - 처음에 보여줄 이미지 인덱스
 * @param {Function} onClose - 모달 닫기 함수
 */
export default function GalleryModal({ images = [], startIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // 모달이 열릴 때 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // 이전 이미지
  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // 다음 이미지
  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black flex flex-col" // [수정] flex-col로 상하 분리
      onClick={onClose}
    >
      {/* 닫기 버튼 */}
      <button 
        className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-50 p-2 bg-black/20 rounded-full"
        onClick={onClose}
      >
        <FaTimes />
      </button>

      {/* 1. 이미지 영역 (화면의 남은 공간을 모두 차지: flex-1) */}
      <div 
        className="flex-1 relative w-full overflow-hidden flex items-center justify-center bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* object-contain: 비율 유지하며 영역 내 최대 크기 (짤림 없음)
            w-full h-full: 부모 영역(상단 전체) 꽉 채움 
        */}
        <img 
          src={currentImage.url} 
          alt={currentImage.description || `Gallery Image ${currentIndex}`} 
          className="w-full h-full object-contain select-none"
        />

        {/* 좌우 버튼 (이미지 영역 안에 배치하여 텍스트 영역 침범 X) */}
        {images.length > 1 && (
          <>
            <button 
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white text-4xl md:text-6xl p-4 hover:bg-white/10 rounded-full transition-all"
              onClick={handlePrev}
            >
              <FaChevronLeft />
            </button>
            <button 
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white text-4xl md:text-6xl p-4 hover:bg-white/10 rounded-full transition-all"
              onClick={handleNext}
            >
              <FaChevronRight />
            </button>
          </>
        )}
      </div>

      {/* 2. 텍스트 영역 (하단에 고정, 이미지와 겹치지 않음) */}
      <div 
        className="w-full bg-[#1a1a1a] p-6 text-center shrink-0 z-50 border-t border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
          <h3 className="text-xl font-bold text-white mb-2">
              {currentImage.description || "상세 이미지"}
          </h3>
          <p className="text-gray-400 text-sm">
              {currentIndex + 1} / {images.length}
          </p>
      </div>
    </div>
  );
}