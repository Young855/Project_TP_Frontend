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
        {/* [수정됨] justify-between 제거, ml-auto 적용을 위해 */}
        <div className="flex items-center h-16">
          {/* [수정됨] "TP"를 "TP-TEST-HELLO"로 변경 (테스트 목적) */}
          <div 
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => setPage('main')}
          >
            TP
          </div>
          
          <div className="hidden md:flex items-center space-x-4 ml-auto">
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

          
        </div>

      </nav> 
    </header>
  );
};

export default Header;
