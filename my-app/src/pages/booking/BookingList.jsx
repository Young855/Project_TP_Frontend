import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, getAllBookings } from "../../api/bookingAPI";

export default function BookingList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorShown, setErrorShown] = useState(false); // 이름 통일

  const load = async () => {
    setLoading(true);
    try {
      // createdAt 기준 내림차순 정렬이라고 가정
      const res = await getAllBookings({ sort: "createdAt,desc" });
      setRows(res?.content ?? res ?? []);
    } catch (err) {
      if (!errorShown) {
        alert(err.message || "예약 목록을 불러오는 중 오류가 발생했습니다.");
        setErrorShown(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async (id) => {
    if (!window.confirm("이 예약을 취소하겠습니까?")) return;

    try {
      await cancelBooking(id, "사용자 요청");
      await load();
    } catch (err) {
      alert(err.message || "예약 취소 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <p>예약 목록을 불러오는 중...</p>;
  }

  if (!loading && rows.length === 0) {
    return <p>예약 내역이 없습니다.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>숙소</th>
          <th>체크인 - 체크아웃</th>
          <th>상태</th>
          <th>액션</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id}>
            <td>#{b.id}</td>
            <td>
              {/* 라우트는 /bookings/... 로 수정 */}
              <Link to={`/bookings/${b.id}`}>
                {b.propertyName ?? b.propertyId}
              </Link>
            </td>
            <td>
              {/* 필드명은 너 백엔드 DTO에 맞게 바꿔 */}
              {b.checkIn ?? b.checkInDate ?? b.checkinDate} ~{" "}
              {b.checkOut ?? b.checkOutDate ?? b.checkoutDate}
            </td>
            <td>{b.status}</td>
            <td>
              <Link to={`/bookings/${b.id}/edit`}>수정</Link>{" "}
              <button onClick={() => onCancel(b.id)}>취소</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
