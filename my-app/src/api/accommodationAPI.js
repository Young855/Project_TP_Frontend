import axios from "axios";
import { ACCOMMODATIONS_ENDPOINTS, axiosConfig } from "../config";

const api = axios.create(axiosConfig);

// 모든 숙소 조회 (GET /accommodations)
export const getAllAccommodations = async () => {
  try {
    const response = await api.get(ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.LIST_ALL);
    return response.data;
  } catch (error) {
    console.error("숙소 리스트 조회 오류:", error);
    throw error;
  }
};

// 파트너별 단순 목록 조회
export const getAccommodationsByPartnerId = async (partnerId) => {
  try {
    const response = await api.get(
      ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.LIST_BY_PARTNER(partnerId)
    );
    return response.data;
  } catch (error) {
    console.error(`파트너 ${partnerId}의 숙소 목록 조회 오류:`, error);
    throw error;
  }
};

// 🌟 [핵심] 숙소 목록 조회 (이미지 통합 + 페이징 지원)
export const getAccommodationsByPartnerIdWithMainPhoto = async (partnerId, page = 0, size = 5) => {
  try {
    const response = await api.get(
      ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.LIST_BY_PARTNER_WITH_PHOTO(partnerId),
      {
        params: {
          page: page,
          size: size
        }
      }
    );
    return response.data; // Page<AccommodationDTO>
  } catch (error) {
    console.error(`파트너 ${partnerId}의 숙소 목록 조회 오류 (이미지 통합):`, error);
    throw error;
  }
};

// 단일 숙소 조회 (GET /accommodations/{id})
export const getAccommodation = async (id) => {
  try {
    const response = await api.get(ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`숙소 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 단일 숙소 상세 조회 (모든 이미지 포함)
export const getAccommodationWithAllPhotos = async (id) => {
    try {
      const response = await api.get(ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.GET_WITH_ALL_PHOTOS(id));
      return response.data;
    } catch (error) {
      console.error(`숙소 ${id} 상세 조회 오류 (이미지 통합):`, error);
      throw error;
    }
  };

// 숙소 생성 (POST /partner/accommodations)
export const createAccommodation = async (accommodationData) => {
  try {
    const response = await api.post(
      ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.ADD, 
      accommodationData
    );
    return response.data;
  } catch (error) {
    console.error("숙소 생성 오류:", error);
    throw error;
  }
};

// 숙소 수정 (PUT /partner/accommodations/{id})
export const updateAccommodation = async (id, accommodationData) => {
  try {
    const response = await api.put(
      ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.MODIFY(id), 
      accommodationData);
    return response.data;
  } catch (error) {
    console.error(`숙소 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 숙소 삭제 (DELETE /partner/accommodations/{id})
export const deleteAccommodation = async (id) => {
  try {
    const response = await api.delete(
      ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.DELETE(id)
    );
    return response.data;
  } catch (error) {
    console.error(`숙소 ${id} 삭제 오류:`, error);
    throw error;
  }
};