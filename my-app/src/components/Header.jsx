import { Menu, User, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
// 🌟 useNavigate는 더 이상 쓰지 않고 window.location을 씁니다.
import { Link, useLocation } from "react-router-dom";
import GuestCounter from "../components/GuestCounter";

const STORAGE_KEY = "tp_search_criteria";

const Header = ({ isLoggedIn, navigate, onOpenDrawer, onSubmitSearch }) => {
  const location = useLocation();
  // const navigate = useNavigate(); // ❌ 삭제: 강제 새로고침을 위해 사용 안 함

  // ✅ 찜 페이지 여부
  const isFavoritePage = location.pathname.startsWith("/favorites");

  // 1. URL 쿼리 파라미터 파싱
  const urlCriteria = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("keyword");
    const checkIn = params.get("checkIn");
    const checkOut = params.get("checkOut");
    const guests = params.get("guests");

    if (keyword || checkIn || checkOut) {
      return {
        destination: keyword || "",
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        guests: guests ? parseInt(guests, 10) : 2,
      };
    }
    return null;
  }, [location.search]);

  // 2. 라우팅 state
  const navCriteria = location.state?.criteria || null;
  // ✅ URL 쿼리에서 criteria 복구 (/search-results?keyword=...&checkIn=...)
  // state가 없어도 pill이 뜨게 함
  const urlCriteria = useMemo(() => {
    const params = new URLSearchParams(location.search);

    const destination = params.get("keyword") || "";
    const checkIn = params.get("checkIn") || "";
    const checkOut = params.get("checkOut") || "";
    const guests = Number(params.get("guests") || 2);

    if (!destination || !checkIn || !checkOut) return null;

    return {
      destination,
      checkIn,
      checkOut,
      guests: Number.isFinite(guests) ? guests : 2,
    };
  }, [location.search]);

  // 3. 페이지 판별
  const isSearchLikePage =
    location.pathname.startsWith("/search") ||
    location.pathname.startsWith("/accommodation") ||
    location.pathname.startsWith("/favorites"); // ✅ 추가

  // 4. 로컬스토리지
  const storageCriteria = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        destination: parsed.destination || "",
        checkIn: parsed.checkIn || "",
        checkOut: parsed.checkOut || "",
        guests: Number(parsed.guests) || 2,
      };
    } catch {
      return null;
    }
  }, [location.key]);

  // 최종 기준
  const criteria = urlCriteria || navCriteria || storageCriteria;

  useEffect(() => {
    if (!criteria) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
    } catch {}
  }, [criteria]);

  // --- 상태 관리 ---
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);

  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const totalGuests = adults + children;

  const [searchForm, setSearchForm] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });

  const getNextDay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!isSearchLikePage) {
      setIsPanelOpen(false);
      setIsGuestPickerOpen(false);
    }
  }, [isSearchLikePage]);

  // 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isPanelOpen) return;
      const isInsidePanel = panelRef.current && panelRef.current.contains(event.target);
      const isInsideButton = buttonRef.current && buttonRef.current.contains(event.target);

      if (!isInsidePanel && !isInsideButton) {
        setIsPanelOpen(false);
        setIsGuestPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPanelOpen]);

  useEffect(() => {
    if (criteria) {
      setSearchForm({
        destination: criteria.destination || "",
        checkIn: criteria.checkIn || "",
        checkOut: criteria.checkOut || "",
        guests: criteria.guests || 2,
      });
      setAdults(criteria.guests || 2);
      setChildren(0);
    }
  }, [criteria]);

  useEffect(() => {
    setSearchForm((prev) => ({ ...prev, guests: totalGuests }));
  }, [adults, children]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setSearchForm((prev) => {
      if (field === "checkIn") {
        const updated = { ...prev, checkIn: value };
        if (prev.checkOut && prev.checkOut <= value) {
          updated.checkOut = getNextDay(value);
        }
        return updated;
      }
      return { ...prev, [field]: value };
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
      setAdults(criteria.guests || 2);
      setChildren(0);
    }
    setIsPanelOpen((prev) => !prev);
    setIsGuestPickerOpen(false);
  };

  // ✅ [핵심 수정] 찜 페이지에서는 지역(keyword) 없이 날짜/인원만 변경 → /favorites로 이동
  const handleSearchClick = () => {
    // 1. 유효성 검사
    if (!isFavoritePage) {
      if (!searchForm.destination.trim()) {
        alert("여행지나 숙소 이름을 입력해주세요.");
        return;
      }
    }

    // 2. 로컬스토리지 저장
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchForm));
    } catch {}

    // 3. URL 파라미터 생성
    const params = new URLSearchParams();

    if (!isFavoritePage) {
      params.set("keyword", searchForm.destination);
    }

    params.set("checkIn", searchForm.checkIn);
    params.set("checkOut", searchForm.checkOut);
    params.set("guests", searchForm.guests);

    // 4. 패널 닫기
    setIsPanelOpen(false);
    setIsGuestPickerOpen(false);

    // 5. 페이지 강제 이동 및 새로고침 (Refresh)
    if (isFavoritePage) {
      window.location.href = `/favorites?${params.toString()}`;
      return;
    }

    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 w-full">
          {/* 1. 로고 */}
          <div className="flex items-center w-1/3">
            <Link to="/" className="text-2xl font-bold text-blue-600 cursor-pointer">
              TP
            </Link>
          </div>

          {/* 2. 가운데 Pill */}
          <div
            className="flex justify-center items-center w-1/3"
            style={{ transform: "translate(-40px, 12px)" }}
          >
            {isSearchLikePage && criteria && (
              <button
                ref={buttonRef}
                type="button"
                onClick={handleTogglePanel}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-[14px] md:text-[16px] text-gray-700 whitespace-nowrap overflow-hidden"
              >
                {/* ✅ 찜 페이지에서는 지역 숨김 */}
                {!isFavoritePage && (
                  <>
                    <span className="truncate max-w-[100px]">{criteria.destination}</span>
                    <span className="w-px h-3 bg-gray-300" />
                  </>
                )}

                <span>
                  {criteria.checkIn} ~ {criteria.checkOut}
                </span>
                <span className="w-px h-3 bg-gray-300" />
                <span>{criteria.guests}명</span>
              </button>
            )}
          </div>

          {/* 3. 오른쪽 메뉴 */}
          <div className="flex items-center gap-2 w-1/3 justify-end">
            {!isLoggedIn && (
              <button
                onClick={() => (window.location.href = "/login-selection")}
                className="btn-primary-outline px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
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

      {/* --- 검색 패널 --- */}
      {isSearchLikePage && isPanelOpen && (
        <div ref={panelRef} className="border-t border-gray-200 bg-white shadow-sm absolute w-full z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              {/* ✅ 여행지 (찜 페이지에서는 숨김) */}
              {!isFavoritePage && (
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">여행지</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    value={searchForm.destination}
                    onChange={handleChange("destination")}
                    placeholder="여행지 입력"
                  />
                </div>
              )}

              {/* 체크인/체크아웃 */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크인</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    value={searchForm.checkIn}
                    onChange={handleChange("checkIn")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크아웃</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    value={searchForm.checkOut}
                    onChange={handleChange("checkOut")}
                    min={
                      searchForm.checkIn
                        ? getNextDay(searchForm.checkIn)
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>

              {/* 인원 선택 */}
              <div className="w-full md:w-40 relative">
                <label className="block text-xs text-gray-500 mb-1">인원</label>
                <button
                  type="button"
                  onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
                  className="w-full flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900"
                >
                  <div className="flex items-center gap-1">
                    <User size={14} className="text-gray-500" />
                    <span>총 {totalGuests}명</span>
                  </div>
                  {isGuestPickerOpen ? (
                    <ChevronUp size={14} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-500" />
                  )}
                </button>

                {isGuestPickerOpen && (
                  <div className="absolute top-full right-0 md:left-0 mt-1 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 space-y-4">
                    <GuestCounter
                      count={adults}
                      setCount={(val) => {
                        if (val < 1) return;
                        setAdults(val);
                      }}
                      label="성인"
                    />
                    <GuestCounter
                      count={children}
                      setCount={(val) => {
                        if (val < 0) return;
                        setChildren(val);
                      }}
                      label="아동"
                    />
                  </div>
                )}
              </div>

              {/* 검색 버튼 */}
              <div className="w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="w-full md:w-auto px-5 py-2.5 rounded-md text-sm border bg-blue-50 text-blue-600 border-blue-600 font-medium hover:bg-blue-100 transition-colors"
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
