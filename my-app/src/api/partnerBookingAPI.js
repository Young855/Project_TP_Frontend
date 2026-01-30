// src/api/partnerBookingAPI.js
import axios from "axios";
import { axiosConfig, PARTNER_BOOKING_ENDPOINTS } from "../config";

// ✅ 기존 구조 유지: axios 인스턴스 생성
const client = axios.create(axiosConfig);

// ✅ Authorization 인터셉터 추가 (403 해결 핵심)
client.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ✅ 숙소별 예약관리 목록
 * GET /partners/{partnerId}/accommodations/{accommodationId}/bookings
 * params: lastId, status, size
 */
export async function getPartnerBookingsByAccommodation({
  partnerId,
  accommodationId,
  lastId = null,
  status = null,
  size = 20,
}) {
  const res = await client.get(
    PARTNER_BOOKING_ENDPOINTS.BOOKINGS.LIST_BY_ACCOMMODATION(partnerId, accommodationId),
    {
      params: { lastId, status, size },
    }
  );
  return res.data;
}

/**
 * ✅ 예약 확정
 * PUT /partners/{partnerId}/bookings/{bookingId}/confirm
 */
export async function confirmPartnerBooking({ partnerId, bookingId }) {
  const res = await client.put(
    PARTNER_BOOKING_ENDPOINTS.BOOKINGS.CONFIRM(partnerId, bookingId)
  );
  return res.data;
}
