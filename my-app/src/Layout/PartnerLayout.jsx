import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Calendar, List, LogOut, User, 
    Building, ChevronDown, PlusCircle, Settings, MapPin 
} from 'lucide-react';
import { PartnerProvider, usePartner } from '../context/PartnerContext';

const PartnerLayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
      properties, 
      currentProperty, 
      switchProperty, 
      partnerInfo, 
      isLoading 
  } = usePartner();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getLinkClass = (path) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`;
  };

  const handleLogout = () => {
    localStorage.removeItem('partnerId'); 
    navigate('/');
  };

  if (isLoading) return <div className="flex h-screen justify-center items-center text-gray-500">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* ================= [사이드바] ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
            <Link to="/partner/dashboard" className="block">
                <h1 className="text-2xl font-bold text-blue-600">Partner Center</h1>
                <p className="text-xs text-gray-400 mt-1">호텔 관리 시스템</p>
            </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* 1. 대시보드 */}
          <Link to="/partner/dashboard" className={getLinkClass('/partner/dashboard')}>
            <LayoutDashboard size={20} />
            <span>대시보드</span>
          </Link>
          
          {/* [추가됨] 2. 숙박 시설 관리 (전체 목록) */}
          <Link to="/partner/properties" className={getLinkClass('/partner/properties')}>
            <Building size={20} />
            <span>숙박 시설 관리</span>
          </Link>
          
          {/* 3. 요금/재고 관리 */}
          <Link to="/partner/rooms" className={getLinkClass('/partner/rooms')}>
            <Calendar size={20} />
            <span>객실 관리</span>
          </Link>

          {/* 4. 예약 목록 */}
          <Link to="/partner/reservations" className={getLinkClass('/partner/reservations')}>
            <List size={20} />
            <span>예약 목록</span>
          </Link>

          {/* 현재 숙소 수정 바로가기 */}
          <div className="pt-6 mt-2">
             <p className="px-4 text-xs font-bold text-gray-400 mb-2 uppercase">Current Property</p>
             {currentProperty ? (
                 <Link 
                    to={`/partner/properties/${currentProperty.propertyId}`} 
                    className={getLinkClass(`/partner/properties/${currentProperty.propertyId}`)}
                 >
                    <Settings size={20} />
                    <span>현재 숙소 정보 수정</span>
                 </Link>
             ) : (
                 <div className="px-4 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg mx-2 text-center">
                    선택된 숙소가 없습니다
                 </div>
             )}
          </div>
        </nav>

        {/* 하단 파트너 정보 */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <User size={20} className="text-blue-600"/>
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate">{partnerInfo.bizName || "파트너"}</p> 
                    <p className="text-xs text-gray-500 truncate">{partnerInfo.ceoName} 대표님</p>
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

      {/* ================= [메인 콘텐츠] ================= */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* 헤더 (Switcher 포함) */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm shrink-0">
            <div className="relative">
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="group flex items-center gap-3 text-lg font-bold text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-gray-200"
                >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Building size={20} />
                    </div>
                    <span>{currentProperty ? currentProperty.name : "숙소를 선택해주세요"}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                            내 숙소 목록 ({properties.length})
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {properties.length > 0 ? (
                                properties.map((prop) => (
                                    <button
                                        key={prop.propertyId}
                                        onClick={() => {
                                            switchProperty(prop);
                                            setIsDropdownOpen(false);
                                            navigate('/partner/dashboard');
                                        }}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-l-4 ${
                                            currentProperty?.propertyId === prop.propertyId 
                                            ? 'border-blue-600 bg-blue-50/50' 
                                            : 'border-transparent'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${currentProperty?.propertyId === prop.propertyId ? 'text-blue-700' : 'text-gray-700'}`}>
                                                {prop.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{prop.address || "주소 미입력"}</p>
                                        </div>
                                        {currentProperty?.propertyId === prop.propertyId && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-sm">등록된 숙소가 없습니다.</div>
                            )}
                        </div>
                        <div className="p-2 border-t border-gray-100 mt-1">
                            <Link 
                                to={`/partner/properties/new?partnerId=${partnerInfo.partnerId}`} 
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                <PlusCircle size={18} />
                                새 숙박 시설 등록하기
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                {currentProperty && (
                    <Link 
                        to={`/partner/properties/${currentProperty.propertyId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                    >
                        <MapPin size={16} />
                        내 숙소 정보
                    </Link>
                )}
            </div>
        </header>

        {/* 콘텐츠 영역 (Router Outlet) */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
            
            {/* [요청하신 기능] 숙소가 하나도 없을 때 안내 메시지 */}
            {!isLoading && properties.length === 0 && location.pathname === '/partner/dashboard' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center mb-6 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-blue-800 mb-2">환영합니다, {partnerInfo.ceoName || '파트너'} 님!</h2>
                    <p className="text-blue-600 mb-6">아직 등록된 숙소가 없습니다. 첫 번째 숙소를 등록하고 예약을 받아보세요.</p>
                    <Link 
                        to={`/partner/properties/new?partnerId=${partnerInfo.partnerId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                    >
                        <PlusCircle size={20} />
                        지금 숙소 등록하기
                    </Link>
                </div>
            )}

            <Outlet /> 
        </div>
      </main>
    </div>
  );
};

const PartnerLayout = () => {
    return (
        <PartnerProvider>
            <PartnerLayoutContent />
        </PartnerProvider>
    );
};

export default PartnerLayout;