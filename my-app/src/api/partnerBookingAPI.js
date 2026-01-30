// src/api/partnerBookingAPI.js
import axios from "axios";
import { axiosConfig, PARTNER_BOOKING_ENDPOINTS } from "../config";

const client = axios.create(axiosConfig);

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
      params: {
        lastId,
        status,
        size,
      },
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
