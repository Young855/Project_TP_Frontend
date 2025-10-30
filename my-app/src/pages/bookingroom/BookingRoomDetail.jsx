import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBookingRoom, deleteBookingRoom } from "../../api/bookingRoomAPI";

/**
 * 예약-객실 매핑 상세
 * - GET 단건
 * - 삭제/수정 이동
 */
const BookingRoomDetail = () => {
  const { bookingId, roomId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getBookingRoom(bookingId, roomId);
      setItem(data);
    } catch (e) {
      console.error(e);
      setErrMsg("상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`정말 삭제하시겠습니까?\n[bookingId=${bookingId}, roomId=${roomId}]`)) return;
    try {
      await deleteBookingRoom(bookingId, roomId);
      navigate("/bookingrooms");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [bookingId, roomId]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!item) return <div>데이터가 없습니다.</div>;

  const bookingPk = item.booking?.bookingId ?? item.bookingId;
  const roomPk = item.room?.roomId ?? item.roomId;

  return (
    <div style={{ padding: 16 }}>
      <h1>예약-객실 매핑 상세</h1>

      <div style={{ margin: "8px 0" }}><b>Booking ID:</b> {bookingPk}</div>
      <div style={{ margin: "8px 0" }}><b>Room ID:</b> {roomPk}</div>
      <div style={{ margin: "8px 0" }}><b>Qty:</b> {item.qty}</div>
      <div style={{ margin: "8px 0" }}><b>Price/Night:</b> {item.pricePerNight}</div>
      <div style={{ margin: "8px 0" }}><b>Nights:</b> {item.nights}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/bookingrooms/${bookingPk}/${roomPk}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/bookingrooms")}>목록</button>
      </div>
    </div>
  );
};

export default BookingRoomDetail;
