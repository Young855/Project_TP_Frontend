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
    </div>
  );
}
