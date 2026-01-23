import axios from "axios";
import { RECOMMENDATION_ENDPOINTS } from "../config";

/**
 * AI 숙소 추천 요청
 * @param {string} city - 검색할 지역명
 * @param {string} preferences - 사용자 취향 텍스트
 * @returns {Promise<Array>} - 추천된 숙소 ID 리스트
 */
export const getAiRecommendations = async (city, preferences) => {
  try {
    const response = await axios.post(RECOMMENDATION_ENDPOINTS.RECOMMENDATION, {
      city: city,
      preferences: preferences
    });
    
    // FastAPI에서 리스트([1, 2, 3])를 바로 반환한다고 가정
    return response.data; 
  } catch (error) {
    console.error("AI 추천 API 오류:", error);
    throw error;
  }
};