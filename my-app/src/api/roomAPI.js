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
    return response.data; // List<RoomDTO>
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

/**
 * 6. [중요] 숙소 내 모든 객실의 캘린더 데이터 조회 (Logic Aggregation)
 * 백엔드는 단일 객실(/{id}/calendar)만 지원하므로,
 * 프론트에서 방 목록을 가져온 뒤 병렬로 각 방의 캘린더를 호출하여 합친다.
 */
export const getFullCalendarData = async (propertyId, startDate, endDate) => {
  try {
    // Step 1: 해당 숙소의 모든 객실 리스트 조회
    const rooms = await getRoomsByProperty(propertyId);
    
    if (!rooms || rooms.length === 0) return [];

    // Step 2: 각 객실별로 캘린더 데이터 병렬 호출
    const calendarPromises = rooms.map(async (room) => {
        try {
            const response = await api.get(ROOM_ENDPOINTS.ROOMS.GET_CALENDAR(room.roomId), {
                params: { startDate, endDate }
            });
            // Room 정보와 해당 Room의 정책(dailyPolicies)을 결합하여 반환
            return {
                ...room,
                dailyPolicies: response.data // List<DailyStockDTO>
            };
        } catch (err) {
            console.error(`Room ${room.roomId} calendar fetch failed`, err);
            // 에러가 나더라도 다른 방 데이터는 보여주기 위해 빈 배열 반환
            return { ...room, dailyPolicies: [] };
        }
    });

    // Step 3: 데이터 통합 반환
    const fullData = await Promise.all(calendarPromises);
    return fullData;

  } catch (error) {
    console.error("통합 캘린더 데이터 조회 오류:", error);
    throw error;
  }
};

// 7. 일별 정책 개별 수정 (PUT /rooms/policy)
// RoomService.updateDailyPolicy 로직에 맞춰 데이터 전송
export const updateDailyPolicy = async (policyData) => {
  try {
    // policyData는 { roomId, date, price, stock, isActive } 형태여야 함
    const response = await api.put(ROOM_ENDPOINTS.ROOMS.POLICY, policyData);
    return response.data;
  } catch (error) {
    console.error("정책 수정 오류:", error);
    throw error;
  } 
};

export const updateBulkPolicy = async (bulkData) => {
  try {
    // bulkData: { roomId, startDate, endDate, price, stock, isActive }
    const response = await api.put(`${ROOM_ENDPOINTS.ROOMS.POLICY}/bulk`, bulkData);
    return response.data;
  } catch (error) {
    console.error("일괄 수정 오류:", error);
    throw error;
  }
};