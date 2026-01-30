<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllBookings, getBookingByUserId } from "../../api/bookingAPI";

function money(v) {
  return Number(v || 0).toLocaleString();
}

export default function BookingList() {
  const [params] = useSearchParams();
  const userId = params.get("userId"); // /bookings?userId=1

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const res = userId ? await getBookingByUserId(userId) : await getAllBookings();
        if (!mounted) return;

        const arr = Array.isArray(res) ? res : (res?.content || res?.items || []);
        setList(arr);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.response?.data?.message || e?.message || "목록 조회 실패");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">예약 목록</h1>
        <Link to="/bookings/new" className="text-sm underline">
          예약 생성
        </Link>
      </div>

      {loading ? <div>로딩중...</div> : null}
      {err ? <div className="rounded border p-3 text-sm">{err}</div> : null}

      <div className="divide-y border rounded">
        {list.map((b) => (
          <Link
            key={b?.bookingId ?? b?.id}
            to={`/bookings/${b?.bookingId ?? b?.id}`}
            className="block p-3 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <div className="font-medium">예약 #{b?.bookingId ?? b?.id}</div>
              <div className="text-sm">{money(b?.totalPrice)}원</div>
            </div>
            <div className="text-xs mt-1">
              {b?.checkinDate} ~ {b?.checkoutDate}
            </div>
          </Link>
        ))}
      </div>
=======
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getBookingByUserId, cancelBooking } from "../../api/bookingAPI";

export default function BookingList() {
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ 상세 모달 상태
  const [detailBooking, setDetailBooking] = useState(null);

  const userId = 1;

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getBookingByUserId(userId);

        const data =
          Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.content) ? res.content :
          [];

        setList(data);
      } catch (e) {
        console.error(e);
        setError("예약 내역이 없습니다.");
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [userId]);

  const isPastOrToday = (checkinDateStr) => {
    if (!checkinDateStr) return false;
    const today = new Date().toISOString().slice(0, 10);
    return today >= checkinDateStr;
  };

  const onCancel = async (bookingId, bookingStatus, checkinDate) => {
    try {
      if (bookingStatus === "CANCELLED") {
        alert("이미 취소된 예약입니다.");
        return;
      }

      if (isPastOrToday(checkinDate)) {
        alert("체크인 날짜 이후에는 취소할 수 없습니다.");
        return;
      }

      if (!window.confirm("정말 예약을 취소할까요?")) return;

      await cancelBooking(bookingId, userId);
      alert("취소되었습니다.");
      window.location.reload();
    } catch (e) {
      alert(e?.response?.data?.message ?? "예약 취소에 실패했습니다.");
    }
  };

  const sections = useMemo(() => {
    const arr = Array.isArray(list) ? list : [];

    const getKey = (b) => {
      const status = b.bookingStatus;
      if (status === "CANCELLED") return "CANCELLED";
      if (isPastOrToday(b.checkinDate)) return "LOCKED";
      return "ACTIVE";
    };

    const sort = (a, b) => a.checkinDate.localeCompare(b.checkinDate);

    return {
      active: arr.filter(b => getKey(b) === "ACTIVE").sort(sort),
      locked: arr.filter(b => getKey(b) === "LOCKED").sort(sort),
      cancelled: arr.filter(b => getKey(b) === "CANCELLED").sort(sort),
    };
  }, [list]);

  const renderCard = (b) => {
    const isNonCancelable =
      b.bookingStatus === "CANCELLED" || isPastOrToday(b.checkinDate);

    return (
      <div key={b.bookingId} className="p-4 rounded-lg border bg-white">
        <div className="flex justify-between gap-4">
          {/* 왼쪽 정보 */}
          <div className="min-w-0">
            <div className="font-semibold text-lg">
              {b.accommodationName ?? "숙소명 없음"}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {b.checkinDate} ~ {b.checkoutDate}
            </div>
            <div className="text-sm mt-1">
              가격: {b.totalPrice?.toLocaleString("ko-KR")}원
            </div>
          </div>

          {/* 오른쪽 버튼 */}
          <div className="flex flex-col gap-2 justify-end">
            {/* ✅ 상세 정보 버튼 */}
            <button
              className="h-9 px-3 rounded border text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setDetailBooking(b)}
            >
              상세 정보
            </button>

            {/* 예약 취소 버튼 */}
            <button
              className={`h-9 px-3 rounded border text-sm
                ${isNonCancelable
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-blue-700 border-blue-300 hover:bg-gray-50"
                }`}
              disabled={isNonCancelable}
              onClick={() =>
                onCancel(b.bookingId, b.bookingStatus, b.checkinDate)
              }
            >
              {b.bookingStatus === "CANCELLED"
                ? "취소됨"
                : isPastOrToday(b.checkinDate)
                ? "취소불가"
                : "예약 취소"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6">불러오는 중...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">예약 내역</h1>

      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-6">
        {sections.active.map(renderCard)}
        {sections.locked.map(renderCard)}
        {sections.cancelled.map(renderCard)}
      </div>

      {/* ✅ 상세 정보 모달 */}
      {detailBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">예약 상세 정보</h2>

            <div className="space-y-2 text-sm">
              <div>
                <b>숙소</b>: {detailBooking.accommodationName}
              </div>
              <div>
                <b>객실</b>: {detailBooking.roomName}
              </div>
              <div>
                <b>일정</b>: {detailBooking.checkinDate} ~{" "}
                {detailBooking.checkoutDate}
              </div>
              <div>
                <b>예약 번호</b>:{" "}
                {detailBooking.bookingNumber ?? detailBooking.bookingId}
              </div>
              <div>
                <b>예약자</b>: {detailBooking.bookerName}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setDetailBooking(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> otherwork
    </div>
  );
}
