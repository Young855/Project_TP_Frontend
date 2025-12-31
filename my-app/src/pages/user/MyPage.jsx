// src/pages/user/MyPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserCheck, ShoppingBag, Map, Star, Settings } from 'lucide-react';

/** 내 정보 섹션 */
const MyInfo = ({ user }) => {
  // user 미주입/로딩 시 안전 가드
  if (!user) {
    return <div className="text-gray-500">사용자 정보를 가져오는 중…</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">내 정보</h3>
      <div className="space-y-3">
        {/* 실제 데이터 구조에 맞게 수정 (user.profile.nickname 등) */}
        <p><strong>닉네임:</strong> {user?.nickname ?? '-'}</p>
        <p><strong>이름:</strong> {user?.name ?? '-'}</p>
        <p><strong>이메일:</strong> {user?.email ?? '-'}</p>
        <p><strong>생년월일:</strong> {user?.birthDate ?? '-'}</p>
        <p><strong>전화번호:</strong> {user?.phone ?? '-'}</p>
        <button className="btn-secondary-outline mt-4">정보 수정</button>
      </div>
    </div>
  );
};

/**
 * 마이페이지
 */
const MyPage = ({ subPage, setPage, user: propUser }) => {
  // ★ App.jsx의 Outlet context에서 currentUser 받기
  const { currentUser } = useOutletContext() || {};
  const user = propUser ?? currentUser;

  const [currentSubPage, setCurrentSubPage] = useState(subPage || 'info');

  // 🗑️ [삭제됨] 비밀번호 확인 관련 state(isVerified, password) 및 handleVerify 함수 제거

  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'info':
        return <MyInfo user={user} />;

      case 'bookings':
        // (예시 데이터는 생략하거나 props로 받아야 함)
        const mockBookings = []; 
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">예약/결제 내역</h3>
            <div className="space-y-4">
              {mockBookings.length === 0 ? (
                <p className="text-gray-500">예약 내역이 없습니다.</p>
              ) : (
                mockBookings.map((booking) => (
                  <div key={booking.id} className="border p-4 rounded-lg">
                    <p className="font-semibold">{booking.accommodation}</p>
                    <p>일정: {booking.checkin} ~ {booking.checkout}</p>
                    <p>금액: {Number(booking.totalAmount).toLocaleString()}원</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">후기 관리</h3>
            <p className="text-gray-600 mb-4">이용 완료된 예약에 한해 후기를 작성할 수 있습니다.</p>
            <button onClick={() => setPage && setPage('write-review')} className="btn-primary">
              후기 작성하기
            </button>
          </div>
        );

      case 'preferences':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">여행 취향 설문</h3>
            <p>여행 취향 설문 수정 폼이 여기에 표시됩니다.</p>
          </div>
        );

      default:
        return <MyInfo user={user} />;
    }
  };

  // 🗑️ [삭제됨] if (!isVerified) return ... 블록 제거 (바로 마이페이지 렌더링)

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* 좌측 네비게이션 */}
        <nav className="w-full md:w-[220px]">
          <ul className="flex flex-col gap-[1px]">
            <li>
              <button
                onClick={() => setCurrentSubPage('info')}
                className={`mypage-nav-link ${currentSubPage === 'info' && 'mypage-nav-link-active'} block w-full text-left flex items-center gap-2 justify-start py-2`}
              >
                <UserCheck size={20} className="mr-2" />
                내 정보
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentSubPage('bookings')}
                className={`mypage-nav-link ${currentSubPage === 'bookings' && 'mypage-nav-link-active'} block w-full text-left flex items-center gap-2 justify-start py-2`}
              >
                <ShoppingBag size={20} className="mr-2" />
                예약 내역
              </button>
            </li>
            <li>
              <button
                onClick={() => setPage && setPage('my-itineraries')}
                className="mypage-nav-link block w-full text-left flex items-center gap-2 justify-start py-2"
              >
                <Map size={20} className="mr-2" />
                내 일정
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentSubPage('reviews')}
                className={`mypage-nav-link ${currentSubPage === 'reviews' && 'mypage-nav-link-active'} block w-full text-left flex items-center gap-2 justify-start py-2`}
              >
                <Star size={20} className="mr-2" />
                후기 관리
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentSubPage('preferences')}
                className={`mypage-nav-link ${currentSubPage === 'preferences' && 'mypage-nav-link-active'} block w-full text-left flex items-center gap-2 justify-start py-2`}
              >
                <Settings size={20} className="mr-2" />
                여행 취향 설정
              </button>
            </li>
          </ul>
        </nav>

        {/* 우측 콘텐츠 패널 */}
        <main className="flex-1 bg-white p-6 rounded-lg shadow-md">
          {renderSubPage()}
        </main>
      </div>
    </div>
  );
};

export default MyPage;