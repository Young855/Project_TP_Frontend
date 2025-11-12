// ItineraryAPI.js
import axios from "axios";
import { ITINERARY_ENDPOINTS, axiosConfig } from "../config";

const api = axios.create(axiosConfig);

// 공통 에러 메시지 추출기
const pickError = (error) => {
  if (error?.response?.data) {
    const d = error.response.data;
    // GlobalExceptionHandler 형태와 일반 문자열 모두 대응
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.errors) return JSON.stringify(d.errors);
  }
  return error?.message || "요청 처리 중 오류가 발생했습니다.";
};

/**
 * 목록 조회 (필터 지원)
 * GET /api/itineraries
 * @param {{ userId?: number, from?: string, to?: string }} params
 *  - from/to는 'YYYY-MM-DD' 문자열 권장
 */
export const getItineraries = async (params = {}) => {
  try {
    const res = await api.get(ITINERARY_ENDPOINTS.ITINERARIES.LIST, { params });
    return res.data;
  } catch (error) {
    console.error("여행 일정 목록 조회 오류:", error);
    throw new Error(pickError(error));
  }
};

// (호환용) 전체 조회: 내부적으로 필터 없는 getItineraries 호출
export const getAllItineraries = async () => getItineraries();

/**
 * 단건 조회
 * GET /api/itineraries/{id}
 */
export const getItinerary = async (id) => {
  try {
    const res = await api.get(ITINERARY_ENDPOINTS.ITINERARIES.GET(id));
    return res.data;
  } catch (error) {
    console.error(`여행 일정 ${id} 조회 오류:`, error);
    throw new Error(pickError(error));
  }
};

/**
 * 생성
 * POST /api/itineraries
 * @param {object} itineraryData - ItineraryCreateDTO 형태
 */
export const createItinerary = async (itineraryData) => {
  try {
    const res = await api.post(ITINERARY_ENDPOINTS.ITINERARIES.ADD, itineraryData);
    return res.data; // 컨트롤러가 생성된 DTO 반환
  } catch (error) {
    console.error("여행 일정 생성 오류:", error);
    throw new Error(pickError(error));
  }
};

/**
 * 전체 수정 (치환)
 * PUT /api/itineraries/{id}
 * @param {object} itineraryData - ItineraryUpdateDTO
 */
export const updateItinerary = async (id, itineraryData) => {
  try {
    const res = await api.put(ITINERARY_ENDPOINTS.ITINERARIES.MODIFY(id), itineraryData);
    return res.data;
  } catch (error) {
    console.error(`여행 일정 ${id} 수정 오류:`, error);
    throw new Error(pickError(error));
  }
};

/**
 * 부분 수정 (null/undefined 아닌 필드만 서비스에서 반영)
 * PATCH /api/itineraries/{id}
 * @param {object} partialData - ItineraryUpdateDTO(부분)
 */
export const patchItinerary = async (id, partialData) => {
  try {
    const res = await api.patch(ITINERARY_ENDPOINTS.ITINERARIES.PATCH(id), partialData);
    return res.data;
  } catch (error) {
    console.error(`여행 일정 ${id} 부분 수정 오류:`, error);
    throw new Error(pickError(error));
  }
};

/**
 * 삭제
 * DELETE /api/itineraries/{id}
 */
export const deleteItinerary = async (id) => {
  try {
    const res = await api.delete(ITINERARY_ENDPOINTS.ITINERARIES.DELETE(id));
    return res.data; // 컨트롤러는 204 No Content면 res.data가 undefined일 수 있음
  } catch (error) {
    console.error(`여행 일정 ${id} 삭제 오류:`, error);
    throw new Error(pickError(error));
  }
};
