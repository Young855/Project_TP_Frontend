import React from 'react';
import { X, LogOut, User, Calendar, MessageSquare, BookOpen, Heart } from 'lucide-react'; // 아이콘 추가
import { Link, useNavigate } from 'react-router-dom'; // useNavigate 추가

const SideDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate(); // 페이지 이동을 위해 훅 사용

  // 1. 로그인 상태 확인
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;
  const nickname = localStorage.getItem("nickname") || "여행자";

  // 2. 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
    
    alert("로그아웃 되었습니다.");
    window.location.href = "/"; 
  };

  // 3. 🌟 [핵심] 로그인이 필요한 메뉴 클릭 시 처리 함수
  const handleProtectedMove = (path) => {
    if (!isLoggedIn) {
      // 비로그인 상태면 알림 띄우고 로그인 페이지로 이동
      alert("로그인이 필요한 서비스입니다.");
      onClose(); // 드로어 닫기
      navigate("/login-selection");
    } else {
      // 로그인 상태면 해당 페이지로 이동
      onClose(); // 드로어 닫기
      navigate(path);
    }
  };

  const { userId } = useUrlUser(); // 추가

  const handleLinkClick = () => {
    onClose(); 
  };
  
  const drawerClasses = `fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
  
  const handleOverlayClick = () => {
    onClose();
  };

  const NavItem = ({ to, children, icon: Icon = null, onClick = null, isAuth = false }) => {
    const itemClass = isAuth 
      ? "flex items-center text-white bg-blue-600 hover:bg-blue-700 font-semibold p-3 rounded-lg w-full text-base justify-center"
      : "flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-md text-base w-full text-left";
      
    // onClick이 있으면(로그아웃, 보호된 메뉴 등) 버튼으로 렌더링
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={itemClass}
        >
          {Icon && <Icon size={20} className="mr-3" />}
          {children}
        </button>
      );
    }

    // 일반 링크
    return (
      <Link 
        to={to} 
        onClick={handleLinkClick} 
        className={itemClass}
      >
        {Icon && <Icon size={20} className="mr-3" />}
        {children}
      </Link>
    );
  };
  
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40" 
          onClick={handleOverlayClick}
        ></div>
      )}

      <div className={drawerClasses}>
        <div className="p-4 flex flex-col h-full">
          
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X size={28} />
            </button>
          </div>
          
          {/* 환영 문구 */}
          {isLoggedIn && (
            <div className="mb-6 px-2">
              <p className="text-lg font-bold text-gray-800">환영합니다!</p>
              <p className="text-blue-600 font-semibold text-xl">{nickname}님</p>
            </div>
          )}
          
          {/* 상단 인증 메뉴 (로그인/로그아웃/마이페이지) */}
          <div className="pb-4 border-b space-y-2">
            {isLoggedIn ? (
              <>
                <NavItem to="/user/mypage" icon={User} isAuth={true}>
                  마이페이지
                </NavItem>
                <NavItem onClick={handleLogout} icon={LogOut} isAuth={true}>
                  로그아웃
                </NavItem>
              </>
            ) : (
              // 비로그인 상태: 로그인/회원가입
              <NavItem to="/login-selection" icon={User} isAuth={true}>
                로그인/회원가입
              </NavItem>
            )}
          </div>
          
          <div className="mt-4 space-y-1">
            <NavItem 
              onClick={() => handleProtectedMove("/itinerary")} 
              icon={Calendar}
            >
              내 일정
            </NavItem>

            <NavItem 
              onClick={() => handleProtectedMove("/bookings")}  // 수정해야된다
              icon={BookOpen}
            >
              예약 내역
            </NavItem>

            <NavItem 
              onClick={() => handleProtectedMove("/favorites")}  // 수정해야한다
              icon={Heart}
            >
              찜 목록
            </NavItem>

            <NavItem 
              to="/community" // 커뮤니티는 보통 구경은 가능하므로 Link 유지 (필요 시 Protected로 변경 가능)
              icon={MessageSquare}
            >
              커뮤니티
            </NavItem>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default SideDrawer;