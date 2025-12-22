import axios from "axios";
import { axiosConfig, DAILY_POLICY_ENDPOINTS } from "../config";

// DailyRoomPolicyController 매핑
//  - GET    /daily-policies/calendar?roomId=&startDate=&endDate=
//  - POST   /daily-policies
//  - PUT    /daily-policies
//  - PUT    /daily-policies/bulk
// ※ config에 DAILY_POLICY_ENDPOINTS가 없다면 fallbackPath를 사용합니다.

const api = axios.create(axiosConfig);

const fallbackPath = {
  CALENDAR: "/daily-policies/calendar",
  POLICY: "/daily-policies",
  BULK: "/daily-policies/bulk",
};

const paths = {
  CALENDAR: DAILY_POLICY_ENDPOINTS?.CALENDAR ?? fallbackPath.CALENDAR,
  POLICY: DAILY_POLICY_ENDPOINTS?.POLICY ?? fallbackPath.POLICY,
  BULK: DAILY_POLICY_ENDPOINTS?.BULK ?? fallbackPath.BULK,
};

/**
 * 1) 캘린더 조회
 * GET /daily-policies/calendar?roomId={id}&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * @returns {Promise<DailyRoomPolicyDTO[]>}
 */
export const getDailyPoliciesByRoomAndRange = async (roomId, startDate, endDate) => {
  try {
    const response = await api.get(paths.CALENDAR, {
      params: { roomId, startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error(
      `[DailyRoomPolicy] calendar fetch failed (roomId=${roomId}, ${startDate}~${endDate})`,
      error
    );
    throw error;
  }
};

/**
 * 2) 일일 정책 생성 (ADD)
 * POST /daily-policies
 * 서버는 updateDailyRoomPolicy(dto)로 처리하지만, 컨트롤러가 POST를 열어둔 상태
 */
export const createDailyRoomPolicy = async (policyDto) => {
  try {
    const response = await api.post(paths.POLICY, policyDto);
    return response.data;
  } catch (error) {
    console.error("[DailyRoomPolicy] create failed:", error);
    throw error;
  }
};

/**
 * 3) 일일 정책 수정 (단일 날짜)
 * PUT /daily-policies
 */
export const updateDailyRoomPolicy = async (policyDto) => {
  try {
    const response = await api.put(paths.POLICY, policyDto);
    return response.data;
  } catch (error) {
    console.error("[DailyRoomPolicy] update failed:", error);
    throw error;
  }
};

/**
 * 4) 기간 정책 일괄 수정
 * PUT /daily-policies/bulk
 */
export const updateBulkDailyRoomPolicy = async (bulkRequest) => {
  try {
    const response = await api.put(paths.BULK, bulkRequest);
    return response.data;
  } catch (error) {
    console.error("[DailyRoomPolicy] bulk update failed:", error);
    throw error;
  }
};

// 예약 가능 조건
// 1. 숙박해야 하는 박 수
// 2. 모든 날짜가 활성 + 재고 존재
export const evaluatePoliciesForStay = (
  policies,
  { mode = "MIN_PER_NIGHT", nightsRequired } = {}
) => {
  const list = Array.isArray(policies) ? policies : [];

  // ✅ 네 요구사항: "숙박해야 하는 모든 날짜"가 정책으로 존재해야 예약 가능
  const isBookable =
    typeof nightsRequired === "number" &&
    nightsRequired > 0 &&
    list.length === nightsRequired &&
    list.every((x) => (x?.isActive ?? true) === true && (x?.stock ?? 0) > 0);

  const prices = list
    .map((x) => x?.price)
    .filter((v) => typeof v === "number" && Number.isFinite(v));

  const firstPrice = prices.length > 0 ? prices[0] : null;
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const sumPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) : null;
  const avgPrice = prices.length > 0 ? Math.round(sumPrice / prices.length) : null;

  let displayPrice = null;
  switch (mode) {
    case "FIRST_NIGHT":
      displayPrice = firstPrice;
      break;
    case "TOTAL":
      displayPrice = sumPrice;
      break;
    case "AVG_PER_NIGHT":
      displayPrice = avgPrice;
      break;
    case "MIN_PER_NIGHT":
    default:
      displayPrice = minPrice;
      break;
  }

  return {
    isBookable,
    firstPrice,
    minPrice,
    avgPrice,
    sumPrice,
    displayPrice,
    nights: prices.length,
  };
};
