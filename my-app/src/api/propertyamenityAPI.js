import axios from "axios";
import { PROPERTY_AMENITY_ENDPOINTS, axiosConfig } from "../config";

const api = axios.create(axiosConfig);

export const updatePropertyAmenities = async (propertyId, amenityIdList) => {
  try {
    const response = await api.put(
      PROPERTY_AMENITY_ENDPOINTS.UPDATE_ALL_BY_PROPERTY(propertyId),
      amenityIdList // [1, 3, 5] 같은 배열 자체를 body로 전송
    );
    return response.data;
  } catch (error) {
    console.error(`숙소 ${propertyId}의 편의시설 업데이트 오류:`, error);
    throw error;
  }
};