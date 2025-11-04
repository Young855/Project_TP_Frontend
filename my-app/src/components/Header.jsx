// Header.jsx

import React from 'react';
import { 
  Menu 
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * 헤더 컴포넌트 (Side Drawer 트리거 역할)
 * @param {object} props
 * @param {boolean} props.isLoggedIn - 로그인 여부
 * @param {function} props.navigate - useNavigate() 훅으로 전달된 페이지 이동 함수
 * @param {function} props.onOpenDrawer - 드로어를 여는 함수 (새로 추가)
 */
// onOpenDrawer Prop을 새로 받도록 변경
const Header = ({ isLoggedIn, navigate, onOpenDrawer }) => {
  // onLogout은 SideDrawer에서 처리하므로 여기서 제거
  
  // 로그인/회원가입 버튼 클릭 처리
  const handleAuthClick = () => {
    // 로그인/회원가입 경로는 'loginSelection'으로 가정합니다.
    navigate('/loginSelection');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 로고와 오른쪽 그룹을 양 끝으로 분리 */}
        <div className="flex justify-between items-center h-16"> 
          <Link 
            to="/" 
            className="text-2xl font-bold text-blue-600 cursor-pointer"
          >
            TP
          </Link>
        </div>
          {/* 햄버거 메뉴 버튼과 로그인/회원가입 버튼 그룹 (오른쪽 정렬) */}
          <div className="flex items-center space-x-3"> 
            
            {/* 로그인/회원가입 버튼 (isLoggedIn이 false일 때만 표시) */}
            {!isLoggedIn && (
              <button 
                onClick={handleAuthClick}
                className="btn-primary-outline px-4 py-2 rounded-lg text-sm font-semibold"
              >
                로그인/회원가입
              </button>
            )}

            {/* 햄버거 메뉴 버튼: 클릭 시 SideDrawer 열기 */}
            <button onClick={onOpenDrawer} className="p-1">
              <Menu size={28} />
            </button>
          </div>
        

        {/* 기존 모바일 메뉴 로직 (isMenuOpen)은 SideDrawer.jsx로 이동하며 여기서는 제거됩니다. */}
      </nav>
    </header>
  );
};

export default Header;