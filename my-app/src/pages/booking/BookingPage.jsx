import React from 'react';
import { CreditCard } from 'lucide-react';

/**
 * 예약 페이지 (Mock)
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 */
const BookingPage = ({ setPage }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">예약 확인</h1>
      <div className="bg-white rounded-lg shadow-xl p-6 space-y-4">
        <p>숙소: 제주 신라 호텔</p>
        <p>날짜: 2025-11-10 ~ 2025-11-12 (2박)</p>
        <p>인원: 2명</p>
        <p className="text-xl font-bold">총 금액: 700,000원</p>
        <button 
          onClick={() => setPage('payment')}
          className="btn-primary w-full text-lg mt-4"
        >
          <CreditCard size={20} className="inline-block mr-2" />
          결제하기
        </button>
      </div>
    </div>
  );
};

export default BookingPage;