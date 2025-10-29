import axios from "axios";
import { PROPERTIES_ENDPOINTS, axiosConfig } from "../config";

const api = axios.create(axiosConfig);

// 모든 숙소 조회 (GET /properties)
export const getAllProperties = async () => {
  try {
    const response = await api.get(PROPERTIES_ENDPOINTS.PROPERTIES.LIST);
    return response.data;
  } catch (error) {
    console.error("숙소 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 숙소 조회 (GET /properties/{id})
export const getProperty = async (id) => {
  try {
    const response = await api.get(PROPERTIES_ENDPOINTS.PROPERTIES.GET(id));
    return response.data;
  } catch (error) {
    console.error(`숙소 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 숙소 생성 (POST /properties)
export const createProperty = async (propertyData) => {
  try {
    const response = await api.post(PROPERTIES_ENDPOINTS.PROPERTIES.ADD, propertyData);
    return response.data;
  } catch (error) {
    console.error("숙소 생성 오류:", error);
    throw error;
  }
};

// 숙소 수정 (PUT /properties/{id})
export const updateProperty = async (id, propertyData) => {
  try {
    const response = await api.put(PROPERTIES_ENDPOINTS.PROPERTIES.MODIFY(id), propertyData);
    return response.data;
  } catch (error) {
    console.error(`숙소 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 숙소 삭제 (DELETE /properties/{id})
export const deleteProperty = async (id) => {
  try {
    const response = await api.delete(PROPERTIES_ENDPOINTS.PROPERTIES.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`숙소 ${id} 삭제 오류:`, error);
    throw error;
  }
};