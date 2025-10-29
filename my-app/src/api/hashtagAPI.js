import axios from "axios";
import { HASHTAG_ENDPOINTS, axiosConfig } from "../config"; 

// axios 인스턴스 생성
const api = axios.create(axiosConfig);

// 모든 해시태그 조회 (GET /hashtags)
export const getAllHashtags = async () => {
    try {
        const response = await api.get(HASHTAG_ENDPOINTS.HASHTAGS.LIST);
        return response.data;
    } catch (error) {
        console.error("해시태그 리스트 조회 오류:", error);
        throw error;
    }
};

// 단일 해시태그 조회 (GET /hashtags/{id})
export const getHashtag = async (id) => {
    try {
        const response = await api.get(HASHTAG_ENDPOINTS.HASHTAGS.GET(id));
        return response.data;
    } catch (error) {
        console.error(`해시태그 ${id} 조회 오류:`, error);
        throw error;
    }
};

// 해시태그 생성 (POST /hashtags)
export const createHashtag = async (hashtagData) => {
    try {
        const response = await api.post(HASHTAG_ENDPOINTS.HASHTAGS.ADD, hashtagData);
        return response.data;
    } catch (error) {
        console.error("해시태그 생성 오류:", error);
        throw error;
    }
};

// 해시태그 수정 (PUT /hashtags/{id})
export const updateHashtag = async (id, hashtagData) => {
    try {
        const response = await api.put(HASHTAG_ENDPOINTS.HASHTAGS.MODIFY(id), hashtagData);
        return response.data;
    } catch (error) {
        console.error(`해시태그 ${id} 수정 오류:`, error);
        throw error;
    }
};

// 해시태그 삭제 (DELETE /hashtags/{id})
export const deleteHashtag = async (id) => {
    try {
        const response = await api.delete(HASHTAG_ENDPOINTS.HASHTAGS.DELETE(id));
        return response.data;
    } catch (error) {
        console.error(`해시태그 ${id} 삭제 오류:`, error);
        throw error;
    }
};