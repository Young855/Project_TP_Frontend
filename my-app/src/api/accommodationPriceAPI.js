import axios from "axios";
import { PRICE_ENDPOINTS, axiosConfig } from "../config";

/**
 * 여러 숙소의 총 숙박 비용을 한 번에 계산합니다.
 * * @param {number[]} accommodationIds - 숙소 ID 배열 (예: [1, 5, 12])
 * @param {string} checkIn - 체크인 날짜 (YYYY-MM-DD)
 * @param {string} checkOut - 체크아웃 날짜 (YYYY-MM-DD)
 * @returns {Promise<Array>} - [{ accommodationId: 1, totalPrice: 150000, isAvailable: true }, ...]
 */
export const calculateTotalPrices = async (accommodationIds, checkIn, checkOut) => {
  // 방어 코드: 필수 값이 없으면 빈 배열 리턴
  if (!accommodationIds || accommodationIds.length === 0) return [];
  if (!checkIn || !checkOut) return [];

  const requestBody = {
    accommodationIds,
    checkIn,
    checkOut
  };

  try {
    const response = await axios.post(
      PRICE_ENDPOINTS.CALCULATE, 
      requestBody, 
      axiosConfig
    );
    return response.data;
  } catch (error) {
    console.error("숙소 가격 계산 API 호출 실패:", error);
    // 에러가 나도 전체 페이지가 망가지지 않게 빈 배열 리턴하거나 throw
    throw error;
  }
};