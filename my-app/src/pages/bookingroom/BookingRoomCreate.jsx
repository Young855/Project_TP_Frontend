import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBookingRoom } from "../../api/bookingRoomAPI";

/**
 * 예약-객실 매핑 생성
 * - 필수값: bookingId, roomId, qty(>=1), pricePerNight(>=0), nights(>=1)
 * - 백엔드 DTO 형태에 맞게 body 구성
 */
const BookingRoomCreate = () => {
  const navigate = useNavigate();

  const [bookingId, setBookingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [qty, setQty] = useState(1);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [nights, setNights] = useState(1);

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!bookingId || Number(bookingId) <= 0) return "bookingId를 올바르게 입력해주세요.";
    if (!roomId || Number(roomId) <= 0) return "roomId를 올바르게 입력해주세요.";
    if (!qty || Number(qty) < 1) return "qty는 1 이상이어야 합니다.";
    if (pricePerNight === "" || Number(pricePerNight) < 0) return "pricePerNight는 0 이상이어야 합니다.";
    if (!nights || Number(nights) < 1) return "nights는 1 이상이어야 합니다.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      // 백엔드 DTO에 맞게 전송.
      // (예: { bookingId, roomId, qty, pricePerNight, nights })
      // 또는 { booking: {bookingId}, room: {roomId}, ... } 형태일 수도 있음 → 백엔드 DTO에 맞춰 조정.
      const body = {
        bookingId: Number(bookingId),
        roomId: Number(roomId),
        qty: Number(qty),
        pricePerNight: Number(pricePerNight),
        nights: Number(nights),
      };

      const res = await createBookingRoom(body);

      // 생성 후 상세로 이동(응답에 포함된 키를 우선 사용, 없으면 입력값으로 이동)
      const bkId = res?.booking?.bookingId ?? res?.bookingId ?? Number(bookingId);
      const rmId = res?.room?.roomId ?? res?.roomId ?? Number(roomId);
      navigate(`/bookingrooms/${bkId}/${rmId}`);
    } catch (e) {
      console.error(e);
      setErrMsg("생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>예약-객실 매핑 생성</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Booking ID{" "}
            <input type="number" value={bookingId} onChange={(e) => setBookingId(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Room ID{" "}
            <input type="number" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
          </label>
        </div>
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
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/bookingrooms")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default BookingRoomCreate;
