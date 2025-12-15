import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Calendar, List, LogOut, User, 
    Building, ChevronDown, PlusCircle, Settings, MapPin, Lock 
} from 'lucide-react';
import { PartnerProvider, usePartner } from '../context/PartnerContext';

const PartnerLayoutContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
      accommodations, 
      currentAccommodation, 
      switchAccommodation, 
      partnerInfo, 
      isLoading, 
  } = usePartner();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const isConfirmed = currentAccommodation?.auth === 'CONFIRM';

  const getLinkClass = (path, disabled = false) => {
    const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
    
    if (disabled) {
        return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 cursor-not-allowed hover:bg-transparent`;
    }

    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`;
  };

  // 🌟 [추가] 페이지 이동 방지 가드 (Guard)
  // URL에 'new'나 'edit'이 포함되어 있으면 작성 중인 것으로 간주하고 경고창을 띄웁니다.
  const handleNavigationGuard = (e) => {
      const isFormPage = /\/(new|edit)(\/|$|\?)/.test(location.pathname);
      
      if (isFormPage) {
          if (!window.confirm("작성 중인 내용이 저장되지 않았습니다. 정말 이동하시겠습니까?")) {
              e?.preventDefault(); // 이동 취소
              return false;       // 진행 막기
          }
      }
      return true; // 이동 허용
  };

  const handleLogout = (e) => {
    if (!handleNavigationGuard(e)) return;

    localStorage.removeItem('partnerId'); 
    navigate('/');
  };
  
  // 객실 관리 클릭 핸들러 (가드 + 권한 체크)
  const handleRoomManagementClick = (e) => {
      // 1. 작성 중 데이터 보호 체크
      if (!handleNavigationGuard(e)) return;

      // 2. 기존 권한 체크 로직
      if (!currentAccommodation) {
          e.preventDefault();
          alert("먼저 숙소를 선택해주세요.");
          return;
      }
      
      if (!isConfirmed) {
          e.preventDefault(); 
          const status = currentAccommodation.auth || 'PENDING';
          alert(`현재 숙소 상태는 [${status}] 입니다.\n관리자의 승인(CONFIRM)을 받은 후에 객실을 등록/관리할 수 있습니다.`);
      }
  };

  // 숙소 전환 핸들러 (드롭다운)
  const handleSwitchAccommodation = (acc) => {
      // 숙소 전환 시에도 페이지가 이동되므로 가드 적용
      if (/\/(new|edit)(\/|$|\?)/.test(location.pathname)) {
          if (!window.confirm("작성 중인 내용이 저장되지 않았습니다. 숙소를 변경하시겠습니까?")) {
              return;
          }
      }

      switchAccommodation(acc);
      setIsDropdownOpen(false);
      navigate('/partner/dashboard');
  };

  if (isLoading) return <div className="flex h-screen justify-center items-center text-gray-500">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-gray-100">
            {/* 로고 클릭 시에도 가드 적용 */}
            <Link to="/partner/dashboard" onClick={handleNavigationGuard} className="block">
                <h1 className="text-2xl font-bold text-blue-600">숙박시설 <br/>관리 시스템</h1>
            </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* 각 링크에 onClick={handleNavigationGuard} 추가 */}
          <Link to="/partner/dashboard" onClick={handleNavigationGuard} className={getLinkClass('/partner/dashboard')}>
            <LayoutDashboard size={20} />
            <span>대시보드</span>
          </Link>
          
          <Link to="/partner/accommodations" onClick={handleNavigationGuard} className={getLinkClass('/partner/accommodations')}>
            <Building size={20} />
            <span>숙박 시설 관리</span>
          </Link>
          
          <Link 
            to="/partner/rooms" 
            onClick={handleRoomManagementClick} 
            className={getLinkClass('/partner/rooms', !isConfirmed)} 
          >
            <div className="relative flex items-center gap-3 w-full">
                <Calendar size={20} />
                <span>객실 관리</span>
                {!isConfirmed && currentAccommodation && (
                    <Lock size={14} className="ml-auto text-gray-400" />
                )}
            </div>
          </Link>

          <Link to="/partner/reservations" onClick={handleNavigationGuard} className={getLinkClass('/partner/reservations')}>
            <List size={20} />
            <span>예약 목록</span>
          </Link>

          <div className="pt-6 mt-2">
             <p className="px-4 text-xs font-bold text-gray-400 mb-2 uppercase">Current Accommodation</p>
             {currentAccommodation ? (
                 <Link 
                    to={`/partner/accommodations/${currentAccommodation.accommodationId}`} 
                    onClick={handleNavigationGuard}
                    className={getLinkClass(`/partner/accommodations/${currentAccommodation.accommodationId}`)}
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

      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden bg-gray-50 isolate">
        
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm shrink-0">
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="group flex items-center gap-3 text-lg font-bold text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-gray-200"
                >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Building size={20} />
                    </div>
                    <span>{currentAccommodation ? currentAccommodation.name : "숙소를 선택해주세요"}</span>
                    {currentAccommodation && !isConfirmed && (
                         <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                             {currentAccommodation.auth || 'PENDING'}
                         </span>
                    )}
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
                            내 숙소 목록 ({accommodations.length})
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {accommodations.length > 0 ? (
                                accommodations.map((acc) => (
                                    <button
                                        key={acc.accommodationId}
                                        onClick={() => handleSwitchAccommodation(acc)} // [수정] 핸들러 교체
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-l-4 ${
                                            currentAccommodation?.accommodationId === acc.accommodationId 
                                            ? 'border-blue-600 bg-blue-50/50' 
                                            : 'border-transparent'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-semibold truncate ${currentAccommodation?.accommodationId === acc.accommodationId ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    {acc.name}
                                                </p>
                                                {acc.auth !== 'CONFIRM' && (
                                                    <span className="w-2 h-2 rounded-full bg-yellow-400" title="승인 대기중"/>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 truncate">{acc.address || "주소 미입력"}</p>
                                        </div>
                                        {currentAccommodation?.accommodationId === acc.accommodationId && (
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
                                to={`/partner/accommodations/new?partnerId=${partnerInfo.partnerId}`} 
                                onClick={() => setIsDropdownOpen(false)} // 여긴 New 페이지로 가는 거라 가드 불필요 (가더라도 새 페이지라 상관없음. 필요하면 추가)
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
                {currentAccommodation && (
                    <Link 
                        to={`/partner/accommodations/${currentAccommodation.accommodationId}`}
                        onClick={handleNavigationGuard}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                    >
                        <MapPin size={16} />
                        내 숙소 정보
                    </Link>
                )}
            </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 relative z-0">
            
            {!isLoading && accommodations.length === 0 && location.pathname === '/partner/dashboard' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center mb-6 animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-blue-800 mb-2">환영합니다, {partnerInfo.ceoName || '파트너'} 님!</h2>
                    <p className="text-blue-600 mb-6">아직 등록된 숙소가 없습니다. 첫 번째 숙소를 등록하고 예약을 받아보세요.</p>
                    <Link 
                        to={`/partner/accommodations/new?partnerId=${partnerInfo.partnerId}`}
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