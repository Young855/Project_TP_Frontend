import api from "./AxiosInstance"; 
import { USER_PREFERENCE_ENDPOINTS } from "../config";

/**
 * 유저 취향 정보 조회
 * @param {number|string} userId 
 */
export const getUserPreference = async (userId) => {
  try {
    const response = await api.get(USER_PREFERENCE_ENDPOINTS.GET(userId));
    return response.data;
  } catch (error) {
    console.error(`유저 ${userId} 취향 조회 오류:`, error);
    throw error;
  }
};

/**
 * 유저 취향 정보 저장 및 수정 (PUT)
 * @param {number|string} userId 
 * @param {object} preferenceData 
 * Data 구조: { preferenceText, accommodationType, minBudget, maxBudget, preferredStayNights }
 */
export const saveUserPreference = async (userId, preferenceData) => {
  try {
    // 백엔드 컨트롤러가 ResponseEntity<String>을 반환하므로 response.data는 성공 메시지 문자열
    const response = await api.post(USER_PREFERENCE_ENDPOINTS.SAVE(userId), preferenceData);
    return response.data;
  } catch (error) {
    console.error(`유저 ${userId} 취향 저장 오류:`, error);
    throw error;
  }
};