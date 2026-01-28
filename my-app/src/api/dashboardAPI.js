// /mnt/data/dashboardAPI.js
import axios from "axios";
import { axiosConfig, PARTNER_BOOKING_ENDPOINTS } from "../config";

const client = axios.create(axiosConfig);

export async function getPartnerDashboard(partnerId, date) {
  const res = await client.get(PARTNER_BOOKING_ENDPOINTS.DASHBOARD(partnerId), {
    params: { date },
  });
  return res.data;
}

export async function getPartnerDashboardByAccommodation(partnerId, accommodationId, date) {
  const res = await client.get(
    PARTNER_BOOKING_ENDPOINTS.DASHBOARD_BY_ACCOMMODATION(partnerId, accommodationId),
    { params: { date } }
  );
  return res.data;
}