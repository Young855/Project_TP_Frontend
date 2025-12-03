import { useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import './index.css';

import Header from './components/Header';
import Modal from './components/Modal';
import SideDrawer from './components/SideDrawer';
import PartnerLayout from './Layout/PartnerLayout';

import MainPage from './pages/MainPage';
import FindPasswordPage from './pages/user/FindPasswordPage';
import SearchResultPage from './pages/SearchResultPage';
import AccommodationDetailPage from './pages/AccommodationDetailPage'; // 기존 파일명 유지 (유저사이드)
import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/PaymentPage';
import WriteReviewPage from './pages/WriteReviewPage';
import LoginSelectionPage from './pages/LoginSelection';
import ItineraryPage from './pages/itinerary/ItineraryPage';


import PartnerDashboard from './pages/partner/PartnerDashboard';
import UserRouter from "./routers/UserRouter";
import partnerAccommodationRoutes from './routers/PartnerAccomodationRouter';
import FavoriteRouter from './routers/FavoriteRouter';
import PartnerRouter from './routers/PartnerRouter';
import RoomRouter from './routers/RoomRouter';

// [수정] API 함수명 변경
import { getAllAccommodations } from "./api/accommodationAPI"; 
import FilterRouter from './routers/FilterRouter';
import { searchResultRouter } from './routers/SearchResultRouter';

const Placeholder = ({ title }) => (
  <div className="p-8 text-2xl font-bold text-gray-400">
    {title} 페이지 준비중
  </div>
);

function UserLayout() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchParams, setSearchParams] = useState({});
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    content: "",
    onConfirm: null,
  });

  const closeModal = () => {
    setModal({ isOpen: false, title: "", content: "", onConfirm: null });
  };

  const showModal = (title, content, onConfirm) => {
    setModal({
      isOpen: true,
      title,
      content,
      onConfirm: onConfirm
        ? () => {
            onConfirm();
            closeModal();
          }
        : null,
    });
  };

  useEffect(() => {
    const naverMapClientId = 'YOUR_NAVER_MAP_CLIENT_ID';
    if (!document.getElementById('naver-maps-script')) {
      const script = document.createElement('script');
      script.id = 'naver-maps-script';
      script.type = 'text/javascript';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverMapClientId}`;
      script.async = true;
      script.onerror = () =>
        console.error("Naver Maps API 스크립트 로드에 실패했습니다.");
      document.head.appendChild(script);
    }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    const nextPath = localStorage.getItem('nextPath') || '/';
    localStorage.removeItem('nextPath');
    navigate(nextPath);
  };

  const handleLogout = () => {
    showModal('로그아웃', '정말 로그아웃 하시겠습니까?', () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
      navigate('/');
    });
  };

  const checkAuthAndNavigate = (path) => {
    const protectedPaths = [
      '/user/mypage',
      '/itinerary',
      '/booking',
      '/payment',
      '/write-review',
    ];
    if (protectedPaths.includes(path) && !isLoggedIn) {
      showModal('로그인 필요', '로그인이 필요한 서비스입니다.', () => {
        localStorage.setItem('nextPath', path);
        navigate('/login');
      });
      return false;
    }
    return true;
  };

  // 메인/헤더에서 공통으로 사용하는 검색 함수 / 메인 페이지든 헤더든 전부 이 handleSearch만 호출
  const handleSearch = async ({ destination, checkIn, checkOut, guests }) => {
    try {
      const all = await getAllProperties(); // 전체 숙소 조회
      const list = Array.isArray(all) ? all : all?.content || [];
      const keyword = (destination || "").toLowerCase();

      // 기본 검색: 숙소 이름 / 주소 / 도시
      const filtered = keyword
        ? list.filter((p) => {
            const name = (p.name || "").toLowerCase();
            const address = (p.address || "").toLowerCase();
            const city = (p.city || "").toLowerCase();
            return (
              name.includes(keyword) ||
              address.includes(keyword) ||
              city.includes(keyword)
            );
          })
        : list;

      // 검색 결과 페이지로 이동
      navigate('/search-results', {
        state: {
          results: filtered,
          criteria: { destination, checkIn, checkOut, guests },
        },
      });
    } catch (e) {
      console.error('숙소 검색 오류:', e);
      alert('숙소 검색 중 오류가 발생했습니다.');
    }
  };

  const appProps = {
    isLoggedIn,
    currentUser,
    showModal,
    onLogin: handleLogin,
    onLogout: handleLogout,
    setSearchParams,
    searchParams,
    setSelectedAccommodation,
    selectedAccommodation,
    checkAuth: checkAuthAndNavigate,
    onSearch: handleSearch,
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        navigate={navigate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onSubmitSearch={handleSearch} // 헤더 검색 패널에서 검색 누르면 handleSearch로 연결
      />

      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        <Outlet context={appProps} />
      </main>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        confirmText={modal.onConfirm ? '확인' : null}
        onConfirm={modal.onConfirm}
        cancelText={modal.onConfirm ? null : '취소'}
      >
        <p>{modal.content}</p>
      </Modal>
    </div>
  );
}

// 🔹 메인 페이지 + 검색 로직 (UserLayout의 onSearch를 사용)
function MainPageWithSearch() {
  const { onSearch } = useOutletContext();
  return <MainPage onSearch={onSearch} />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <MainPageWithSearch /> },
      { path: 'login-selection', element: <LoginSelectionPage /> },
      { path: 'find-password', element: <FindPasswordPage /> },
      { path: 'search-results', element: <SearchResultPage /> },
      { path: 'bookings/*', element: <BookingPage /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'itinerary', element: <ItineraryPage /> },
      { path: 'write-review', element: <WriteReviewPage /> },
      ...FilterRouter,
      ...PartnerRouter,
      ...UserRouter,
      ...FavoriteRouter,
    ],
  },

  {
    path: '/partner',
    element: <PartnerLayout />,
    children: [
      { index: true, element: <PartnerDashboard /> },
      {path : 'dashboard', element: <PartnerDashboard/>},
      { path: 'accommodations', element: <Placeholder title="숙소 관리" /> }, 
      { path: 'reservations', element: <Placeholder title="예약 관리" /> },
      ...RoomRouter,
      ...partnerAccommodationRoutes, 
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
