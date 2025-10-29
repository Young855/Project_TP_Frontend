import React, { useState, useEffect } from 'react';
import { mockItinerary } from './data/mockData';
import './index.css';
// Helper Components
import Modal from './components/Modal';
import Header from './components/Header';

// Page Components
import MainPage from './pages/MainPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/user/SignupPage';
import FindPasswordPage from './pages/user/FindPasswordPage';
import MyPage from './pages/MyPage';
import ItineraryPage from './pages/itinerary/ItineraryPage';
import WriteReviewPage from './pages/WriteReviewPage';
import PartnerPropertiesPage from './pages/property/PartnerPropertiesPage';
// --- Main App Component ---

export default function App() {
  const [page, setPage] = useState('main'); // 페이지 라우팅 상태
  const [pageParams, setPageParams] = useState({}); // 페이지 이동 시 전달할 파라미터
  
  // R014: 로그인 상태 (Mock)
  // 실제로는 JWT 토큰 유무 및 유효성으로 판단
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [searchParams, setSearchParams] = useState({});
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  
  // 모달 상태
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    content: '',
    onConfirm: null,
  });

  // R002 (Naver Map): Naver Map API 스크립트 동적 로드
  useEffect(() => {
    const naverMapClientId = 'YOUR_NAVER_MAP_CLIENT_ID'; // !중요! 여기에 실제 네이버 클라우드 플랫폼 Client ID를 입력하세요.
    
    if (!document.getElementById('naver-maps-script')) {
      const script = document.createElement('script');
      script.id = 'naver-maps-script';
      script.type = 'text/javascript';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapClientId}`;
      script.async = true;
      script.onerror = () => console.error("Naver Maps API 스크립트 로드에 실패했습니다.");
      document.head.appendChild(script);
    }
  }, []);

  /**
   * 공용 모달 표시 함수
   * @param {string} title - 모달 제목
   * @param {string} content - 모달 내용
   * @param {function} [onConfirm] - (옵션) 확인 버튼 핸들러
   */
  const showModal = (title, content, onConfirm) => {
    setModal({
      isOpen: true,
      title,
      content,
      onConfirm: onConfirm ? () => {
        onConfirm();
        closeModal();
      } : null,
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', content: '', onConfirm: null });
  };

  /**
   * 페이지 이동 함수 (R013: 인증 필요한 페이지 리다이렉트 처리)
   * @param {string} newPage - 이동할 페이지 이름
   * @param {object} [params] - (옵션) 전달할 파라미터
   */
  const navigateTo = (newPage, params = {}) => {
    const protectedPages = [
      'my-page', 'my-itineraries', 'booking', 'payment', 'write-review'
    ];
    
    if (protectedPages.includes(newPage) && !isLoggedIn) {
      // R013: 권한 필요한 기능 접근 시 로그인 페이지로
      showModal('로그인 필요', '로그인이 필요한 서비스입니다.', () => {
        setPage('login');
        setPageParams({ next: newPage, ...params }); // 로그인 후 이동할 페이지 저장
      });
    } else if (newPage === 'login-required') {
      // Header 등에서 직접 호출한 경우
       showModal('로그인 필요', '로그인이 필요한 서비스입니다.', () => {
        setPage('login');
        setPageParams(params);
      });
    } else {
      setPage(newPage);
      setPageParams(params);
    }
  };


  // --- 인증 핸들러 (R014: JWT 기반으로 주석 처리) ---
  
  const handleLogin = (user) => {
    // --- AUTHENTICATION LOGIC ---
    // 실제로는 JWT 토큰을 저장
    // localStorage.setItem('jwt', user.token); 
    
    // Mock: 상태 업데이트
    setIsLoggedIn(true);
    setCurrentUser(user);
    
    // R006, R013: 로그인 성공 시 이전 페이지 또는 메인으로 이동
    const next = pageParams.next || 'main';
    navigateTo(next);
    // --- END AUTHENTICATION LOGIC ---
  };

  const handleLogout = () => {
    // R010: 로그아웃 확인 팝업
    showModal('로그아웃', '정말 로그아웃 하시겠습니까?', () => {
      // --- AUTHENTICATION LOGIC ---
      // localStorage.removeItem('jwt');
      
      // Mock: 상태 업데이트
      setIsLoggedIn(false);
      setCurrentUser(null);
      navigateTo('main'); // 메인 페이지로 이동
      // --- END AUTHENTICATION LOGIC ---
    });
  };
  
  // 검색 실행 핸들러
  const handleSearch = (params) => {
    setSearchParams(params);
    navigateTo('search-results');
  };

  // 현재 페이지 렌더링
  const renderPage = () => {
    switch (page) {
      case 'main':
        return <MainPage onSearch={handleSearch} />;
      case 'search-results':
        return <SearchResultsPage searchParams={searchParams} setPage={navigateTo} setSelectedAccommodation={setSelectedAccommodation} />;
      case 'accommodation-detail':
        return <AccommodationDetailPage accommodation={selectedAccommodation} setPage={navigateTo} isLoggedIn={isLoggedIn} />;
      case 'booking':
        return <BookingPage setPage={navigateTo} />;
      case 'payment':
        return <PaymentPage setPage={navigateTo} showModal={showModal} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} setPage={navigateTo} />;
      case 'signup':
        return <SignupPage setPage={navigateTo} showModal={showModal} />;
      case 'find-password':
        return <FindPasswordPage setPage={navigateTo} />;
      case 'my-page':
        return <MyPage subPage={pageParams.subPage} setPage={navigateTo} user={currentUser} />;
      case 'my-itineraries':
        // R001: 자동 생성된 일정표 확인
        return <ItineraryPage itinerary={mockItinerary} />;
      case 'write-review':
        return <WriteReviewPage setPage={navigateTo} showModal={showModal} />;
      // R002, R005: 커뮤니티/후기 페이지 (비회원 접근 가능)
      case 'community':
        return <div className="container mx-auto p-8 text-center"><h1 className="text-3xl font-bold">커뮤니티/후기 목록 (R005)</h1><p>비회원도 열람 가능한 후기 목록이 표시됩니다.</p></div>;
      // R003, R004: 어드민/파트너 (플레이스홀더)
      case 'admin':
        return <div className="container mx-auto p-8 text-center"><h1 className="text-3xl font-bold">어드민 페이지 (R003)</h1></div>;
      case 'partner':
        return <div className="container mx-auto p-8 text-center"><h1 className="text-3xl font-bold">파트너 페이지 (R004)</h1></div>;
     
      default:
        return <MainPage onSearch={handleSearch} />;
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/*         이제 <style> 태그 대신 src/index.css 파일이 전역 스타일을 관리합니다.
      */}
      
      {/* R002 (공통/접근): 비회원도 메인 페이지 조회 가능 */}
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} setPage={navigateTo} />
      
      <main>
        {renderPage()}
      </main>

      {/* R010: 로그아웃 확인 팝업 등 공용 모달 */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        confirmText={modal.onConfirm ? '확인' : null}
        onConfirm={modal.onConfirm}
      >
        <p>{modal.content}</p>
      </Modal>
    </div>
  );
}