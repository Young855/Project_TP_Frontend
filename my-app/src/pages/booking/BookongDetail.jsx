import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBooking, deleteBooking } from "../../api/bookingAPI";

/**
 * 예약 상세
 * - GET 단건 조회
 * - 수정 이동, 삭제
 */
const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getBooking(id);
      setItem(data);
    } catch (e) {
      console.error(e);
      setErrMsg("상세 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteBooking(id);
      navigate("/bookings");
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (errMsg) return <div style={{ color: "red" }}>{errMsg}</div>;
  if (!item) return <div>데이터가 없습니다.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>예약 상세</h1>

      <div style={{ margin: "8px 0" }}><b>ID:</b> {item.bookingId}</div>
      <div style={{ margin: "8px 0" }}>
        <b>User:</b> {item.user?.username || item.user?.email || item.user?.userId || "-"}
      </div>
      <div style={{ margin: "8px 0" }}><b>Status:</b> {item.status}</div>
      <div style={{ margin: "8px 0" }}><b>Payment:</b> {item.paymentStatus}</div>
      <div style={{ margin: "8px 0" }}><b>Check-in:</b> {item.checkinDate}</div>
      <div style={{ margin: "8px 0" }}><b>Check-out:</b> {item.checkoutDate}</div>
      <div style={{ margin: "8px 0" }}><b>Guests:</b> {item.guests}</div>
      <div style={{ margin: "8px 0" }}><b>Total Amount:</b> {item.totalAmount}</div>
      <div style={{ margin: "8px 0" }}><b>Created:</b> {item.createdAt}</div>
      <div style={{ margin: "8px 0" }}><b>Updated:</b> {item.updatedAt}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(`/bookings/${id}/edit`)}>수정</button>{" "}
        <button onClick={onDelete}>삭제</button>{" "}
        <button onClick={() => navigate("/bookings")}>목록</button>
      </div>
    </div>
  );
};

export default BookingDetail;
