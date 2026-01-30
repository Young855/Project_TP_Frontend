import { useEffect, useMemo, useState } from "react";
import { usePartner } from "../../context/PartnerContext";
import { getPartnerDashboardByAccommodation } from "@/api/dashboardAPI";
import {
  getPartnerBookingsByAccommodation,
  confirmPartnerBooking,
} from "@/api/partnerBookingAPI";

import { Filter, Loader2, RotateCcw, Search } from "lucide-react";

export default function PartnerBookingPage() {
  const { currentAccommodation, partnerInfo } = usePartner();

  // ✅ 오늘(로컬) 날짜 문자열 (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [summary, setSummary] = useState({
    todaySales: 0,
    todayCheckinCount: 0,
    pendingCount: 0,
    remainingRoomCount: 0,
    totalRoomCount: 0,
  });

  const [rawList, setRawList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    keywordType: "bookingNumber",
    keyword: "",
    startDate: "",
    endDate: "",
  });

  const list = useMemo(() => {
    // 현재는 rawList 그대로 사용(필터가 서버에서 적용되는 구조)
    // 프론트에서 추가 필터/검색을 할거면 여기서 처리하면 됨
    return rawList;
  }, [rawList]);

  const fetchData = async ({ status } = {}) => {
    if (!partnerInfo?.partnerId || !currentAccommodation?.accommodationId) return;

    setIsLoading(true);

    try {
      // ✅ 오늘 날짜(서울 기준으로 맞추려면)
      const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

      // 1) 요약(숙소별)
      const summaryData = await getPartnerDashboardByAccommodation(
        partnerInfo.partnerId,
        currentAccommodation.accommodationId,
        today
      );
      setSummary(summaryData);

      // 2) 예약관리(숙소별)
      const bookingData = await getPartnerBookingsByAccommodation({
        partnerId: partnerInfo.partnerId,
        accommodationId: currentAccommodation.accommodationId,
        lastId: null,
        status: status ?? null,
        size: 20,
      });

      setRawList(Array.isArray(bookingData) ? bookingData : []);
    } catch (error) {
      console.error(error);
      alert("데이터 조회 실패: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ status: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerInfo?.partnerId, currentAccommodation?.accommodationId]);

  const handleSearch = async () => {
    // 지금 구조는 status만 서버에 전달하는 형태
    await fetchData({ status: filters.status || null });
  };

  const handleReset = async () => {
    setFilters({
      status: "",
      keywordType: "bookingNumber",
      keyword: "",
      startDate: "",
      endDate: "",
    });
    await fetchData({ status: null });
  };

  const handleConfirm = async (row) => {
    const isToday = row?.checkinDate === todayStr;

    // ✅ 정책: 체크인 당일 + PENDING만 확정 가능
    if (row?.bookingStatus !== "PENDING") {
      alert("PENDING 상태만 확정할 수 있습니다.");
      return;
    }
    if (!isToday) {
      alert("예약 확정은 체크인 당일에만 가능합니다.");
      return;
    }

    if (!window.confirm("예약을 확정하시겠습니까?")) return;

    try {
      await confirmPartnerBooking({
        partnerId: partnerInfo.partnerId,
        bookingId: row.bookingId,
      });

      alert("예약이 확정되었습니다.");

      // 확정 후 재로딩(현재 status 필터 유지)
      await fetchData({ status: filters.status || null });
    } catch (error) {
      alert("변경 실패: " + (error.response?.data?.message || error.message));
    }
  };

  if (!currentAccommodation) {
    return (
      <div className="p-6 text-gray-500">
        숙소를 선택해주세요. (파트너가 가진 숙소가 없으면 관리자에서 숙소 등록 필요)
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 타이틀 */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentAccommodation.name}
          </h1>
          <p className="text-gray-500 text-sm">실시간 예약 및 객실 현황입니다.</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">오늘 매출</p>
          <p className="text-2xl font-bold mt-1">
            {Number(summary.todaySales || 0).toLocaleString()}원
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">체크인 예정</p>
          <p className="text-2xl font-bold mt-1">
            {Number(summary.todayCheckinCount || 0).toLocaleString()}건
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">확정 대기(PENDING)</p>
          <p className="text-2xl font-bold mt-1">
            {Number(summary.pendingCount || 0).toLocaleString()}건
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">남은 객실 / 전체 객실</p>
          <p className="text-2xl font-bold mt-1">
            {Number(summary.remainingRoomCount || 0).toLocaleString()} /{" "}
            {Number(summary.totalRoomCount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 필터 박스 */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} />
            예약 관리 필터
          </h2>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition"
          >
            <RotateCcw size={18} />
            초기화
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 items-end">
          {/* 상태 필터 */}
          <div className="w-52">
            <label className="block text-sm text-gray-600 mb-1">상태</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) =>
                setFilters((p) => ({ ...p, status: e.target.value }))
              }
            >
              <option value="">전체</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {/* 예약번호/예약자명(현재 서버에 넘기진 않음 - UI만 유지) */}
          <div className="w-44">
            <label className="block text-sm text-gray-600 mb-1">검색 기준</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={filters.keywordType}
              onChange={(e) =>
                setFilters((p) => ({ ...p, keywordType: e.target.value }))
              }
            >
              <option value="bookingNumber">예약번호</option>
              <option value="bookerName">예약자명</option>
            </select>
          </div>

          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm text-gray-600 mb-1">검색어</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={filters.keyword}
              onChange={(e) =>
                setFilters((p) => ({ ...p, keyword: e.target.value }))
              }
              placeholder="검색어 입력"
            />
          </div>

          {/* 날짜 범위(현재 서버에 넘기진 않음 - UI만 유지) */}
          <div className="flex gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">시작일</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 text-sm"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, startDate: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">종료일</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 text-sm"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          {/* 조회 버튼 */}
          <div className="flex gap-2 ml-auto h-[90px] items-center">
            <button
              onClick={handleSearch}
              disabled={isLoading && rawList.length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition shadow-sm font-medium disabled:bg-blue-400"
            >
              {isLoading && rawList.length === 0 ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Search size={18} />
              )}
              조회
            </button>
          </div>
        </div>
      </div>

      {/* 예약 테이블 */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">예약 관리</h2>
            <span className="text-xs text-red-500">
              ※ 예약 확정은 체크인 당일 예약만 가능합니다.
            </span>
          </div>
          {isLoading && <span className="text-sm text-gray-500">로딩중...</span>}
        </div>

        {/* 테이블 헤더 */}
        <div className="grid grid-cols-12 px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-50">
          <div className="col-span-2">예약번호</div>
          <div className="col-span-2">예약자명</div>
          <div className="col-span-2">이용일자</div>
          <div className="col-span-2">현재 상태</div>
          <div className="col-span-2">상태 변경</div>
          <div className="col-span-2 text-right">예약일</div>
        </div>

        {/* 테이블 바디 */}
        {list.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            예약 내역이 없습니다.
          </div>
        ) : (
          list.map((row) => (
            <div
              key={row.bookingId}
              className="grid grid-cols-12 px-6 py-4 text-sm border-t items-center"
            >
              <div className="col-span-2">{row.bookingNumber}</div>
              <div className="col-span-2">{row.bookerName ?? "-"}</div>
              <div className="col-span-2">
                {row.checkinDate} ~ {row.checkoutDate}
              </div>
              <div className="col-span-2">{row.bookingStatus}</div>

              {/* 상태 변경: PENDING + 오늘(checkinDate==todayStr)일 때만 활성 */}
              <div className="col-span-2">
                {(() => {
                  const isToday = row.checkinDate === todayStr;
                  const canConfirm = row.bookingStatus === "PENDING" && isToday;

                  if (row.bookingStatus !== "PENDING") return <span className="text-gray-400">-</span>;

                  return (
                    <button
                      disabled={!canConfirm}
                      className={`px-3 py-2 rounded-lg border text-sm transition ${
                        canConfirm
                          ? "hover:bg-gray-50"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => handleConfirm(row)}
                      title={
                        canConfirm
                          ? "예약 확정"
                          : "예약 확정은 체크인 당일에만 가능합니다."
                      }
                    >
                      확정
                    </button>
                  );
                })()}
              </div>

              <div className="col-span-2 text-right text-gray-500">
                {String(row.createdAt ?? "").slice(0, 10)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
