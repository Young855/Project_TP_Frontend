import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBooking } from "../../api/bookingAPI";
import { updateBookerInfo, confirmPayment } from "../../api/bookingAPI";

function money(v) {
  return Number(v || 0).toLocaleString();
}

export default function BookingDetail() {
  const { bookingId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [bookerName, setBookerName] = useState("");
  const [visitMode, setVisitMode] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await getBooking(bookingId);
      setData(res);

      // 폼 기본값
      setBookerName(res?.bookerName || "");
      setVisitMode(res?.visitMode || "");
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const priceRows = useMemo(() => {
    // 백엔드 응답 키가 확정되면 여기 하나로 통일하면 됨
    const list =
      data?.dailyRoomPolicies ||
      data?.dailyPolicies ||
      data?.prices ||
      data?.nightPrices ||
      [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const totalPrice = useMemo(() => {
    if (data?.totalPrice != null) return Number(data.totalPrice);
    return priceRows.reduce((acc, r) => acc + Number(r?.price || 0), 0);
  }, [data, priceRows]);

  const onSaveBooker = async () => {
    if (!bookerName.trim()) {
      alert("예약자 이름은 필수야.");
      return;
    }
    try {
      await updateBookerInfo(bookingId, {
        bookerName: bookerName.trim(),
        visitMode: visitMode || null,
      });
      await load();
      alert("저장 완료");
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "저장 실패");
    }
  };

  const onConfirmPayment = async () => {
    try {
      // 프로젝트 PaymentConfirmRequest에 맞춰 payload 확장 가능
      await confirmPayment(bookingId, {});
      await load();
      alert("결제 확정 완료");
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "결제 확정 실패");
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto p-4">로딩중...</div>;
  if (err) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-3">
        <div className="rounded border p-3 text-sm">{err}</div>
        <button className="rounded border px-3 py-2" onClick={load}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">예약 상세</h1>
        <Link to="/bookings" className="text-sm underline">
          목록
        </Link>
      </div>

      <section className="rounded border p-4 text-sm space-y-1">
        <div>
          bookingId: <b>{data?.bookingId ?? bookingId}</b>
        </div>
        <div>
          userId: <b>{data?.userId ?? data?.user?.userId ?? "-"}</b>
        </div>
        <div>
          checkin: <b>{data?.checkinDate || "-"}</b>
        </div>
        <div>
          checkout: <b>{data?.checkoutDate || "-"}</b>
        </div>
        <div>
          bookingStatus: <b>{data?.bookingStatus || "-"}</b>
        </div>
        <div>
          paymentStatus: <b>{data?.paymentStatus || "-"}</b>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="font-semibold mb-2">날짜별 가격</h2>

        {priceRows.length === 0 ? (
          <div className="text-sm">가격 정보 없음</div>
        ) : (
          <div className="divide-y">
            {priceRows.map((r, idx) => (
              <div key={idx} className="flex justify-between py-2 text-sm">
                <div>{r?.targetDate ?? r?.policyDate ?? r?.date ?? `Day ${idx + 1}`}</div>
                <div className="font-medium">{money(r?.price)}원</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-3 mt-3 border-t">
          <div className="font-semibold">총 결제금액</div>
          <div className="text-lg font-semibold">{money(totalPrice)}원</div>
        </div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-semibold">예약자 정보</h2>

        <label className="text-sm block">
          예약자 이름
          <input
            value={bookerName}
            onChange={(e) => setBookerName(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </label>

        <label className="text-sm block">
          방문수단
          <select
            value={visitMode}
            onChange={(e) => setVisitMode(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
          >
            <option value="">선택</option>
            <option value="WALK">도보</option>
            <option value="CAR">차량</option>
            <option value="ETC">기타</option>
          </select>
        </label>

        <button className="rounded border px-3 py-2" onClick={onSaveBooker}>
          저장
        </button>
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="font-semibold">결제</h2>
        <button className="w-full rounded bg-black text-white py-2" onClick={onConfirmPayment}>
          결제 확정
        </button>
      </section>
    </div>
  );
}
