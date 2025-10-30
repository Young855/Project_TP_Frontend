import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookingRoom, updateBookingRoom } from "../../api/bookingRoomAPI";

/**
 * 예약-객실 매핑 수정
 * - 복합키(bookingId, roomId)는 URL 파라미터로 고정 → 일반적으로 변경하지 않음
 * - 수정 대상: qty, pricePerNight, nights
 */
const BookingRoomEdit = () => {
  const { bookingId, roomId } = useParams();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [nights, setNights] = useState(1);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!qty || Number(qty) < 1) return "qty는 1 이상이어야 합니다.";
    if (pricePerNight === "" || Number(pricePerNight) < 0) return "pricePerNight는 0 이상이어야 합니다.";
    if (!nights || Number(nights) < 1) return "nights는 1 이상이어야 합니다.";
    return "";
  };

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getBookingRoom(bookingId, roomId);
      setQty(data.qty ?? 1);
      setPricePerNight(data.pricePerNight ?? 0);
      setNights(data.nights ?? 1);
    } catch (e) {
      console.error(e);
      setErrMsg("기존 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      // 백엔드 DTO에 맞춰 본문 구성
      const body = {
        qty: Number(qty),
        pricePerNight: Number(pricePerNight),
        nights: Number(nights),
      };

      await updateBookingRoom(bookingId, roomId, body);
      navigate(`/bookingrooms/${bookingId}/${roomId}`);
    } catch (e) {
      console.error(e);
      setErrMsg("수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [bookingId, roomId]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>예약-객실 매핑 수정</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ marginBottom: 8 }}>
        <b>Booking ID:</b> {bookingId} &nbsp; | &nbsp; <b>Room ID:</b> {roomId}
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Qty{" "}
            <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Price/Night{" "}
            <input type="number" min={0} value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Nights{" "}
            <input type="number" min={1} value={nights} onChange={(e) => setNights(e.target.value)} required />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "수정 중..." : "수정"}</button>{" "}
          <button type="button" onClick={() => navigate(`/bookingrooms/${bookingId}/${roomId}`)}>상세</button>
        </div>
      </form>
    </div>
  );
};

export default BookingRoomEdit;
