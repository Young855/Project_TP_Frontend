// SideDrawer.jsx

import React from 'react';
import { 
  X, LogOut, User 
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 사이드 드로어 컴포넌트
 * @param {object} props
 * @param {boolean} props.isOpen - 드로어 열림 상태
 * @param {function} props.onClose - 드로어를 닫는 함수
 * @param {boolean} props.isLoggedIn - 로그인 여부
 * @param {function} props.onLogout - 로그아웃 처리 함수
 */
const SideDrawer = ({ isOpen, onClose, isLoggedIn, onLogout }) => {

  const handleLinkClick = () => {
    // 링크 클릭 시 드로어 닫기
    onClose(); 
  };
  
  // 드로어 열림 상태에 따라 CSS 클래스 결정
  const drawerClasses = `fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;
  
  // 오버레이 클릭 시 닫기
  const handleOverlayClick = () => {
    onClose();
  };

  const NavItem = ({ to, children, icon: Icon = null, onClick = null, isAuth = false }) => {
    
    // Auth 버튼(로그인/로그아웃/마이페이지)은 별도 스타일 적용
    const itemClass = isAuth 
      ? "flex items-center text-white bg-blue-600 hover:bg-blue-700 font-semibold p-3 rounded-lg w-full text-base"
      : "block p-3 text-gray-700 hover:bg-gray-100 rounded-md text-base";
      
    // onClick이 있으면 Link 대신 버튼 사용 (주로 로그아웃)
    if (onClick) {
      return (
        <button
          onClick={() => { onClick(); handleLinkClick(); }}
          className={itemClass}
        >
          {Icon && <Icon size={20} className="mr-3" />}
          {children}
        </button>
      );
    }

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
      {/* 오버레이 (드로어가 열렸을 때 뒷배경을 어둡게 만듭니다) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40" 
          onClick={handleOverlayClick}
        ></div>
      )}

      {/* 사이드 드로어 본체 */}
      <div className={drawerClasses}>
        <div className="p-4">
          
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-4">
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X size={28} />
            </button>
          </div>
          
          {/* 로그인 상태에 따른 상단 버튼 */}
          <div className="pb-4 border-b space-y-2">
            {isLoggedIn ? (
              // 로그인 상태: 마이페이지 및 로그아웃
              <>
                <NavItem to="/user/mypage" icon={User} isAuth={true}>마이페이지</NavItem>
                {/* 로그아웃은 onLogout 함수를 사용하므로 버튼으로 처리 */}
                <NavItem to="/" onClick={onLogout} icon={LogOut} isAuth={true}>로그아웃</NavItem>
              </>
            ) : (
              // 비로그인 상태: 로그인/회원가입
              <NavItem to="/loginSelection" icon={User} isAuth={true}>
                로그인/회원가입
              </NavItem>
            )}
            
           
            
          </div>
          
          {/* 일반 네비게이션 링크 (스크린샷 기반) */}
          <div className="mt-4 space-y-1">
            <NavItem to="/itinerary">내 일정</NavItem>
            <NavItem to="/community">커뮤니티</NavItem>
            <NavItem to="/property/properties">숙소 등록</NavItem>
            <div className="border-t my-2"></div> {/* 구분선 */}
            
            
          </div>
          
        </div>
      </div>
    </>
  );
};

export default SideDrawer;