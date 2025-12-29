import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Header 가운데 검색 pill(여행지 | 날짜 | 인원)
 * - 기존: /search + location.state.criteria 있을 때만 표시
 * - 개선: /search, /accommodation 계열에서 표시
 * - 개선: location.state가 없어도(localStorage fallback) 새로고침/직접진입에도 표시
 */
const STORAGE_KEY = "tp_search_criteria";

const Header = ({ isLoggedIn, navigate, onOpenDrawer, onSubmitSearch }) => {
  const location = useLocation();

  /**
   * 1) 라우팅 state로 넘어온 criteria
   *    - navigate('/xxx', { state: { criteria } })로 들어왔을 때만 존재
   */
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

  /** 2) 현재 페이지가 pill을 보여줄 페이지인지 */
  const isSearchLikePage =
    location.pathname.startsWith("/search") ||
    location.pathname.startsWith("/search-results") ||
    location.pathname.startsWith("/accommodation");


  /**
   * 3) 새로고침/직접 URL 진입 시 state가 날아가므로 localStorage에서 복구
   */
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

  /**
   * 4) 최종 criteria: state 우선, 없으면 storage fallback
    */
  const criteria = navCriteria || urlCriteria || storageCriteria;


  /**
   * 5) criteria가 있으면 localStorage에 저장(상세로 넘어가도 유지)
   */
  useEffect(() => {
    if (!criteria) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(criteria));
    } catch {
      // storage 실패해도 UI는 동작하도록 무시
    }
  }, [criteria]);

  /** 검색 패널 열림 상태 */
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  /** 검색 패널 내부 폼 상태 */
  const [searchForm, setSearchForm] = useState({
    destination: criteria?.destination || "",
    checkIn: criteria?.checkIn || "",
    checkOut: criteria?.checkOut || "",
    guests: criteria?.guests || 2,
  });

  // 페이지 이동 시 자동 닫기
  useEffect(() => {
    if (!isSearchLikePage) {
      setIsPanelOpen(false);
    }
  }, [isSearchLikePage]);

  // criteria가 바뀌면 검색폼도 항상 맞춤
  useEffect(() => {
    setSearchForm({
      destination: criteria?.destination || "",
      checkIn: criteria?.checkIn || "",
      checkOut: criteria?.checkOut || "",
      guests: criteria?.guests || 2,
    });
  }, [criteria]);

  // onChange 핸들러 (input 공용)
  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setSearchForm((prev) => {
      // 체크인 날짜가 바뀔 때 체크아웃보다 늦으면 체크아웃도 같이 맞춰주기
      if (field === "checkIn") {
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
        [field]: field === "guests" ? Number(value) : value,
      };
    });
  };

  /* pill 클릭 시 패널 열기/닫기 */
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


  const STORAGE_KEY = "tp_search_criteria";

  const handleSearchClick = () => {
    if (!searchForm.checkIn || !searchForm.checkOut) {
      alert("체크인/체크아웃 날짜를 선택해주세요.");
      return;
    }

    // 새로고침/상세페이지 이동에도 pill 유지
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchForm));
    } catch {}

    const params = new URLSearchParams();
    if (searchForm.destination) params.set("keyword", searchForm.destination);
    params.set("checkIn", searchForm.checkIn);
    params.set("checkOut", searchForm.checkOut);
    params.set("guests", String(searchForm.guests || 2));

    // ✅ API 호출 X, 이동만
    navigate(`/search-results?${params.toString()}`);
    setIsPanelOpen(false);
  };


  /** 로그인/회원가입 */
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

          {/* 가운데 pill — 검색/상세 페이지에서 표시 */}
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

      {/* 검색 패널 — 검색/상세 페이지 + 열림일 때만 표시 */}
      {isSearchLikePage && isPanelOpen && (
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
                  onChange={handleChange("destination")}
                  placeholder="여행지나 숙소를 검색해보세요."
                />
              </div>

              {/* 체크인/체크아웃 */}
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

              {/* 인원 */}
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
