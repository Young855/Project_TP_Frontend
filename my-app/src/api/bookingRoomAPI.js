import axios from "axios";
import { 
    BOOKINGROOM_ENDPOINTS,
    axiosConfig // 공통 설정 객체
} from "../config"; // config 파일 경로를 맞춰주세요.

// axios 인스턴스 생성 (withCredentials: true 및 baseURL 적용)
const api = axios.create(axiosConfig);

// ... (위의 공통 설정 import)

// 모든 예약-객실 매핑 조회
export const getAllBookingRooms = async () => {
  try {
    const response = await api.get(BOOKINGROOM_ENDPOINTS.BOOKINGROOM.LIST);
    return response.data;
  } catch (error) {
    console.error("예약-객실 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 예약-객실 매핑 조회 (GET /bookingrooms/{bookingId}/{roomId})
export const getBookingRoom = async (bookingId, roomId) => {
  try {
    const response = await api.get(BOOKINGROOM_ENDPOINTS.BOOKINGROOM.GET(bookingId, roomId));
    return response.data;
  } catch (error) {
    console.error(`예약-객실 [${bookingId}, ${roomId}] 조회 오류:`, error);
    throw error;
  }
};

// 예약-객실 매핑 생성
export const createBookingRoom = async (bookingRoomData) => {
  try {
    const response = await api.post(BOOKINGROOM_ENDPOINTS.BOOKINGROOM.ADD, bookingRoomData);
    return response.data;
  } catch (error) {
    console.error("예약-객실 생성 오류:", error);
    throw error;
  }
};

// 예약-객실 매핑 수정 (PUT /bookingrooms/{bookingId}/{roomId})
export const updateBookingRoom = async (bookingId, roomId, bookingRoomData) => {
  try {
    const response = await api.put(BOOKINGROOM_ENDPOINTS.BOOKINGROOM.MODIFY(bookingId, roomId), bookingRoomData);
    return response.data;
  } catch (error) {
    console.error(`예약-객실 [${bookingId}, ${roomId}] 수정 오류:`, error);
    throw error;
  }
};

// 예약-객실 매핑 삭제 (DELETE /bookingrooms/{bookingId}/{roomId})
export const deleteBookingRoom = async (bookingId, roomId) => {
  try {
    const response = await api.delete(BOOKINGROOM_ENDPOINTS.BOOKINGROOM.DELETE(bookingId, roomId));
    return response.data;
  } catch (error) {
    console.error(`예약-객실 [${bookingId}, ${roomId}] 삭제 오류:`, error);
    throw error;
  }
};