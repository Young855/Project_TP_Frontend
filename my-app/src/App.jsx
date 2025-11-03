import React, { useState, useEffect } from 'react';
import { Outlet, RouterProvider, createBrowserRouter, useNavigate } from 'react-router-dom';
import { mockItinerary } from './data/mockData';
import './index.css';

// Layout & Global Components
import Modal from './components/Modal';
import Header from './components/Header';

// Page Components (파일 구조를 참조하여 경로 설정)
import MainPage from './pages/MainPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/user/SignupPage';
import FindPasswordPage from './pages/user/FindPasswordPage';
import MyPage from './pages/user/MyPage';
import ItineraryPage from './pages/itinerary/ItineraryPage';
import WriteReviewPage from './pages/WriteReviewPage';
import PartnerPropertiesPage from './pages/property/PartnerPropertiesPage';
// 필요한 다른 컴포넌트들도 추가해야 합니다.

// --- Main Layout Component (Header와 Modal을 포함하는 공통 레이아웃) ---
// useNavigate를 사용하기 위해 App 함수 내부에 정의
function MainLayout() {
    const navigate = useNavigate(); // 페이지 이동을 react-router-dom의 navigate로 대체
    
    // R014: 로그인 상태 (Mock)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchParams, setSearchParams] = useState({});
    const [selectedAccommodation, setSelectedAccommodation] = useState(null);

    // 모달 상태 (Modal 컴포넌트에 직접 연결)
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        content: '',
        onConfirm: null,
    });

    // 기존 App.jsx의 showModal, closeModal 함수는 그대로 사용
    const closeModal = () => {
        setModal({ isOpen: false, title: '', content: '', onConfirm: null });
    };

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
    
    // R002 (Naver Map) 로직은 그대로 유지
    useEffect(() => {
        const naverMapClientId = 'YOUR_NAVER_MAP_CLIENT_ID';
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

    // 로그인/로그아웃 핸들러는 그대로 유지하되, navigateTo 대신 navigate 사용
    const handleLogin = (user) => {
        setIsLoggedIn(true);
        setCurrentUser(user);
        // 로그인 성공 후 메인 페이지 또는 이전 페이지로 이동
        const nextPath = localStorage.getItem('nextPath') || '/';
        localStorage.removeItem('nextPath');
        navigate(nextPath);
    };

    const handleLogout = () => {
        showModal('로그아웃', '정말 로그아웃 하시겠습니까?', () => {
            setIsLoggedIn(false);
            setCurrentUser(null);
            navigate('/'); // 메인 페이지로 이동
        });
    };
    
    // R013: 인증이 필요한 페이지 접근 시 처리 (라우터에서 직접 처리하기 어려워 Layout에서 처리)
    // 이 로직은 각 페이지 컴포넌트에서 `useLocation`과 함께 더 명확하게 처리하는 것이 일반적입니다.
    const checkAuthAndNavigate = (path) => {
        const protectedPaths = ['/user/mypage', '/itinerary', '/booking', '/payment', '/write-review'];
        
        if (protectedPaths.includes(path) && !isLoggedIn) {
            showModal('로그인 필요', '로그인이 필요한 서비스입니다.', () => {
                localStorage.setItem('nextPath', path); // 로그인 후 이동할 페이지 저장
                navigate('/login');
            });
            return false;
        }
        return true;
    };
    
    // context를 사용하여 isLoggedIn, currentUser, showModal 등을 자식 페이지에 전달
    const appProps = {
        isLoggedIn, 
        currentUser,
        showModal,
        // ... 필요한 모든 상태 및 핸들러
        onLogin: handleLogin, 
        onLogout: handleLogout,
        setSearchParams,
        searchParams,
        setSelectedAccommodation,
        selectedAccommodation,
        // navigate: navigate, // react-router-dom의 navigate 사용
        checkAuth: checkAuthAndNavigate,
    };
    
    return (
        <div className="font-sans bg-gray-50 min-h-screen">
            <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} navigate={navigate} />

            <main>
                {/* 자식 라우트 컴포넌트가 렌더링될 위치 */}
                <Outlet context={appProps} />
            </main>

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

// --- 라우터 설정 ---
const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [ 
            { 
                index: true, // '/' 경로 (메인 페이지)
                element: <MainPage />,
            },
            
            { path: "login", element: <LoginPage /> },
            { path: "user/signup", element: <SignupPage /> },
            { path: "find-password", element: <FindPasswordPage /> },

            { path: "search-results", element: <SearchResultsPage /> },
            { path: "accommodation/:id", element: <AccommodationDetailPage /> }, // 상세 페이지는 보통 ID를 URL 파라미터로 받음
            { path: "booking", element: <BookingPage /> },
            { path: "payment", element: <PaymentPage /> },
            
            { path: "user/mypage", element: <MyPage /> },
            
            { path: "inptinerary", element: <ItineraryPage itinerary={mockItinerary} /> },
            { path: "write-review", element: <WriteReviewPage /> },
            
            { path: "property/properties", element: <PartnerPropertiesPage /> },
        
            { path: "community", element: (
                <div className="container mx-auto p-8 text-center"><h1 className="text-3xl font-bold">커뮤니티/후기 목록 (R005)</h1></div>
            )},
            { path: "admin", element: (
                <div className="container mx-auto p-8 text-center"><h1 className="text-3xl font-bold">어드민 페이지 (R003)</h1></div>
            )},

        
        ] 
    }
]);

export default function App() {
    return <RouterProvider router={router} />;
}