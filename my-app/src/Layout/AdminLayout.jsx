import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building, LogOut, Shield } from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 로그아웃 로직
  const handleLogout = () => {
    // TODO: 관리자 로그아웃 처리 (토큰 삭제 등)
    navigate('/');
  };

  // PartnerLayout과 동일한 링크 스타일 함수
  const getLinkClass = (path) => {
    // 현재 경로가 해당 path와 일치하거나 하위 경로일 때 활성화
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* ================= [사이드바] ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        
        {/* 사이드바 헤더 */}
        <div className="p-6 border-b border-gray-100">
            <Link to="/admin/accounts" className="block">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="text-blue-600" size={24} />
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">MASTER</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">관리자 시스템</h1>
            </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* 1. 대시보드 */}
          
          <Link to="/admin/accounts" className={getLinkClass('/admin/accounts')}>
            <Users size={20} />
            <span>회원(계정) 관리</span>
          </Link>

          <Link to="/admin/accommodations" className={getLinkClass('/admin/accommodations')}>
            <Building size={20} />
            <span>전체 숙소 관리</span>
          </Link>
        </nav>
      
        <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm font-bold">
                    A
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate">최고 관리자</p> 
                    <p className="text-xs text-gray-500 truncate">admin@trip.com</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm"
            >
                <LogOut size={16} />
                로그아웃
            </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden bg-gray-50">
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-20 shadow-sm shrink-0">
            <div className="text-sm text-gray-500">
                Admin Control Panel
            </div>
        </header>

       <div id="main-scroll-container" className="flex-1 overflow-y-auto p-4"> 
          <Outlet /> {/* 여기에 AdminAccountList가 들어감 */}
          <ScrollToTop />
       </div>
      </main>
    </div>
  );
};

export default AdminLayout;