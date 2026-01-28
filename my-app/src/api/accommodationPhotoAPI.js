import api from "./AxiosInstance"; 
import { ACCOMMODATION_PHOTO_ENDPOINTS } from "../config";



// 1. [저장] 이미지 리스트 업로드
export const saveAccommodationPhotos = async (accommodationId, photosData) => {
    try {
        const response = await api.post(
            ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.ADD_LIST(accommodationId),
            photosData
        );
        return response.data; 
    } catch (error) {
        console.error(`숙소 ${accommodationId} 이미지 저장 오류:`, error);
        throw error;
    }
};

// 2. [조회] 이미지 목록 조회
export const getAccommodationPhotos = async (accommodationId) => {
    try {
        const response = await api.get(
            ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_METADATA_LIST(accommodationId)
        );
        return response.data;
    } catch (error) {
        console.error(`숙소 ${accommodationId} 이미지 조회 오류:`, error);
        throw error;
    }
};

// 3. [일괄 수정] 이미지 정보 전체 업데이트 (이름, 대표설정 등) - [추가됨]
export const updateAccommodationPhotoList = async (accommodationId, photoList) => {
    try {
        // PUT /partner/accommodations/photos/{accommodationId}
        const url = `/partner/accommodations/photos/${accommodationId}`;
        const response = await api.put(url, photoList);
        return response.data;
    } catch (error) {
        console.error(`숙소 ${accommodationId} 이미지 수정 오류:`, error);
        throw error;
    }
};

// 4. [데이터] BLOB URL 획득 (img src용)
export const getAccommodationPhotoBlobUrl = (photoId) => {
    return ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(photoId);
}

// 5. [삭제] 이미지 삭제
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