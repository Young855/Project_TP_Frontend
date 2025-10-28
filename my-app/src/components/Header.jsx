import React, { useState } from 'react';
import { 
  User, LogOut, LogIn, UserPlus, X, Menu 
} from 'lucide-react';

/**
 * 헤더 컴포넌트
 * @param {object} props
 * @param {boolean} props.isLoggedIn - 로그인 여부
 * @param {function} props.onLogout - 로그아웃 처리 함수
 * @param {function} props.setPage - 페이지 이동 함수
 */
const Header = ({ isLoggedIn, onLogout, setPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* [수정]
          1. justify-end -> justify-between: 로고는 왼쪽, 메뉴는 오른쪽으로 정렬합니다.
          2. space-x-8 제거: 양쪽 끝으로 정렬되므로 간격이 필요 없습니다.
        */}
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div 
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => setPage('main')}
          >
            TP
          </div>

          {/* 데스크탑 네비게이션 */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => setPage('search')} className="nav-link">숙소 검색</button>
            <button onClick={() => setPage(isLoggedIn ? 'my-itineraries' : 'login-required')} className="nav-link">내 일정</button>
            <button onClick={() => setPage('community')} className="nav-link">커뮤니티</button>
            
            {isLoggedIn ? (
              <>
                <button onClick={() => setPage('my-page')} className="nav-link">
                  <User size={20} className="inline-block mr-1" />
                  마이페이지
                </button>
                <button onClick={onLogout} className="nav-link">
                  <LogOut size={20} className="inline-block mr-1" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setPage('login')} className="nav-link">
                  <LogIn size={20} className="inline-block mr-1" />
                  로그인
                </button>
                <button onClick={() => setPage('signup')} className="btn-primary-outline">
                  <UserPlus size={20} className="inline-block mr-1" />
                  회원가입
                </button>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <button onClick={() => { setPage('search'); setIsMenuOpen(false); }} className="nav-link-mobile">숙소 검색</button>
              <button onClick={() => { setPage(isLoggedIn ? 'my-itineraries' : 'login-required'); setIsMenuOpen(false); }} className="nav-link-mobile">내 일정</button>
              <button onClick={() => { setPage('community'); setIsMenuOpen(false); }} className="nav-link-mobile">커뮤니티</button>
              
              <hr className="my-2"/>
              
              {isLoggedIn ? (
                <>
                  <button onClick={() => { setPage('my-page'); setIsMenuOpen(false); }} className="nav-link-mobile">
                    <User size={20} className="inline-block mr-2" />
                    마이페이지
                  </button>
                  <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="nav-link-mobile">
                    <LogOut size={20} className="inline-block mr-2" />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setPage('login'); setIsMenuOpen(false); }} className="nav-link-mobile">
                    <LogIn size={20} className="inline-block mr-2" />
                    로그인
                  </button>
                  <button onClick={() => { setPage('signup'); setIsMenuOpen(false); }} className="btn-primary w-full mt-2">
                    <UserPlus size={20} className="inline-block mr-2" />
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

