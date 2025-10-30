import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../../api/bookingAPI";

/**
 * 예약 생성
 * - 필수값 및 간단 검증 포함
 * - user는 백엔드에서 인증 컨텍스트로 처리한다면 userId 입력 불필요
 *   (그렇지 않다면 userId 입력 필드로 보내야 함)
 */
const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"];

const BookingCreate = () => {
  const navigate = useNavigate();

  // user를 직접 입력하는지 여부(프로젝트 정책에 맞게)
  // 인증 사용자로 자동 주입이면 userId는 제거 가능
  const [userId, setUserId] = useState("");

  const [status, setStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);

  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!checkinDate) return "체크인 날짜를 선택하세요.";
    if (!checkoutDate) return "체크아웃 날짜를 선택하세요.";
    if (checkoutDate < checkinDate) return "체크아웃은 체크인 이후여야 합니다.";
    if (!Number.isFinite(Number(guests)) || Number(guests) <= 0) return "인원 수는 1 이상이어야 합니다.";
    if (!Number.isFinite(Number(totalAmount)) || Number(totalAmount) < 0) return "총 금액은 0 이상이어야 합니다.";
    // userId 정책에 따라
    // if (!userId.trim()) return "userId를 입력하세요.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      // 백엔드 DTO 형태에 맞게 매핑
      // user는 객체가 필요할 수 있음: { userId: Number(userId) }
      const body = {
        status,
        paymentStatus,
        checkinDate,
        checkoutDate,
        guests: Number(guests),
        totalAmount: Number(totalAmount),
        ...(userId ? { userId: Number(userId) } : {}), // 백엔드가 userId 바인딩을 받는 경우
      };

      const created = await createBooking(body);
      const newId = created?.bookingId;
      if (newId) navigate(`/bookings/${newId}`);
      else navigate("/bookings");
    } catch (e) {
      console.error(e);
      setErrMsg("예약 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>예약 생성</h1>
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

        {/* 정책에 따라 보여줄지 결정 */}
        <div style={{ marginBottom: 10 }}>
          <label>
            사용자 ID (옵션){" "}
            <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="백엔드 정책에 따라 필요" />
          </label>
        </div>

        <div>
          <button type="submit" disabled={submitting}>{submitting ? "생성 중..." : "생성"}</button>{" "}
          <button type="button" onClick={() => navigate("/bookings")}>목록</button>
        </div>
      </form>
    </div>
  );
};

export default BookingCreate;
