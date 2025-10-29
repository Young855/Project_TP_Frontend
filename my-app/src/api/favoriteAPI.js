import axios from "axios";
import { FAVORITE_ENDPOINTS, axiosConfig } from "../config"; 

// axios 인스턴스 생성
const api = axios.create(axiosConfig);

// 모든 즐겨찾기 조회 (GET /favorites)
export const getAllFavorites = async () => {
    try {
        const response = await api.get(FAVORITE_ENDPOINTS.FAVORITES.LIST);
        return response.data;
    } catch (error) {
        console.error("즐겨찾기 리스트 조회 오류:", error);
        throw error;
    }
};

// 단일 즐겨찾기 조회 (GET /favorites/{id})
export const getFavorite = async (id) => {
    try {
        const response = await api.get(FAVORITE_ENDPOINTS.FAVORITES.GET(id));
        return response.data;
    } catch (error) {
        console.error(`즐겨찾기 ${id} 조회 오류:`, error);
        throw error;
    }
};

// 즐겨찾기 생성 (POST /favorites)
export const createFavorite = async (favoriteData) => {
    try {
        const response = await api.post(FAVORITE_ENDPOINTS.FAVORITES.ADD, favoriteData);
        return response.data;
    } catch (error) {
        console.error("즐겨찾기 생성 오류:", error);
        throw error;
    }
};

// 즐겨찾기 삭제 (DELETE /favorites/{id})
export const deleteFavorite = async (id) => {
    try {
        const response = await api.delete(FAVORITE_ENDPOINTS.FAVORITES.DELETE(id));
        return response.data;
    } catch (error) {
        console.error(`즐겨찾기 ${id} 삭제 오류:`, error);
        throw error;
    }
};

// 참고: FavoriteController.java 파일에 PUT/UPDATE 엔드포인트가 없으므로 updateFavorite 함수는 정의하지 않습니다.