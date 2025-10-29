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

// axios 인스턴스 생성 (withCredentials: true 및 baseURL 적용)
const api = axios.create(axiosConfig);

// ... (위의 공통 설정 import)

// 모든 예약 조회
export const getAllBookings = async () => {
  try {
    const response = await api.get(BOOKING_ENDPOINTS.BOOKINGS.LIST);
    return response.data;
  } catch (error) {
    console.error("예약 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 예약 조회
export const getBooking = async (id) => {
  try {
    const response = await api.get(BOOKING_ENDPOINTS.BOOKINGS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`예약 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 유저별 예약 조회 (GET /bookings/user/{userId})
export const getBookingsByUserId = async (userId) => {
    try {
        const response = await api.get(BOOKING_ENDPOINTS.BOOKINGS.GET_BY_USER(userId));
        return response.data;
    } catch (error) {
        console.error(`유저 ${userId}의 예약 리스트 조회 오류:`, error);
        throw error;
    }
};

// 예약 생성
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post(BOOKING_ENDPOINTS.BOOKINGS.ADD, bookingData);
    return response.data;
  } catch (error) {
    console.error("예약 생성 오류:", error);
    throw error;
  }
};

// 예약 수정
export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(BOOKING_ENDPOINTS.BOOKINGS.MODIFY(id), bookingData);
    return response.data;
  } catch (error) {
    console.error(`예약 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 예약 삭제
export const deleteBooking = async (id) => {
  try {
    const response = await api.delete(BOOKING_ENDPOINTS.BOOKINGS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`예약 ${id} 삭제 오류:`, error);
    throw error;
  }
};