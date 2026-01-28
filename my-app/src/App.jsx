import { useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useOutletContext, Navigate } from 'react-router-dom';
import './index.css';
import { useUrlUser } from './hooks/useUrlUser';

import Header from './components/Header';
import Modal from './components/Modal';
import SideDrawer from './components/SideDrawer';
import PartnerLayout from './Layout/PartnerLayout';

import MainPage from './pages/MainPage';
import FindPasswordPage from './pages/user/FindPasswordPage';
import SearchResultPage from './pages/SearchResultPage';
import PaymentPage from './pages/PaymentPage';
import WriteReviewPage from './pages/WriteReviewPage';
import LoginSelectionPage from './pages/LoginSelection';


import PartnerDashboard from './pages/partner/PartnerDashboard';
import UserRouter from "./routers/UserRouter";
import partnerAccommodationRoutes from './routers/PartnerAccomodationRouter';
import FavoriteRouter from './routers/FavoriteRouter';
import PartnerRouter from './routers/PartnerRouter';
import RoomRouter from './routers/RoomRouter';
import BookingRouter from './routers/BookingRouter';

// [수정] API 함수명 변경
import FilterRouter from './routers/FilterRouter';
import AdminLayout from './Layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccommodationPage from './pages/accommodation/AccommodationRoomPage';
import AdminRouter from './routers/AdminRouter';
import PartnerBookingPage from "./pages/booking/PartnerBookingPage";

import ChatWidget from "./components/ChatWidget";

const Placeholder = ({ title }) => (
  <div className="p-8 text-2xl font-bold text-gray-400">
    {title} 페이지 준비중
  </div>
);

function UserLayout() {
  const navigate = useNavigate();
  const { userId } = useUrlUser();
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
        navigate('/login-section');       // section 추가
      });
      return false;
    }
    return true;
  };



  const handleSearch = ({ destination, checkIn, checkOut, guests }) => {
    if (!checkIn || !checkOut) {
      alert("체크인/체크아웃 날짜를 선택해주세요.");
      return;
    }

    const params = new URLSearchParams();
    if (destination) params.set("keyword", destination);
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("guests", String(guests ?? 2));

    // ✅ 검색은 '이동'만. 실제 검색 API는 SearchResultPage가 URL 보고 수행
    navigate(`/search-results?userId=${userId}&${params.toString()}`, {
      state: { criteria: { destination, checkIn, checkOut, guests } },
    });
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

      {/* ✅ (추가) 유저 화면 어디서든 챗봇 사용 가능 */}
      <ChatWidget />
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
      { path: 'accommodation/*', element:<AccommodationPage /> },
      ...BookingRouter,
      ...FilterRouter,
      ...PartnerRouter,
      ...UserRouter,
      ...FavoriteRouter,
      ...BookingRouter,
    ],
  },

  {
    path: '/partner',
    element: <PartnerLayout />,
    children: [
      { index: true, element: <Navigate to="accommodations" replace /> },
//      { index: true, element: <PartnerDashboard /> },
     {path : 'dashboard', element: <PartnerDashboard/>},
     {path : "booking-check",  element: <PartnerBookingPage /> },
      ...RoomRouter,
      ...partnerAccommodationRoutes, 
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />, 
    children: [
      { index: true, element: <Navigate to="accounts" replace /> },
     // { index: true, element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      ...AdminRouter,
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
