import axios from "axios";
import { RECOMMENDATION_ENDPOINTS } from "../config";

/**
 * AI 숙소 추천 요청
 * @param {string} city - 검색할 지역명
 * @param {string} preferences - 사용자 취향 텍스트
 * @param {object} options - 추가 옵션 { accommodationType, minPrice, maxPrice }
 */
export const getAiRecommendations = async (city, preferences, options = {}) => {
  try {
    // 3. 파라미터 구조 확장
    const payload = {
      city: city,
      preferences: preferences,
      accommodation_type: options.accommodationType || null, // 숙소 타입 (없으면 null)
      min_price: options.minPrice || 0,
      max_price: options.maxPrice || 0
    };

    console.log("Python 서버로 전송할 데이터:", payload); // 디버깅용 로그

    const response = await axios.post(RECOMMENDATION_ENDPOINTS.RECOMMENDATION, payload);
    return response.data; 
  } catch (error) {
    console.error("AI 추천 API 오류:", error);
    throw error;
  }
};