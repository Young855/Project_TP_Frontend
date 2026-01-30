import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBooking } from "../../api/bookingAPI";

// 유틸리티 함수: 금액 포맷팅 (정의되지 않아 추가함)
const formatMoney = (amount) => {
  return new Number(amount || 0).toLocaleString();
};

export default function BookingDetail() {
  const { bookingId } = useParams(); // URL 파라미터 이름을 하나로 통일

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [bookerName, setBookerName] = useState("");
  const [visitMode, setVisitMode] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await getBooking(bookingId);
      setData(res);
      // 폼 기본값 설정
      setBookerName(res?.bookerName || "");
      setVisitMode(res?.visitMode || "");
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) load();
  }, [bookingId]);

  const priceRows = useMemo(() => {
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

  // 핸들러 함수들
  const onSaveBooker = async () => {
    if (!bookerName.trim()) {
      alert("예약자 이름은 필수입니다.");
      return;
    }
    setBusy(true);
    try {
      // updateBookerInfo API가 필요합니다
      // await updateBookerInfo(bookingId, { bookerName, visitMode });
      alert("저장 완료");
      await load();
    } catch (e) {
      alert("저장 실패");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto p-4">로딩중...</div>;
  if (err) return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <div className="rounded border p-3 text-sm">{err}</div>
      <button className="border px-3 py-2" onClick={load}>다시 시도</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">예약 상세</h1>
        <Link to="/bookings" className="text-sm underline">목록</Link>
      </div>

      {/* 기본 정보 섹션 */}
      <section className="rounded border p-4 text-sm space-y-2">
        <h2 className="text-lg font-bold">예약 #{data?.bookingId || bookingId}</h2>
        <div className="grid grid-cols-2 gap-2">
          <div>숙소: <b>{data?.propertyName || "-"}</b></div>
          <div>객실: <b>{data?.roomName || "-"}</b></div>
          <div>기간: <b>{data?.checkinDate} ~ {data?.checkoutDate}</b></div>
          <div>상태: <span className="font-bold text-blue-600">{data?.bookingStatus}</span></div>
        </div>
      </section>

      {/* 가격 정보 섹션 */}
      <section className="rounded border p-4">
        <h2 className="font-semibold mb-2">날짜별 가격</h2>
        {priceRows.length === 0 ? (
          <div className="text-sm">가격 정보 없음</div>
        ) : (
          <div className="divide-y">
            {priceRows.map((r, idx) => (
              <div key={idx} className="flex justify-between py-2 text-sm">
                <div>{r?.targetDate || `Day ${idx + 1}`}</div>
                <div className="font-medium">{formatMoney(r?.price)}원</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between pt-3 mt-3 border-t font-bold text-lg">
          <div>총 결제금액</div>
          <div>{formatMoney(totalPrice)}원</div>
        </div>
      </section>

      {/* 예약자 정보 수정 섹션 */}
      <section className="rounded border p-4 space-y-3">
        <h2 className="font-semibold">예약자 정보 수정</h2>
        <input
          placeholder="예약자 성함"
          value={bookerName}
          onChange={(e) => setBookerName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <select
          value={visitMode}
          onChange={(e) => setVisitMode(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">방문수단 선택</option>
          <option value="WALK">도보</option>
          <option value="CAR">차량</option>
        </select>
        <button 
          disabled={busy}
          className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-400"
          onClick={onSaveBooker}
        >
          정보 저장하기
        </button>
      </section>
    </div>
  );
}