import React, { useState } from 'react';
import { UserCheck, ShoppingBag, Map, Star, Settings } from 'lucide-react';
import { mockBookings } from '../data/mockData';

const MyInfo = ({ user }) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">내 정보 (R001)</h3>
    <div className="space-y-3">
      <p><strong>닉네임:</strong> {user.nickname}</p>
      <p><strong>이름:</strong> {user.name}</p>
      <p><strong>이메일:</strong> {user.email}</p>
      <p><strong>생년월일:</strong> {user.birthDate}</p>
      <p><strong>전화번호:</strong> {user.phone}</p>
      <button className="btn-secondary-outline mt-4">정보 수정</button>
    </div>
  </div>
);

/**
 * 마이페이지
 * @param {object} props
 * @param {string} props.subPage - 현재 활성화된 서브페이지
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {object} props.user - 로그인한 사용자 정보
 */
const MyPage = ({ subPage, setPage, user }) => {
  const [currentSubPage, setCurrentSubPage] = useState(subPage || 'info');
  
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  
  const handleVerify = (e) => {
    e.preventDefault();
    if (password === "Test1234!") {
      setIsVerified(true);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'info':
        return <MyInfo user={user} />;
      case 'bookings':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">예약/결제 내역 (R007)</h3>
            <div className="space-y-4">
              {mockBookings.map(booking => (
                <div key={booking.id} className="border p-4 rounded-lg">
                  <p className="font-semibold">{booking.accommodation}</p>
                  <p>일정: {booking.checkin} ~ {booking.checkout}</p>
                  <p>금액: {booking.totalAmount.toLocaleString()}원</p>
                  <p>예약 상태: {booking.status}</p>
                  <p>결제 상태: {booking.paymentStatus}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'reviews':
        return (
           <div>
            <h3 className="text-xl font-semibold mb-4">후기 관리 (R006)</h3>
            <p className="text-gray-600 mb-4">이용 완료된 예약에 한해 후기를 작성할 수 있습니다.</p>
            <button 
              onClick={() => setPage('write-review')}
              className="btn-primary"
            >
              후기 작성하기
            </button>
          </div>
        );
      case 'preferences':
         return (
           <div>
            <h3 className="text-xl font-semibold mb-4">여행 취향 설문 (R005)</h3>
            <p>여행 취향 설문 수정 폼이 여기에 표시됩니다.</p>
          </div>
         );
      default:
        return <MyInfo user={user} />;
    }
  };

  if (!isVerified) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-lg">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">비밀번호 확인</h2>
          <p className="text-gray-600 mb-6">R009: 회원 정보를 안전하게 보호하기 위해 비밀번호를 다시 입력해주세요.</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="비밀번호"
            />
            <button type="submit" className="btn-primary w-full">확인</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="w-full md:w-1/4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setCurrentSubPage('info')}
                className={`mypage-nav-link ${currentSubPage === 'info' && 'mypage-nav-link-active'}`}
              >
                <UserCheck size={20} className="mr-2" />내 정보
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentSubPage('bookings')}
                className={`mypage-nav-link ${currentSubPage === 'bookings' && 'mypage-nav-link-active'}`}
              >
                <ShoppingBag size={20} className="mr-2" />예약 내역
              </button>
            </li>
             <li>
              <button 
                onClick={() => setPage('my-itineraries')}
                className={`mypage-nav-link`}
              >
                <Map size={20} className="mr-2" />내 일정
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentSubPage('reviews')}
                className={`mypage-nav-link ${currentSubPage === 'reviews' && 'mypage-nav-link-active'}`}
              >
                <Star size={20} className="mr-2" />후기 관리
              </button>
            </li>
             <li>
              <button 
                onClick={() => setCurrentSubPage('preferences')}
                className={`mypage-nav-link ${currentSubPage === 'preferences' && 'mypage-nav-link-active'}`}
              >
                <Settings size={20} className="mr-2" />여행 취향 설정
              </button>
            </li>
          </ul>
        </nav>
        <main className="w-full md:w-3/4 bg-white p-6 rounded-lg shadow-md">
          {renderSubPage()}
        </main>
      </div>
    </div>
  );
};

export default MyPage;