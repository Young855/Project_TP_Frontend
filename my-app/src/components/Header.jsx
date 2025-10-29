import React, { useState } from 'react';
import { 
  User, LogOut, LogIn, UserPlus, X, Menu 
} from 'lucide-react';
import { Link } from 'react-router-dom'; // 1. Link 컴포넌트 추가

/**
 * 헤더 컴포넌트 (react-router-dom 버전)
 * @param {object} props
 * @param {boolean} props.isLoggedIn - 로그인 여부
 * @param {function} props.onLogout - 로그아웃 처리 함수
 * @param {function} props.navigate - useNavigate() 훅으로 전달된 페이지 이동 함수 (setPage 대체)
 */
// 2. setPage Prop을 제거하고 navigate Prop을 받도록 변경
const Header = ({ isLoggedIn, onLogout, navigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 모바일 메뉴 닫기 및 페이지 이동 처리
  const handleMobileNavClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // 데스크탑/모바일 메뉴에서 반복되는 Link 코드를 컴포넌트로 분리
  const NavLinks = ({ isMobile = false }) => {
    
    const linkClass = isMobile ? "nav-link-mobile" : "nav-link";
    const buttonClass = isMobile ? "btn-primary w-full mt-2" : "btn-primary-outline";

    // 모바일 메뉴에서는 Link 대신 버튼과 navigate를 사용하여 메뉴 닫기 로직을 함께 처리
    const NavItem = ({ path, children, onClick = null, className = linkClass }) => {
      if (isMobile) {
        // 모바일: 버튼 클릭 시 메뉴를 닫고 navigate 실행
        return (
          <button 
            onClick={() => { 
              if (onClick) onClick(); 
              handleMobileNavClick(path); 
            }} 
            className={className}
          >
            {children}
          </button>
        );
      }
      // 데스크탑: <Link> 사용
      return <Link to={path} className={className}>{children}</Link>;
    };

    return (
      <>
        <NavItem path="/search-results">숙소 검색</NavItem>
        
        <NavItem path="/itinerary">내 일정</NavItem>
        
        <NavItem path="/community">커뮤니티</NavItem>

        <NavItem path="/property/properties">숙소 등록</NavItem>
        
        {isLoggedIn ? (
          <>
            <NavItem path="/user/mypage">
              <User size={20} className="inline-block mr-1" />
              마이페이지
            </NavItem>
            {/* 로그아웃은 onLogout 함수(App.jsx에서 Modal 띄우는 로직 포함)를 사용 */}
            <NavItem path="/" onClick={onLogout} className={linkClass}>
              <LogOut size={20} className="inline-block mr-1" />
              로그아웃
            </NavItem>
          </>
        ) : (
          <>
            <NavItem path="/login">
              <LogIn size={20} className="inline-block mr-1" />
              로그인
            </NavItem>
            <NavItem path="user/signup" className={buttonClass}>
              <UserPlus size={20} className="inline-block mr-1" />
              회원가입
            </NavItem>
          </>
        )}
      </>
    );
  };


  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="text-2xl font-bold text-blue-600 cursor-pointer"
          >
            TP
          </Link>
          </div>
          {/* 데스크탑 네비게이션 */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {/* 모바일에서는 isMobile=true로 전달하여 Link 대신 버튼 사용 */}
              <NavLinks isMobile={true} />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
