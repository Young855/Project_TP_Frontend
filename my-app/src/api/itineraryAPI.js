import axios from "axios";
import { ITINERARY_ENDPOINTS, axiosConfig } from "../config";

const api = axios.create(axiosConfig);

// 모든 여행 일정 조회 (GET /itineraries)
export const getAllItineraries = async () => {
    try {
        const response = await api.get(ITINERARY_ENDPOINTS.ITINERARIES.LIST);
        return response.data;
    } catch (error) {
        console.error("여행 일정 리스트 조회 오류:", error);
        throw error;
    }
};

// 단일 여행 일정 조회 (GET /itineraries/{id})
export const getItinerary = async (id) => {
    try {
        const response = await api.get(ITINERARY_ENDPOINTS.ITINERARIES.GET(id));
        return response.data;
    } catch (error) {
        console.error(`여행 일정 ${id} 조회 오류:`, error);
        throw error;
    }
};

// 여행 일정 생성 (POST /itineraries)
export const createItinerary = async (itineraryData) => {
    try {
        const response = await api.post(ITINERARY_ENDPOINTS.ITINERARIES.ADD, itineraryData);
        return response.data;
    } catch (error) {
        console.error("여행 일정 생성 오류:", error);
        throw error;
    }
};

// 여행 일정 수정 (PUT /itineraries/{id})
export const updateItinerary = async (id, itineraryData) => {
    try {
        const response = await api.put(ITINERARY_ENDPOINTS.ITINERARIES.MODIFY(id), itineraryData);
        return response.data;
    } catch (error) {
        console.error(`여행 일정 ${id} 수정 오류:`, error);
        throw error;
    }
};

// 여행 일정 삭제 (DELETE /itineraries/{id})
export const deleteItinerary = async (id) => {
    try {
        const response = await api.delete(ITINERARY_ENDPOINTS.ITINERARIES.DELETE(id));
        return response.data;
    } catch (error) {
        console.error(`여행 일정 ${id} 삭제 오류:`, error);
        throw error;
    }
};