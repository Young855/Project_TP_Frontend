import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ isLoggedIn, navigate, onOpenDrawer, onSubmitSearch }) => {
  const location = useLocation();

  /** 검색 기준(criteria) - SearchResultPage에서 navigate 상태로 넘어온 값 */
  const criteria = location.state?.criteria || null;

  /** 현재 페이지가 /search 인지 여부 */
  const isSearchPage = location.pathname.startsWith('/search');

  /** 검색 패널 열림 상태 */
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /** 검색 패널 내부 폼 상태 */
  const [searchForm, setSearchForm] = useState({
    destination: criteria?.destination || '',
    checkIn: criteria?.checkIn || '',
    checkOut: criteria?.checkOut || '',
    guests: criteria?.guests || 2,
  });

  // 페이지 이동 시 자동 닫기 
  useEffect(() => {
    if (!isSearchPage) {
      setIsPanelOpen(false);
    }
  }, [isSearchPage]);

  // criteria가 바뀌면 검색폼도 항상 맞춤
  useEffect(() => {
    setSearchForm({
      destination: criteria?.destination || '',
      checkIn: criteria?.checkIn || '',
      checkOut: criteria?.checkOut || '',
      guests: criteria?.guests || 2,
    });
  }, [criteria]);

  // onChange 핸들러 (input 공용)
  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setSearchForm((prev) => {
      // 체크인 날짜가 바뀔 때 체크카웃보다 늦으면 체크아웃도 같이 맞춰주기
      if (field === 'checkIn') {
        const updated = {
          ...prev,
          checkIn: value,
        };

        // checkOut이 설정되어있고, 기존 checkOut이 새 checkIn보다 이전이면 덮어쓰기
        if (prev.checkOut && prev.checkOut < value) {
          updated.checkOut = value;
        }
        return updated;
      }
      return {
        ...prev,
        [field]: field === 'guests' ? Number(value) : value,
      };
    });
  };

  /** 🔥 pill 클릭 시 패널 열기/닫기 */
  const handleTogglePanel = () => {
    if (!criteria) return;
    // 열 때 현재 criteria 기준으로 초기화
    if (!isPanelOpen) {
      setSearchForm({
        destination: criteria.destination,
        checkIn: criteria.checkIn,
        checkOut: criteria.checkOut,
        guests: criteria.guests,
      });
    }
    setIsPanelOpen((prev) => !prev);
  };

  // 검색 버튼 눌렀을 때
  const handleSearchClick = () => {
    if (!onSubmitSearch) return;
    onSubmitSearch(searchForm);
    setIsPanelOpen(false);
  };

  /** 로그인/회원가입 */
  const handleAuthClick = () => {
    navigate('/login-selection');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 w-full">

          {/* 왼쪽 로고 */}
          <div className="flex items-center w-1/3">
            <Link to="/" className="text-2xl font-bold text-blue-600 cursor-pointer">
              TP
            </Link>
          </div>

          {/* 가운데 pill — 검색 페이지일 때만 표시 */}
          <div className="hidden md:flex justify-center items-center w-1/3 mt-4">
            {isSearchPage && criteria && (
              <button
                type="button"
                onClick={handleTogglePanel}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-[20px] text-gray-700"
              >
                <span>{criteria.destination}</span>
                <span className="w-px h-3 bg-gray-300" />
                <span>{criteria.checkIn} ~ {criteria.checkOut}</span>
                <span className="w-px h-3 bg-gray-300" />
                <span>{criteria.guests}명</span>
              </button>
            )}
          </div>

          {/* 오른쪽 메뉴 */}
          <div className="flex items-center gap-2 w-1/3 justify-end">
            {!isLoggedIn && (
              <button
                onClick={handleAuthClick}
                className="btn-primary-outline px-4 py-2 rounded-lg text-sm font-semibold"
              >
                로그인/회원가입
              </button>
            )}

            <button onClick={onOpenDrawer} className="p-1">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* 검색 패널 — 검색페이지 + 열림일 때만 표시 */}
      {isSearchPage && isPanelOpen && (
        <div className="border-t border-gray-200 bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">

              {/* 여행지 */}
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">여행지</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={searchForm.destination}
                  onChange={handleChange('destination')}
                  placeholder="여행지나 숙소를 검색해보세요."
                />
              </div>

              {/* 체크인 */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크인</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={searchForm.checkIn}
                    onChange={handleChange('checkIn')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* 체크아웃 */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크아웃</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={searchForm.checkOut}
                    onChange={handleChange('checkOut')}
                    min={searchForm.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* 인원 */}
              <div className="w-full md:w-40">
                <label className="block text-xs text-gray-500 mb-1">인원</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={searchForm.guests}
                  onChange={handleChange('guests')}
                />
              </div>

              {/* 검색 버튼 */}
              <div className="w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="w-full md:w-auto px-5 py-4 rounded-md text-xs border bg-blue-50 text-blue-600 border-blue-600"
                >
                  검색
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
