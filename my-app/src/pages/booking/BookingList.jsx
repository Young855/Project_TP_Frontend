import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 경로는 프로젝트 구조에 맞게 수정
import { getAllBookings, deleteBooking } from "../../api/bookingAPI";

/**
 * 예약 목록
 * - GET 전체 목록
 * - 상세/수정 이동, 삭제
 */
const BookingList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getAllBookings();
      // 페이지네이션이 없다면 배열로 온다고 가정
      setItems(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      console.error(e);
      setErrMsg("예약 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteBooking(id);
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
      <h1>예약 목록</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}

      <div style={{ margin: "12px 0" }}>
        <button onClick={() => navigate("/bookings/create")}>+ 새 예약</button>
      </div>

      {items.length === 0 ? (
        <div>예약이 없습니다.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.bookingId}>
                <td>{b.bookingId}</td>
                <td>
                  {/* user가 객체라고 가정: user.username 또는 user.email 등*/}
                  {b.user?.username || b.user?.email || b.user?.userId || "-"}
                </td>
                <td>{b.status}</td>
                <td>{b.paymentStatus}</td>
                <td>{b.checkinDate}</td>
                <td>{b.checkoutDate}</td>
                <td>{b.guests}</td>
                <td>{b.totalAmount}</td>
                <td>
                  <button onClick={() => navigate(`/bookings/${b.bookingId}`)}>상세</button>{" "}
                  <button onClick={() => navigate(`/bookings/${b.bookingId}/edit`)}>수정</button>{" "}
                  <button onClick={() => onDelete(b.bookingId)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingList;
