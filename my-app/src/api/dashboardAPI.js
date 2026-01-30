// src/api/dashboardAPI.js
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
 * ✅ 파트너 전체 대시보드
 * GET /partners/{partnerId}/dashboard?date=YYYY-MM-DD
 */
export async function getPartnerDashboard(partnerId, date) {
  const res = await client.get(PARTNER_BOOKING_ENDPOINTS.DASHBOARD(partnerId), {
    params: { date },
  });
  return res.data;
}

/**
 * ✅ 숙소(단일) 대시보드
 * GET /partners/{partnerId}/dashboard/accommodations/{accommodationId}?date=YYYY-MM-DD
 */
export async function getPartnerDashboardByAccommodation(partnerId, accommodationId, date) {
  const res = await client.get(
    PARTNER_BOOKING_ENDPOINTS.DASHBOARD_BY_ACCOMMODATION(partnerId, accommodationId),
    { params: { date } }
  );
  return res.data;
}
