import React from 'react';

/**
 * 결제 페이지 (Mock)
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {function} props.showModal - 모달 표시 함수
 */
const PaymentPage = ({ setPage, showModal }) => {
  const handlePayment = () => {
    // R005: Mock 결제
    showModal('결제 성공', '결제가 성공적으로 완료되었습니다. 예약 내역 페이지로 이동합니다.', () => {
      setPage('my-page', { subPage: 'bookings' });
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">결제</h1>
      <div className="bg-white rounded-lg shadow-xl p-6">
        <p className="text-center text-lg mb-6">총 결제 금액: <span className="font-bold text-2xl ml-2">700,000원</span></p>
        {/* Mock 결제 UI */}
        <div className="space-y-4">
          <button className="w-full p-4 rounded-lg border border-gray-300 text-left font-medium hover:bg-gray-50">
            신용카드
          </button>
          <button className="w-full p-4 rounded-lg border border-gray-300 text-left font-medium hover:bg-gray-50">
            카카오페이
          </button>
          <button className="w-full p-4 rounded-lg border border-gray-300 text-left font-medium hover:bg-gray-50">
            네이버페이
          </button>
        </div>
        <button 
          onClick={handlePayment}
          className="btn-primary w-full text-lg mt-8"
        >
          700,000원 결제하기
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;