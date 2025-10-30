import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 프로젝트 구조에 맞게 경로 조정
import { getAllBookingRooms, deleteBookingRoom } from "../../api/bookingRoomAPI";

/**
 * 예약-객실 매핑 목록
 * - GET 전체 목록
 * - 상세/수정 이동 및 삭제
 */
const BookingRoomList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllBookingRooms();
      // 배열 또는 {content: []} 모두 대응
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("예약-객실 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (bookingId, roomId) => {
    if (!window.confirm(`정말 삭제하시겠습니까?\n[bookingId=${bookingId}, roomId=${roomId}]`)) return;
    try {
      await deleteBookingRoom(bookingId, roomId);
      await load();
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>예약-객실 매핑 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/bookingrooms/create")}>+ 새 매핑 추가</button>
      </div>

      {items.length === 0 ? (
        <div>데이터가 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Room ID</th>
              <th>Qty</th>
              <th>Price/Night</th>
              <th>Nights</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((br, idx) => {
              const bookingId = br.booking?.bookingId ?? br.bookingId;
              const roomId = br.room?.roomId ?? br.roomId;
              return (
                <tr key={`${bookingId}-${roomId}-${idx}`}>
                  <td>{bookingId}</td>
                  <td>{roomId}</td>
                  <td>{br.qty}</td>
                  <td>{br.pricePerNight}</td>
                  <td>{br.nights}</td>
                  <td>
                    <button onClick={() => navigate(`/bookingrooms/${bookingId}/${roomId}`)}>상세</button>{" "}
                    <button onClick={() => navigate(`/bookingrooms/${bookingId}/${roomId}/edit`)}>수정</button>{" "}
                    <button onClick={() => onDelete(bookingId, roomId)}>삭제</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingRoomList;
