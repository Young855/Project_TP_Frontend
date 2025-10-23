import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * 후기 작성 페이지 (R002, R006)
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {function} props.showModal - 모달 표시 함수
 */
const WriteReviewPage = ({ setPage, showModal }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // R002: 후기(텍스트, 사진, 평점) 작성
    // Mock: API로 후기 제출
    console.log({ rating, reviewText, photos: '...' });
    
    showModal('후기 작성 완료', '소중한 후기를 남겨주셔서 감사합니다.', () => {
      setPage('my-page', { subPage: 'reviews' });
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">후기 작성</h1>
      <p className="mb-4 text-gray-600">R006: 이용 완료된 '제주 신라 호텔' 예약에 대한 후기를 작성합니다.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 space-y-6">
        <div>
          <label className="form-label">평점 (R002)</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-colors"
              >
                <Star 
                  size={32} 
                  className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="reviewText" className="form-label">후기 내용 (R002)</label>
          <textarea
            id="reviewText"
            rows="6"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="form-input"
            placeholder="여행 경험을 공유해주세요."
          ></textarea>
        </div>
        
        <div>
          <label className="form-label">사진 첨부 (R002)</label>
          <input 
            type="file"
            multiple
            className="form-input"
          />
        </div>
        
        <button type="submit" className="btn-primary w-full text-lg">
          작성 완료
        </button>
      </form>
    </div>
  );
};

export default WriteReviewPage;