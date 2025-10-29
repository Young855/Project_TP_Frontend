import axios from "axios";
import { ROOM_ENDPOINTS, axiosConfig } from "../config"; 

const api = axios.create(axiosConfig);

// 모든 객실 조회 (GET /rooms)
export const getAllRooms = async () => {
  try {
    const response = await api.get(ROOM_ENDPOINTS.ROOMS.LIST);
    return response.data;
  } catch (error) {
    console.error("객실 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 객실 조회 (GET /rooms/{id})
export const getRoom = async (id) => {
  try {
    const response = await api.get(ROOM_ENDPOINTS.ROOMS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`객실 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 숙소별 객실 조회 (GET /rooms/property/{propertyId})
export const getRoomsByPropertyId = async (propertyId) => {
    try {
        const response = await api.get(ROOM_ENDPOINTS.ROOMS.GET_BY_PROPERTY(propertyId));
        return response.data;
    } catch (error) {
        console.error(`숙소 ${propertyId}의 객실 리스트 조회 오류:`, error);
        throw error;
    }
};

// 객실 생성 (POST /rooms)
export const createRoom = async (roomData) => {
  try {
    const response = await api.post(ROOM_ENDPOINTS.ROOMS.ADD, roomData);
    return response.data;
  } catch (error) {
    console.error("객실 생성 오류:", error);
    throw error;
  }
};

// 객실 수정 (PUT /rooms/{id})
export const updateRoom = async (id, roomData) => {
  try {
    const response = await api.put(ROOM_ENDPOINTS.ROOMS.MODIFY(id), roomData);
    return response.data;
  } catch (error) {
    console.error(`객실 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 객실 삭제 (DELETE /rooms/{id})
export const deleteRoom = async (id) => {
  try {
    const response = await api.delete(ROOM_ENDPOINTS.ROOMS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`객실 ${id} 삭제 오류:`, error);
    throw error;
  }
};