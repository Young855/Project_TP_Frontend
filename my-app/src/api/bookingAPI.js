// src/api/bookingAPI.js
import axios from "axios";
import { axiosConfig } from "../config"; // withCredentials, baseURL 등 공통설정

const api = axios.create(axiosConfig);

/** 예약 생성 (POST /bookings)
 */
export async function createBooking(data) {
  const res = await api.post("/bookings", data);
  return res.data; // 1
}

/** 유저별 예약 목록 (GET /bookings?userId=...)
 */
export async function getBookingsByUserId(userId) {
  const res = await api.get("/bookings", { params: { userId } });
  return res.data;
}

// 예약 단건 조회 (GET /bookings/{id}?userId=...)

 
export async function getBooking(bookingId, userId) {
  const res = await api.get(`/bookings/${bookingId}`, { params: { userId } });
  return res.data;
}

// 예약 취소 (POST /bookings/{id}/cancel?userId=...)

export async function cancelBooking(bookingId, userId) {
  const res = await api.post(`/bookings/${bookingId}/cancel`, null, {
    params: { userId },
  });
  return res.status === 204;
}

/* ========================
 * 아직 백엔드에 없는 엔드포인트
 * (호출 시 즉시 에러 던져서 사용 실수 방지)
 * ======================== */
export async function getAllBookings() {
  throw new Error("전체 목록 확인 불가");
}
export async function updateBooking() {
  throw new Error("수정 불가");
}
export async function deleteBooking() {
  throw new Error("삭제 불가");
}
