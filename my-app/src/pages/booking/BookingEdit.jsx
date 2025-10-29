import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBooking, updateBooking } from "../../api/bookingAPI";

/**
 * 예약 수정
 * - 기존 데이터 로드 후 수정
 */
const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"];

const BookingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!checkinDate) return "체크인 날짜를 선택하세요.";
    if (!checkoutDate) return "체크아웃 날짜를 선택하세요.";
    if (checkoutDate < checkinDate) return "체크아웃은 체크인 이후여야 합니다.";
    if (!Number.isFinite(Number(guests)) || Number(guests) <= 0) return "인원 수는 1 이상이어야 합니다.";
    if (!Number.isFinite(Number(totalAmount)) || Number(totalAmount) < 0) return "총 금액은 0 이상이어야 합니다.";
    return "";
  };

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getBooking(id);
      setStatus(data.status || "PENDING");
      setPaymentStatus(data.paymentStatus || "UNPAID");
      setCheckinDate(data.checkinDate || "");
      setCheckoutDate(data.checkoutDate || "");
      setGuests(data.guests ?? 1);
      setTotalAmount(data.totalAmount ?? 0);
    } catch (e) {
      console.error(e);
      setErrMsg("기존 예약 정보를 불러오지 못했습니다.");
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

      const body = {
        status,
        paymentStatus,
        checkinDate,
        checkoutDate,
        guests: Number(guests),
        totalAmount: Number(totalAmount),
      };

      await updateBooking(id, body);
      navigate(`/bookings/${id}`);
    } catch (e) {
      console.error(e);
      setErrMsg("예약 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>예약 수정</h1>
      {errMsg && <div style={{ color: "red", margin: "8px 0" }}>{errMsg}</div>}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>
            상태{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            결제 상태{" "}
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            체크인{" "}
            <input type="date" value={checkinDate} onChange={(e) => setCheckinDate(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            체크아웃{" "}
            <input type="date" value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            인원 수{" "}
            <input type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} required />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            총 금액{" "}
            <input type="number" min={0} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "수정 중..." : "수정"}</button>{" "}
          <button type="button" onClick={() => navigate(`/bookings/${id}`)}>상세</button>
        </div>
      </form>
    </div>
  );
};

export default BookingEdit;
