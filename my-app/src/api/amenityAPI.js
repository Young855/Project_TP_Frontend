import axios from "axios";
import { AMENITIES_ENDPOINTS, axiosConfig } from "../config";

const api = axios.create(axiosConfig);

// 모든 편의 시설 조회 (GET /amenities)
export const getAllAmenities = async () => {
  try {
    const response = await api.get(AMENITIES_ENDPOINTS.AMENITIES.LIST);
    return response.data;
  } catch (error) {
    console.error("편의 시설 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 편의 시설 조회 (GET /amenities/{id})
export const getAmenity = async (id) => {
  try {
    const response = await api.get(AMENITIES_ENDPOINTS.AMENITIES.GET(id));
    return response.data;
  } catch (error) {
    console.error(`편의 시설 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 편의 시설 생성 (POST /amenities)
export const createAmenity = async (amenityData) => {
  try {
    const response = await api.post(AMENITIES_ENDPOINTS.AMENITIES.ADD, amenityData);
    return response.data;
  } catch (error) {
    console.error("편의 시설 생성 오류:", error);
    throw error;
  }
};

// 편의 시설 수정 (PUT /amenities/{id})
export const updateAmenity = async (id, amenityData) => {
  try {
    const response = await api.put(AMENITIES_ENDPOINTS.AMENITIES.MODIFY(id), amenityData);
    return response.data;
  } catch (error) {
    console.error(`편의 시설 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 편의 시설 삭제 (DELETE /amenities/{id})
export const deleteAmenity = async (id) => {
  try {
    const response = await api.delete(AMENITIES_ENDPOINTS.AMENITIES.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`편의 시설 ${id} 삭제 오류:`, error);
    throw error;
  }
};