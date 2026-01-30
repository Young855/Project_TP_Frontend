import { Menu, User, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import GuestCounter from "../components/GuestCounter";

const STORAGE_KEY = "tp_search_criteria";

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const Header = ({ navigate, onOpenDrawer, onSubmitSearch }) => {
  const location = useLocation();

  // 1) 로그인 여부
  const token = localStorage.getItem("accessToken");
  const isLoggedIn = !!token;

  // 2) 닉네임
  const nickname = localStorage.getItem("nickname") || "여행자";

  // 로그아웃
  const handleLogout = () => {
    localStorage.clear();
    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  const isSearchLikePage =
    location.pathname.startsWith("/search") ||
    location.pathname.startsWith("/accommodation");

  // ✅ 찜 목록 페이지 여부
  const isFavoritePage = location.pathname.startsWith("/favorites");

  // ✅ pill을 보여줄 페이지(검색/숙소상세/찜)
  const isPillPage = isSearchLikePage || isFavoritePage;

  const navCriteria = location.state?.criteria || null;

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

  // ✅ URL에서 criteria 읽기
  // - search/accommodation: keyword 사용
  // - favorites: checkIn/checkOut/guests만 사용 (keyword 없어도 됨)
  const urlCriteria = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("keyword");

    const checkIn = params.get("checkIn") || "";
    const checkOut = params.get("checkOut") || "";
    const guests = Number(params.get("guests")) || 2;

    // search/accommodation 쪽은 keyword가 없고 날짜도 없으면 null
    if (!isFavoritePage && !keyword && !checkIn) return null;

    // favorites는 keyword 없어도 날짜/인원만 있으면 OK
    // (아무것도 없으면 아래에서 default로 채움)
    return {
      destination: keyword || "",
      checkIn,
      checkOut,
      guests,
    };
  }, [location.search, isFavoritePage]);

  // ✅ 최종 기준
  // favorites에서는 destination은 무조건 ""로 취급하고,
  // 날짜/인원은 URL > nav > storage > default(오늘/내일/2명)
  const criteria = useMemo(() => {
    if (isFavoritePage) {
      const base = urlCriteria || navCriteria || storageCriteria || null;
      return {
        destination: "",
        checkIn: base?.checkIn || getToday(),
        checkOut: base?.checkOut || getTomorrow(),
        guests: Number(base?.guests) || 2,
      };
    }
    return urlCriteria || navCriteria || storageCriteria;
  }, [isFavoritePage, urlCriteria, navCriteria, storageCriteria]);

  // criteria 로컬스토리지 반영
  useEffect(() => {
    if (!criteria) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
    } catch {}
  }, [criteria]);

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

  // ✅ pill 페이지가 아니면 패널 닫기
  useEffect(() => {
    if (!isPillPage) {
      setIsPanelOpen(false);
      setIsGuestPickerOpen(false);
    }
  }, [isPillPage]);

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

  // criteria -> form 반영
  useEffect(() => {
    if (!criteria) return;
    setSearchForm({
      destination: criteria.destination || "",
      checkIn: criteria.checkIn || getToday(),
      checkOut: criteria.checkOut || getTomorrow(),
      guests: criteria.guests || 2,
    });
    setAdults(criteria.guests || 2);
    setChildren(0);
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
        destination: criteria.destination || "",
        checkIn: criteria.checkIn || getToday(),
        checkOut: criteria.checkOut || getTomorrow(),
        guests: criteria.guests || 2,
      });
      setAdults(criteria.guests || 2);
      setChildren(0);
    }
    setIsPanelOpen((prev) => !prev);
    setIsGuestPickerOpen(false);
  };

  // ✅ 검색 페이지용 (기존 그대로)
  const handleSearchClick = () => {
    if (!searchForm.destination.trim()) {
      alert("여행지나 숙소 이름을 입력해주세요.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchForm));
    } catch {}

    const params = new URLSearchParams();
    params.set("keyword", searchForm.destination);
    params.set("checkIn", searchForm.checkIn);
    params.set("checkOut", searchForm.checkOut);
    params.set("guests", searchForm.guests);

    setIsPanelOpen(false);
    setIsGuestPickerOpen(false);

    window.location.href = `/search?${params.toString()}`;
  };

  // ✅ 찜 페이지용: 날짜/인원만 반영해서 favorites로 이동(새로고침)
  const handleFavoriteApply = () => {
    if (!searchForm.checkIn || !searchForm.checkOut) {
      alert("체크인/체크아웃 날짜를 선택해주세요.");
      return;
    }
    if (searchForm.checkOut <= searchForm.checkIn) {
      alert("체크아웃 날짜는 체크인 이후여야 합니다.");
      return;
    }

    const nextCriteria = {
      destination: "",
      checkIn: searchForm.checkIn,
      checkOut: searchForm.checkOut,
      guests: Number(searchForm.guests) || 2,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCriteria));
    } catch {}

    const params = new URLSearchParams();
    params.set("checkIn", nextCriteria.checkIn);
    params.set("checkOut", nextCriteria.checkOut);
    params.set("guests", String(nextCriteria.guests));

    setIsPanelOpen(false);
    setIsGuestPickerOpen(false);

    // ✅ 강제 이동 + 새로고침
    window.location.href = `/favorites?${params.toString()}`;
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
            {isPillPage && criteria && (
              <button
                ref={buttonRef}
                type="button"
                onClick={handleTogglePanel}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50
                           text-[14px] md:text-[16px] text-gray-700 whitespace-nowrap overflow-hidden"
              >
                {/* ✅ favorites에서는 여행지 미표시 */}
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
            {!isLoggedIn ? (
              <button
                onClick={() => (window.location.href = "/login-selection")}
                className="btn-primary-outline px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
              >
                로그인/회원가입
              </button>
            ) : (
              <div className="flex items-center gap-4 mr-2">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                  <User size={18} />
                  {nickname}님
                </span>
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

      {/* --- 검색/찜 패널 --- */}
      {isPillPage && isPanelOpen && (
        <div
          ref={panelRef}
          className="border-t border-gray-200 bg-white shadow-sm absolute w-full z-50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              {/* ✅ search/accommodation만 여행지 입력 */}
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

              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크인</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    value={searchForm.checkIn}
                    onChange={handleChange("checkIn")}
                    min={getToday()}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">체크아웃</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                    value={searchForm.checkOut}
                    onChange={handleChange("checkOut")}
                    min={searchForm.checkIn ? getNextDay(searchForm.checkIn) : getToday()}
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

              {/* 버튼 */}
              <div className="w-full md:w-auto">
                <button
                  type="button"
                  onClick={isFavoritePage ? handleFavoriteApply : handleSearchClick}
                  className="w-full md:w-auto px-5 py-2.5 rounded-md text-sm border
                             bg-blue-50 text-blue-600 border-blue-600 font-medium
                             hover:bg-blue-100 transition-colors"
                >
                  {isFavoritePage ? "적용" : "검색"}
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
