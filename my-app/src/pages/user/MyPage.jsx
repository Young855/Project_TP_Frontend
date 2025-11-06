// src/pages/user/MyPage.jsx
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // ★ 추가: Outlet context로 currentUser 받기
import { UserCheck, ShoppingBag, Map, Star, Settings } from 'lucide-react';

// mock 데이터 (named export 가정). default export라면 import 문을 바꿔주세요.
import { mockBookings } from '../../data/mockData';

/** 내 정보 섹션 */
const MyInfo = ({ user }) => {
  // user 미주입/로딩 시 안전 가드 (비동기 로딩/컨텍스트 타이밍 문제 방지)
  if (!user) {
    return <div className="text-gray-500">사용자 정보를 가져오는 중…</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">내 정보</h3>
      <div className="space-y-3">
        {/* 실제 스키마가 user.profile.nickname 이라면 아래를 user?.profile?.nickname 으로 변경 */}
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
 * @param {object} props
 * @param {string} props.subPage - 현재 활성화된 서브페이지
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {object} props.user - (선택) 상위에서 직접 내려주는 사용자 정보
 */
const MyPage = ({ subPage, setPage, user: propUser }) => {
  // ★★★ 핵심: App(MainLayout)의 Outlet context에서 currentUser 받기
  // App.jsx에서 <Outlet context={appProps} /> 이고, appProps에 currentUser가 들어있음.
  const { currentUser } = useOutletContext() || {};
  // props > context 우선순위 (props가 있으면 그걸 쓰고, 없으면 context 사용)
  const user = propUser ?? currentUser;

  const [currentSubPage, setCurrentSubPage] = useState(subPage || 'info');

  // (예시) 비밀번호 확인 로직
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (password === 'Test1234!') {
      setIsVerified(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  // ★ 로딩 문구가 "잠깐만" 나오길 원하므로,
  // 페이지 전체 가드(if !user return ...)는 제거하고
  // '내 정보' 섹션 내부(MyInfo)에서만 로딩을 보여주도록 유지.
  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'info':
        return <MyInfo user={user} />;

      case 'bookings':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">예약/결제 내역</h3>
            <div className="space-y-4">
              {(Array.isArray(mockBookings) ? mockBookings : []).map((booking) => (
                <div key={booking.id} className="border p-4 rounded-lg">
                  <p className="font-semibold">{booking.accommodation}</p>
                  <p>일정: {booking.checkin} ~ {booking.checkout}</p>
                  <p>금액: {Number(booking.totalAmount).toLocaleString()}원</p>
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

  // 비밀번호 확인 단계
  if (!isVerified) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-lg">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">비밀번호 확인</h2>
          <p className="text-gray-600 mb-6">
            R009: 회원 정보를 안전하게 보호하기 위해 비밀번호를 다시 입력해주세요.
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="비밀번호"
            />
            <button type="submit" className="btn-primary w-full">
              확인
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 메인 렌더
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      {/* ★ 간격/레이아웃 보정: 좌측 네비 고정폭, 우측 패널은 flex-1, 컬럼 간 gap 축소 */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <nav className="w-full md:w-[220px]">
          {/* ★ 세로 스택 & 매우 좁은 간격: gap-[1px] 사용 */}
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
