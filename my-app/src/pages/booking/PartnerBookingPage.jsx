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

  const [summary, setSummary] = useState({
    todaySales: 0,
    todayCheckinCount: 0,
    remainingRoomCount: 0,
    totalRoomCount: 0,
    pendingCount: 0,
  });

  // 서버에서 받아온 “원본 목록”
  const [rawList, setRawList] = useState([]);

  // 로딩
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 필터 상태(관리자 필터 UI 느낌 유지)
  const [filters, setFilters] = useState({
    bookingKeyword: "", // 예약번호 검색
    bookerName: "", // 예약자명 검색
    status: "", // 전체/ PENDING / CONFIRMED ...
    startDate: "", // 예약일(등록일) 시작
    endDate: "", // 예약일(등록일) 종료
  });

  /**
   * ✅ 서버 호출 (대시보드 + 예약리스트)
   * - 서버 필터는 우선 status만 적용 (백엔드가 지원할 가능성이 높음)
   * - 나머지는 프론트에서 필터링(useMemo)
   */
  const fetchData = async ({ status } = {}) => {
    if (!currentAccommodation?.accommodationId || !partnerInfo?.partnerId) return;

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1) 대시보드
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
      console.error("데이터 로드 실패:", error);
      alert("데이터 로드 실패: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 숙소 선택 바뀔 때 초기 로딩
  useEffect(() => {
    if (!currentAccommodation?.accommodationId || !partnerInfo?.partnerId) return;
    fetchData({ status: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccommodation, partnerInfo]);

  // ✅ 조회 버튼
  const handleSearch = async () => {
    // 날짜 검증
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      alert("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    // 서버에는 status만 전달 (나머지는 아래 listMemo에서 프론트 필터)
    await fetchData({ status: filters.status || null });
  };

  // ✅ 필터 초기화
  const handleReset = async () => {
    const empty = {
      bookingKeyword: "",
      bookerName: "",
      status: "",
      startDate: "",
      endDate: "",
    };
    setFilters(empty);

    await fetchData({ status: null });
  };

  // ✅ 예약 확정
  const handleConfirm = async (bookingId) => {
    if (!window.confirm("예약을 확정하시겠습니까?")) return;

    try {
      await confirmPartnerBooking({
        partnerId: partnerInfo.partnerId,
        bookingId,
      });

      alert("예약이 확정되었습니다.");

      // 확정 후 재로딩(현재 status 필터 유지)
      await fetchData({ status: filters.status || null });
    } catch (error) {
      alert("변경 실패: " + (error.response?.data?.message || error.message));
    }
  };

  // ✅ 프론트 필터 적용된 최종 리스트
  const list = useMemo(() => {
    const safe = Array.isArray(rawList) ? rawList : [];

    const keyword = (filters.bookingKeyword || "").trim().toLowerCase();
    const booker = (filters.bookerName || "").trim().toLowerCase();
    const start = filters.startDate || "";
    const end = filters.endDate || "";

    return safe.filter((row) => {
      // 예약번호 검색
      if (keyword) {
        const bk = String(row.bookingNumber ?? "").toLowerCase();
        if (!bk.includes(keyword)) return false;
      }

      // 예약자명 검색
      if (booker) {
        const bn = String(row.bookerName ?? "").toLowerCase();
        if (!bn.includes(booker)) return false;
      }

      // 예약일(등록일) 기간 필터: createdAt yyyy-mm-dd 기준
      if (start || end) {
        const created = String(row.createdAt ?? "").slice(0, 10); // yyyy-mm-dd
        if (start && created < start) return false;
        if (end && created > end) return false;
      }

      return true;
    });
  }, [rawList, filters.bookingKeyword, filters.bookerName, filters.startDate, filters.endDate]);

  if (!currentAccommodation) {
    return (
      <div className="p-10 text-center text-gray-500">
        좌측 상단에서 숙소를 먼저 선택해 주세요.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 타이틀 */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentAccommodation.name}</h1>
          <p className="text-gray-500 text-sm">실시간 예약 및 객실 현황입니다.</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="오늘의 매출"
          value={`${summary.todaySales.toLocaleString()}원`}
          subText="오늘 체크인 예약 기준"
        />
        <SummaryCard
          title="체크인 예정"
          value={`${summary.todayCheckinCount}건`}
          subText="오늘 방문 예정 총 건수"
        />
        <SummaryCard
          title="남은 객실"
          value={`${summary.remainingRoomCount} / ${summary.totalRoomCount}`}
          subText="전체 재고 - 오늘 예약"
        />
        <SummaryCard
          title="확정 대기"
          value={`${summary.pendingCount}건`}
          subText="PENDING 상태 예약"
          accent="orange"
        />
      </div>

      {/* ✅ (추가) 관리자 스타일 필터 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} />
            예약 관리 필터
          </h2>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition text-sm font-medium"
          >
            <RotateCcw size={16} /> 필터 초기화
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {/* 예약번호 검색 */}
          <div className="flex-1 min-w-[240px] h-[90px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">예약번호 검색</label>
            <input
              type="text"
              placeholder="예) BK-2026-01-23..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={filters.bookingKeyword}
              onChange={(e) => setFilters((p) => ({ ...p, bookingKeyword: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* 예약자명 */}
          <div className="w-48 h-[90px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">예약자명</label>
            <input
              type="text"
              placeholder="예약자명 입력"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={filters.bookerName}
              onChange={(e) => setFilters((p) => ({ ...p, bookerName: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* 현재 상태 */}
          <div className="w-48 h-[90px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 상태</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none"
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">전체</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* 예약일(등록일) 기간 */}
          <div className="h-[90px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">예약일(등록일) 기간</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setFilters((p) => {
                    // start가 end보다 뒤면 end를 start로 맞춤(관리자 페이지 로직 느낌)
                    if (p.endDate && newStart > p.endDate) {
                      return { ...p, startDate: newStart, endDate: newStart };
                    }
                    return { ...p, startDate: newStart };
                  });
                }}
              />
              <span className="text-gray-500">~</span>
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.endDate}
                min={filters.startDate}
                onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
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
          <h2 className="font-semibold text-gray-900">예약 관리</h2>
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

              {/* 상태 변경: PENDING일 때만 확정 버튼 */}
              <div className="col-span-2">
                {row.bookingStatus === "PENDING" ? (
                  <button
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                    onClick={() => handleConfirm(row.bookingId)}
                  >
                    확정
                  </button>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
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

/** 카드 컴포넌트(너 기존 스타일 유지용 간단 버전) */
function SummaryCard({ title, value, subText, accent }) {
  const ring = accent === "orange" ? "border-orange-200" : "border-gray-200";

  return (
    <div className={`bg-white rounded-xl border ${ring} p-5`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-2 text-xs text-gray-400">{subText}</div>
    </div>
  );
}
