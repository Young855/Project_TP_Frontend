import axios from "axios";
import { 
    USER_ENDPOINTS, 
    BOOKING_ENDPOINTS, 
    ROOM_ENDPOINTS, 
    PROPERTIES_ENDPOINTS, 
    AMENITIES_ENDPOINTS, 
    ITINERARY_ENDPOINTS,
    ITINERARY_ITEM_ENDPOINTS,
    HASHTAG_ENDPOINTS,
    FAVORITE_ENDPOINTS,
    BOOKINGROOM_ENDPOINTS,
    axiosConfig // 공통 설정 객체
} from "../config"; // config 파일 경로를 맞춰주세요.

// axios 인스턴스 생성
const api = axios.create(axiosConfig);

// 모든 일정 항목 조회 (GET /itinerary-items)
export const getAllItineraryItems = async () => {
    try {
        const response = await api.get(ITINERARY_ITEM_ENDPOINTS.ITINERARY_ITEMS.LIST);
        return response.data;
    } catch (error) {
        console.error("일정 항목 리스트 조회 오류:", error);
        throw error;
    }
};

// 단일 일정 항목 조회 (GET /itinerary-items/{id})
export const getItineraryItem = async (id) => {
    try {
        const response = await api.get(ITINERARY_ITEM_ENDPOINTS.ITINERARY_ITEMS.GET(id));
        return response.data;
    } catch (error) {
        console.error(`일정 항목 ${id} 조회 오류:`, error);
        throw error;
    }
};

// 일정 항목 생성 (POST /itinerary-items)
export const createItineraryItem = async (itemData) => {
    try {
        const response = await api.post(ITINERARY_ITEM_ENDPOINTS.ITINERARY_ITEMS.ADD, itemData);
        return response.data;
    } catch (error) {
        console.error("일정 항목 생성 오류:", error);
        throw error;
    }
};

// 일정 항목 수정 (PUT /itinerary-items/{id})
export const updateItineraryItem = async (id, itemData) => {
    try {
        const response = await api.put(ITINERARY_ITEM_ENDPOINTS.ITINERARY_ITEMS.MODIFY(id), itemData);
        return response.data;
    } catch (error) {
        console.error(`일정 항목 ${id} 수정 오류:`, error);
        throw error;
    }
};

// 일정 항목 삭제 (DELETE /itinerary-items/{id})
export const deleteItineraryItem = async (id) => {
    try {
        const response = await api.delete(ITINERARY_ITEM_ENDPOINTS.ITINERARY_ITEMS.DELETE(id));
        return response.data;
    } catch (error) {
        console.error(`일정 항목 ${id} 삭제 오류:`, error);
        throw error;
    }
};