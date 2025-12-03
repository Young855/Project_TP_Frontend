import axios from "axios";
import { ACCOMMODATION_PHOTO_ENDPOINTS, axiosConfig } from "../config";

const api = axios.create(axiosConfig);

// 🌟 이미지 리스트 저장
export const saveAccommodationPhotos = async (accommodationId, photosData) => {
    try {
        const response = await api.post(
            ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.ADD_LIST(accommodationId),
            photosData
        );
        return response.data; // 생성된 Photo ID 리스트 반환
    } catch (error) {
        console.error(`숙소 ${accommodationId} 이미지 저장 오류:`, error);
        throw error;
    }
};

// 🌟 이미지 메타데이터 목록 조회
export const getAccommodationPhotoMetadataList = async (accommodationId) => {
    try {
        const response = await api.get(
            ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_METADATA_LIST(accommodationId)
        );
        return response.data;
    } catch (error) {
        console.error(`숙소 ${accommodationId} 이미지 메타데이터 조회 오류:`, error);
        throw error;
    }
};

// 🌟 특정 이미지의 BLOB 데이터 URL 획득
export const getAccommodationPhotoBlobUrl = (photoId) => {
    return ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(photoId);
}

// 🌟 이미지 삭제
export const deleteAccommodationPhoto = async (photoId) => {
    try {
        const response = await api.delete(
            ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.DELETE(photoId)
        );
        return response.data;
    } catch (error) {
        console.error(`이미지 ${photoId} 삭제 오류:`, error);
        throw error;
    }
};