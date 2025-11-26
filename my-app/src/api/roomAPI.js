import axios from "axios";
import { 
    ROOM_ENDPOINTS, 
    DAILY_POLICY_ENDPOINTS,
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
 * 변경: 단일 객실 캘린더 조회 엔드포인트를 /daily-policies/calendar로 변경
 */
export const getFullCalendarData = async (propertyId, startDate, endDate) => {
  try {
    // Step 1: 해당 숙소의 모든 객실 리스트 조회
    const rooms = await getRoomsByProperty(propertyId);
    
    if (!rooms || rooms.length === 0) return [];

    // Step 2: 각 객실별로 캘린더 데이터 병렬 호출
    const calendarPromises = rooms.map(async (room) => {
        try {
            // 🌟 변경된 엔드포인트 사용: GET /daily-policies/calendar?roomId={id}&...
            const response = await api.get(DAILY_POLICY_ENDPOINTS.CALENDAR, {
                params: { 
                    roomId: room.roomId, // Query Parameter로 roomId 전달
                    startDate, 
                    endDate 
                }
            });
            // Room 정보와 해당 Room의 정책(dailyPolicies)을 결합하여 반환
            return {
                ...room,
                dailyPolicies: response.data // List<DailyRoomPolicyDTO>
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
/**
 * 7. 일별 정책 개별 수정/생성 (POST/PUT /daily-policies)
 * DailyRoomPolicyController.java의 POST/PUT /daily-policies에 매핑됨.
 * 정책이 없으면 Service에서 생성, 있으면 수정합니다.
 */
export const updateDailyPolicy = async (policyData) => {
  try {
    // RateCalendarPage.jsx에 맞춰 POST를 호출하도록 구현 (Service에서 생성/수정 통합)
    const response = await api.post(DAILY_POLICY_ENDPOINTS.POLICY, policyData);
    return response.data;
  } catch (error) {
    console.error("정책 저장/수정 오류:", error);
    throw error;
  } 
};

/**
 * 8. 기간 정책 일괄 수정 (PUT /daily-policies/bulk)
 * DailyRoomPolicyController.java의 PUT /daily-policies/bulk에 매핑됨.
 */
export const updateBulkPolicy = async (bulkData) => {
  try {
    const response = await api.put(DAILY_POLICY_ENDPOINTS.BULK, bulkData);
    return response.data;
  } catch (error) {
    console.error("일괄 수정 오류:", error);
    throw error;
  }
};