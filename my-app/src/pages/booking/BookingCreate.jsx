import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { prepareBooking, createBookingFromToken } from "../../api/bookingAPI";

/**
 * BookingCreate.jsx (전체 교체본)
 *
 * - 페이지 진입 시 GET /bookings/prepare 로 예약 페이지 구성 데이터 로딩
 * - sessionStorage에 token이 있으면 우선 사용
 * - 없으면 URL query(roomId, checkinDate, checkoutDate)로 prepare 호출
 * - 폼 입력(pk,fk 제외) -> POST /bookings 로 예약 확정
 * - 성공 시 alert로 bookingNumber 출력
 *
 * ✅ 주의:
 * - 백엔드 DTO가 (view.room.xxx) 구조이든 (view.xxx) flat 구조이든 둘 다 표시 가능하게 작성함
 */
export default function BookingCreate() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const initial = useMemo(() => {
    const roomIdRaw = Number(params.get("roomId"));
    const roomId = roomIdRaw ? Number(roomIdRaw) : undefined; // roomId 파싱을 없으면 undefined로 만들기
    const checkinDate = params.get("checkinDate") || "";
    const checkoutDate = params.get("checkoutDate") || "";
    const userId = Number(params.get("userId")); // 임시

    const tokenFromSession = sessionStorage.getItem("reservationToken") || "";
    return { roomId, checkinDate, checkoutDate, userId, tokenFromSession };
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [view, setView] = useState(null);

  const [form, setForm] = useState({
    userId: initial.userId || "",
    guests: 2,
    bookerName: "",
    visitMode: "WALK",
  });

  // DTO가 nested(room)일 수도 있고(flat)일 수도 있어서 안전하게 꺼내기
  const ui = useMemo(() => {
    const room = view?.room; // nested 케이스
    return {
      accommodationName: room?.accommodationName ?? view?.accommodationName ?? "",
      roomName: room?.roomName ?? view?.roomName ?? "",
      standardCapacity: room?.standardCapacity ?? view?.standardCapacity ?? "",
      maxCapacity: room?.maxCapacity ?? view?.maxCapacity ?? "",
      checkinDate: view?.checkinDate ?? "",
      checkoutDate: view?.checkoutDate ?? "",
      policies: view?.policies ?? [],
      totalPrice: view?.totalPrice ?? 0,
      token: view?.token ?? sessionStorage.getItem("token") ?? "",
    };
  }, [view]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const hasToken = !!initial.tokenFromSession;
        const hasQuery = 
          Number.isFinite(initial.roomId) &&      // isFinite : value가 진짜 숫자고, NaN/infinity/-infinity가 아닌지를 검사하는 값
          initial.roomId > 0 &&
          !! initial.checkinDate &&
          !! initial.checkoutDate;

        if (!hasToken && !hasQuery) {
          throw new Error("예약 정보가 없습니다. roomId/checkinDate/checkoutDate 또는 token이 필요합니다. ");
        }

        const data = await prepareBooking({
        token: initial.tokenFromSession || undefined,
        roomId: hasQuery ? initial.roomId : undefined,
        checkinDate: hasQuery ? initial.checkinDate : undefined,
        checkoutDate: hasQuery ? initial.checkoutDate : undefined,
        });


        if (cancelled) return;

        setView(data);

        if (data?.token) {
          sessionStorage.setItem("reservationToken", data.token);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e?.message || "예약 정보 로딩 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initial]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev, // ✅ 기존 .prev 문법 오류 수정
      [key]: key === "guests" ? Number(e.target.value) : e.target.value,
    }));
  };

  const onSubmit = async () => {
    try {
      setError("");

      const token = sessionStorage.getItem("reservationToken");
      if (!token) throw new Error("예약 토큰이 없습니다. 다시 시도해주세요.");

      if (!form.userId) throw new Error("userId가 필요합니다.(임시)");

      const res = await createBookingFromToken({
        userId: Number(form.userId),
        token,
        guests: Number(form.guests || 2),
        bookerName: form.bookerName,
        visitMode: form.visitMode,
      });

      alert(`예약 완료!\n예약번호: ${res?.bookingNumber || "(없음)"}`);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "예약 생성 실패");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-2">예약 페이지 로딩 중</h1>
        <div className="text-sm text-gray-600">room / dailyRoomPolicy 정보를 불러오는 중입니다.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-3">
        <h1 className="text-xl font-semibold">예약 페이지 오류</h1>
        <div className="rounded border p-3 text-sm">{error}</div>
        <button className="rounded border px-3 py-2" onClick={() => window.location.reload()}>
          다시 시도
        </button>
      </div>
    );
  }

  if (!view) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">예약</h1>

      {/* 1) 숙소/객실 정보 */}
      <section className="rounded border p-4">
        <div className="text-sm text-gray-500">숙소</div>
        <div className="text-lg font-semibold">{ui.accommodationName}</div>

        <div className="mt-1 text-sm text-gray-700">객실: {ui.roomName}</div>
        <div className="mt-1 text-sm text-gray-700">
          인원: 기준 {ui.standardCapacity} / 최대 {ui.maxCapacity}
        </div>
        <div className="mt-2 text-sm text-gray-700">
          일정: {String(ui.checkinDate)} ~ {String(ui.checkoutDate)}
        </div>
      </section>

      {/* 2) 일자별 가격/재고 */}
      <section className="rounded border p-4">
        <div className="text-lg font-semibold mb-3">일자별 가격/재고</div>

        <div className="space-y-2">
          {ui.policies?.map((p) => (
            <div key={p.policyId} className="flex items-center justify-between rounded bg-gray-50 p-2">
              <div className="text-sm">
                <div className="font-medium">{String(p.targetDate)}</div>
                <div className="text-gray-600">policyId: {p.policyId}</div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{p.price?.toLocaleString()}원</div>
                <div className="text-gray-600">남은재고: {p.remainingStock}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-right text-lg font-semibold">
          총액: {Number(ui.totalPrice || 0).toLocaleString()}원
        </div>
      </section>

      {/* 3) 예약 정보 입력 */}
      <section className="rounded border p-4 space-y-3">
        <div className="text-lg font-semibold">예약 정보 입력</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">
            userId(임시)
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.userId}
              onChange={onChange("userId")}
              placeholder="예: 1"
            />
          </label>

          <label className="text-sm">
            투숙 인원(guests)
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.guests}
              onChange={onChange("guests")}
            />
          </label>

          <label className="text-sm">
            예약자명(bookerName)
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.bookerName}
              onChange={onChange("bookerName")}
              placeholder="홍길동"
            />
          </label>

          <label className="text-sm">
            방문 방식(visitMode)
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={form.visitMode}
              onChange={onChange("visitMode")}
            >
              <option value="WALK">도보(WALK)</option>
              <option value="CAR">차량(CAR)</option>
            </select>
          </label>
        </div>

        <button className="w-full rounded bg-black text-white py-3 font-semibold" onClick={onSubmit}>
          예약 가능
        </button>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}
      </section>

      {/* 디버그: 현재 토큰 */}
      <section className="text-xs text-gray-500">token: {String(ui.token)}</section>
    </div>
  );
}
