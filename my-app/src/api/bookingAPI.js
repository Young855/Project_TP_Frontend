// src/api/bookingAPI.js
import axios from "axios";
import { axiosConfig, BOOKING_ENDPOINTS } from "../config";

const api = axios.create(axiosConfig);

/**
 * 예약 페이지 로딩 (GET /bookings/prepare)
 * - token 있으면 token으로 복구
 * - token 없으면 roomId/checkinDate/checkoutDate로 임시 token 생성(백엔드가)
 */
export const prepareBooking = async ({ token, roomId, checkinDate, checkoutDate }) => {
  const params = new URLSearchParams();
  if (token) params.set("token", token);
  if (roomId) params.set("roomId", String(roomId));
  if (checkinDate) params.set("checkinDate", checkinDate);
  if (checkoutDate) params.set("checkoutDate", checkoutDate);

  const res = await api.get(`${BOOKING_ENDPOINTS.BOOKINGS.PREPARE}?${params.toString()}`);
  return res.data;
};

/**
 * 예약 확정 (POST /bookings)
 * - token + form 입력값으로 booking 저장
 */
export const createBookingFromToken = async (payload) => {
  const res = await api.post(BOOKING_ENDPOINTS.BOOKINGS.ADD, payload);
  return res.data;
};

// /** 예약 목록 조회 (GET /bookings) */
// export const getAllBookings = async (params) => {
//   const res = await api.get(BOOKING_ENDPOINTS.BOOKINGS.LIST, { params });
//   return res.data;
// };

/** 예약 단건 조회 (GET /bookings/{id}) */
export const getBooking = async (id) => {
  const res = await api.get(BOOKING_ENDPOINTS.BOOKINGS.GET(id));
  return res.data;
};

/** 예약 수정 (PUT /bookings/{id}) */
export const updateBooking = async (id, bookingData) => {
  const res = await api.put(BOOKING_ENDPOINTS.BOOKINGS.MODIFY(id), bookingData);
  return res.data;
};

/** 예약자 정보 저장 (PUT /bookings/{id}/booker) */
export const updateBookerInfo = async (id, bookerInfo) => {
  const res = await api.put(BOOKING_ENDPOINTS.BOOKINGS.UPDATE_BOOKER(id), bookerInfo);
  return res.data;
};

/** 결제 확정 (POST /bookings/{id}/payment/confirm) */
export const confirmPayment = async (id, paymentData) => {
  const res = await api.post(BOOKING_ENDPOINTS.BOOKINGS.CONFIRM_PAYMENT(id), paymentData);
  return res.data;
};

// 변경
// 유저별 예약 조회 (GET /bookings/user/{userId})
export const getBookingByUserId = async (userId) => {
  if (!userId) throw new Error("userId가 없습니다.");

  // 여기서 /bookings/list 같은거 쓰면 안됨!
  const url = BOOKING_ENDPOINTS.BOOKINGS.GET_BY_USER(userId);
  const res = await api.get(url);
  return res.data;
};

/** 변경
 * 예약 취소 (DELETE /bookings/{bookingId}/cancel?userId=1)
 * userId를 query param으로 보냄22
 */
export const cancelBooking = async (bookingId, userId) => {
  if (!bookingId) throw new Error("bookingId가 필요합니다. ");
  if (!userId) throw new Error("userId가 필요합니다. ");
  
  // axios params 사용 (자동으로 ?userId= 붙는다)
  const url = `${BOOKING_ENDPOINTS.BOOKINGS.GET(bookingId)}/cancel`;
  const res = await api.delete(url, { params: { userId } });

  return res.data;
}


/**
 * 예약 페이지: 이메일 인증코드 발송 (POST /user/send-verification)
 * - 백엔드 EmailService 그대로 사용
 */
export const sendBookingVerificationEmail = async (email) => {
  try {
    await api.post(BOOKING_ENDPOINTS.BOOKINGS.SEND_EMAIL_VERIFICATION, { email });
    return true;
  } catch (error) {
    console.error("예약 이메일 인증메일 발송 오류:", error);
    throw error;
  }
};

/**
 * 예약 페이지: 이메일 인증코드 검증 (POST /user/verify-code)
 * - 응답: { verified: boolean }
 */
export const verifyBookingEmailCode = async (email, code) => {
  try {
    const response = await api.post(BOOKING_ENDPOINTS.BOOKINGS.VERIFY_EMAIL_CODE, { email, code });
    return response.data; // { verified: true/false }
  } catch (error) {
    console.error("예약 이메일 인증코드 확인 오류:", error);
    throw error;
  }
};
