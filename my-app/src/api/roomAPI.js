import axios from "axios";
import { 
    ROOM_ENDPOINTS, 
    axiosConfig
} from "../config";

const api = axios.create(axiosConfig);

// 1. 객실 생성 (POST /rooms)
export const createRoom = async (roomData) => {
  try {
    const response = await api.post(ROOM_ENDPOINTS.ROOMS.ADD, roomData);
    return response.data;
  } catch (error) {
    console.error("객실 생성 오류:", error);
    throw error;
  }
};

// 2. 특정 숙소의 모든 객실 조회 (GET /rooms/property/{propertyId})
export const getRoomsByProperty = async (propertyId) => {
  try {
    const response = await api.get(ROOM_ENDPOINTS.ROOMS.GET_BY_PROPERTY(propertyId));
    return response.data;
  } catch (error) {
    console.error("객실 목록 조회 오류:", error);
    throw error;
  }
};

// 3. 단일 객실 조회 (GET /rooms/{id})
export const getRoom = async (roomId) => {
  try {
    const response = await api.get(ROOM_ENDPOINTS.ROOMS.GET(roomId));
    return response.data;
  } catch (error) {
    console.error("객실 상세 조회 오류:", error);
    throw error;
  }
};

// 4. 객실 정보 수정 (PUT /rooms/{id})
export const updateRoom = async (roomId, roomData) => {
  try {
    const response = await api.put(ROOM_ENDPOINTS.ROOMS.MODIFY(roomId), roomData);
    return response.data;
  } catch (error) {
    console.error("객실 수정 오류:", error);
    throw error;
  }
};

// 5. 객실 삭제 (DELETE /rooms/{id})
export const deleteRoom = async (roomId) => {
  try {
    const response = await api.delete(ROOM_ENDPOINTS.ROOMS.DELETE(roomId));
    return response.data;
  } catch (error) {
    console.error("객실 삭제 오류:", error);
    throw error;
  }
};

// 6. 캘린더용 데이터 조회 (GET /rooms/calendar)
export const getRoomCalendarData = async (propertyId, startDate, endDate) => {
  try {
    const response = await api.get(ROOM_ENDPOINTS.ROOMS.CALENDAR, {
      params: { propertyId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error("캘린더 데이터 조회 오류:", error);
    throw error;
  }
};

// 7. 일별 정책 개별 수정 (PUT /rooms/policy)
export const updateDailyPolicy = async (policyData) => {
  try {
    const response = await api.put(ROOM_ENDPOINTS.ROOMS.POLICY, policyData);
    return response.data;
  } catch (error) {
    console.error("정책 수정 오류:", error);
    throw error;
  }
};