import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../../api/bookingAPI";

export default function BookingCreatePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const payload = useMemo(() => {
    const userId = Number(params.get("userId"));
    const roomId = Number(params.get("roomId"));
    const checkinDate = params.get("checkinDate") || "";
    const checkoutDate = params.get("checkoutDate") || "";
    const guests = Number(params.get("guests") || 2);

    return { userId, roomId, checkinDate, checkoutDate, guests };
  }, [params]);

  const [error, setError] = useState("");

  useEffect(() => {
    // 필수값 없으면 생성하지 않음
    if (!payload.userId || !payload.roomId || !payload.checkinDate || !payload.checkoutDate) {
      setError("예약 생성에 필요한 정보가 부족합니다.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setError("");
        const res = await createBooking(payload);
        const bookingId = res?.bookingId ?? res?.id;

        if (!bookingId) throw new Error("예약 생성 응답에 bookingId가 없습니다.");
        if (cancelled) return;

        navigate(`/bookings/${bookingId}`, { replace: true });
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e?.message || "예약 생성 실패");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [payload, navigate]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        <h1 className="text-xl font-semibold">예약 생성 실패</h1>
        <div className="rounded border p-3 text-sm">{error}</div>
        <button
          className="rounded border px-3 py-2"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-2">예약 생성 중...</h1>
      <div className="text-sm text-gray-600">
        잠시만 기다려주세요. 예약 정보를 생성하고 있습니다.
      </div>
    </div>
  );
}
