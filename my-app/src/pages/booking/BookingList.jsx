import { useEffect, useState } from "react";
import { cancelBooking, getAllBookings } from "../../api/bookingAPI";

export default function BookingList(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings({ sort: "createAt,desc "});
      setRows(res?.content ?? res ?? []);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    } 
  };

  useEffect(() => { load(); }, []);

  const onCancel = async (id) => {
    if (!window.confirm("이 예약을 취소하겠습니까 ?"))
      return;

    try {
      await cancelBooking(id, "사용자 요청");
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>불러오는 중 . . . </div>;
  if (!rows.length) return <div>예약이 없습니다. </div>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>숙소</th>
          <th>체크인~채크아웃</th>
          <th>상태</th>
          <th>액션</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr key={b.id}>
            <td>#{b.id}</td>
            <td><Link to={`/booking/${b.id}`}>{b.propertyName ?? b.propertyId}</Link></td>
            <td>{b.status}</td>
            <td>
              <Link to={`/booking/${b.id}/edit`}>수정</Link>{" "}
              <button onClick={() => onCancel(b.id)}>취소</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

}