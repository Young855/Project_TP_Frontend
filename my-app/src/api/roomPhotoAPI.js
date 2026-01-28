import api from "./AxiosInstance"; 
import { ROOM_PHOTO_ENDPOINTS, axiosConfig } from "../config";


// 1. [저장] 객실 이미지 리스트 업로드
export const saveRoomPhotos = async (roomId, photosData) => {
    try {
        const response = await api.post(
            ROOM_PHOTO_ENDPOINTS.PHOTOS.ADD_LIST(roomId),
            photosData
        );
        return response.data; 
    } catch (error) {
        console.error(`객실 ${roomId} 이미지 저장 오류:`, error);
        throw error;
    }
};

// 2. [조회] 객실 이미지 목록 조회
export const getRoomPhotos = async (roomId) => {
    try {
        const response = await api.get(
            ROOM_PHOTO_ENDPOINTS.PHOTOS.GET_METADATA_LIST(roomId)
        );
        return response.data;
    } catch (error) {
        console.error(`객실 ${roomId} 이미지 조회 오류:`, error);
        throw error;
    }
};

// 3. [일괄 수정] 객실 이미지 정보 전체 업데이트 (이름, 대표설정, 순서 등)
export const updateRoomPhotoList = async (roomId, photoList) => {
    try {
        // PUT /partner/rooms/photos/{roomId}
        // config에 별도 상수가 없다면 직접 구성하거나, 위 config에 추가하여 사용
        const url = `/partner/rooms/photos/${roomId}`; 
        const response = await api.put(url, photoList);
        return response.data;
    } catch (error) {
        console.error(`객실 ${roomId} 이미지 수정 오류:`, error);
        throw error;
    }
};

// 4. [데이터] BLOB URL 획득 (img src용)
export const getRoomPhotoBlobUrl = (photoId) => {
    return ROOM_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(photoId);
}

// 5. [삭제] 객실 이미지 삭제
export const deleteRoomPhoto = async (photoId) => {
    try {
        const response = await api.delete(
            ROOM_PHOTO_ENDPOINTS.PHOTOS.DELETE(photoId)
        );
        return response.data;
    } catch (error) {
        console.error(`객실 이미지 ${photoId} 삭제 오류:`, error);
        throw error;
    }
};