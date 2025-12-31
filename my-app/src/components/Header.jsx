import { Menu, LogOut, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const STORAGE_KEY = "tp_search_criteria";

// 🌟 [수정] onLogout prop을 제거하고 내부에서 처리하도록 변경했습니다.
const Header = ({ navigate, onOpenDrawer, onSubmitSearch }) => {
  const location = useLocation();

  // 1. 로그인 여부 판단 (로컬 스토리지 기준)
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token; 
  
  // 2. 닉네임 가져오기
  const nickname = localStorage.getItem("nickname") || "여행자";

  // 🌟 [추가] 로그아웃 핸들러 함수
  const handleLogout = () => {
    // 1. 로컬 스토리지의 모든 인증 정보 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
    
    // (선택사항) 검색 조건 등도 초기화하고 싶다면 추가
    // localStorage.removeItem(STORAGE_KEY);

    alert("로그아웃 되었습니다.");

    // 2. 메인 페이지로 이동하며 새로고침 (중요!)
    // 새로고침을 해야 Header가 다시 렌더링되면서 isLoggedIn이 false로 바뀝니다.
    window.location.href = "/";
  };

  const navCriteria = location.state?.criteria || null;

  const isSearchLikePage =
    location.pathname.startsWith("/search") ||
    location.pathname.startsWith("/accommodation");

  const storageCriteria = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;

      const destination = String(parsed.destination ?? "");
      const checkIn = String(parsed.checkIn ?? "");
      const checkOut = String(parsed.checkOut ?? "");
      const guests = Number(parsed.guests ?? 2);

      if (!destination || !checkIn || !checkOut) return null;

      return { destination, checkIn, checkOut, guests: Number.isFinite(guests) ? guests : 2 };
    } catch {
      return null;
    }
  }, [location.key]);

  const criteria = navCriteria || storageCriteria;

  useEffect(() => {
    if (!criteria) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
    } catch {
    }
  }, [criteria]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [searchForm, setSearchForm] = useState({
    destination: criteria?.destination || "",
    checkIn: criteria?.checkIn || "",
    checkOut: criteria?.checkOut || "",
    guests: criteria?.guests || 2,
  });

  useEffect(() => {
    if (!isSearchLikePage) {
      setIsPanelOpen(false);
    }
  }, [isSearchLikePage]);

  useEffect(() => {
    setSearchForm({
      destination: criteria?.destination || "",
      checkIn: criteria?.checkIn || "",
      checkOut: criteria?.checkOut || "",
      guests: criteria?.guests || 2,
    });
  }, [criteria]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setSearchForm((prev) => {
      if (field === "checkIn") {
        const updated = {
          ...prev,
          checkIn: value,
        };
        if (prev.checkOut && prev.checkOut < value) {
          updated.checkOut = value;
        }
        return updated;
      }
      return {
        ...prev,
        [field]: field === "guests" ? Number(value) : value,
      };
    });
  };

  const handleTogglePanel = () => {
    if (!criteria) return;
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

  const handleSearchClick = () => {
    if (!onSubmitSearch) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchForm));
    } catch {
    }
    onSubmitSearch(searchForm);
    setIsPanelOpen(false);
  };

  const handleAuthClick = () => {
    navigate("/login-selection");
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

          {/* 가운데 검색바 */}
          <div
           className="flex justify-center items-center w-1/3"
           style={{ transform: "translate(-40px, 12px)" }}
          >
            {isSearchLikePage && criteria && (
              <button
                type="button"
                onClick={handleTogglePanel}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-[20px] text-gray-700"
              >
                <span>{criteria.destination}</span>
                <span className="w-px h-3 bg-gray-300" />
                <span>
                  {criteria.checkIn} ~ {criteria.checkOut}
                </span>
                <span className="w-px h-3 bg-gray-300" />
                <span>{criteria.guests}명</span>
              </button>
            )}
          </div>

          {/* 오른쪽 메뉴 */}
          <div className="flex items-center gap-2 w-1/3 justify-end">
            {!isLoggedIn ? (
              // 비로그인 상태
              <button
                onClick={handleAuthClick}
                className="btn-primary-outline px-4 py-2 rounded-lg text-sm font-semibold"
              >
                로그인/회원가입
              </button>
            ) : (
              // 로그인 상태
              <div className="flex items-center gap-4 mr-2">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <User size={18} />
                  {nickname}님
                </span>
                {/* 🌟 [수정] 위에서 만든 handleLogout 함수 연결 */}
                <button 
                  onClick={handleLogout} 
                  className="text-sm text-gray-500 hover:text-red-600 underline"
                >
                  로그아웃
                </button>
              </div>
            )}

            <button onClick={onOpenDrawer} className="p-1 text-gray-600 hover:text-gray-900">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* 검색 패널 (기존 코드 유지) */}
      {isSearchLikePage && isPanelOpen && (
        <div className="border-t border-gray-200 bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">여행지</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={searchForm.destination}
                  onChange={handleChange("destination")}
                  placeholder="여행지나 숙소를 검색해보세요."
                />
              </div>

              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크인</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={searchForm.checkIn}
                    onChange={handleChange("checkIn")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크아웃</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={searchForm.checkOut}
                    onChange={handleChange("checkOut")}
                    min={searchForm.checkIn || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="w-full md:w-40">
                <label className="block text-xs text-gray-500 mb-1">인원</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={searchForm.guests}
                  onChange={handleChange("guests")}
                />
              </div>

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