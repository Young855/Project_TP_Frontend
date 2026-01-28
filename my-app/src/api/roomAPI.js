import api from "./AxiosInstance"; 
import { 
    ROOM_ENDPOINTS, 
    DAILY_POLICY_ENDPOINTS,
    axiosConfig
} from "../config";


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

// 2. 특정 숙소의 모든 객실 조회 (GET /rooms/accommodation/{accommodationId})
export const getRoomsByAccommodation = async (accommodationId) => {
  try {
    // [수정] config.js에 GET_BY_ACCOMMODATION으로 변경되어 있어야 합니다.
    const response = await api.get(ROOM_ENDPOINTS.ROOMS.GET_BY_ACCOMMODATION(accommodationId));
    return response.data; // List<RoomDTO>
  } catch (error) {
    console.error("객실 목록 조회 오류:", error);
    throw error;
  }
};

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
 * 6. [중요] 숙소 내 모든 객실의 캘린더 데이터 조회
 */
export const getFullCalendarData = async (accommodationId, startDate, endDate, page = 0, size = 5) => {
  try {
    const responseData = await getRoomByAccommodationIDWithMainPhoto(accommodationId, page, size);
    const rooms = responseData.content || responseData; 
    
    if (!rooms || rooms.length === 0) {
        return responseData.content ? { ...responseData, content: [] } : [];
    }
    const calendarPromises = rooms.map(async (room) => {
        try {
            const response = await api.get(DAILY_POLICY_ENDPOINTS.CALENDAR, {
                params: { 
                    roomId: room.roomId, 
                    startDate, 
                    endDate 
                }
            });
            return {
                ...room,
                dailyPolicies: response.data 
            };
        } catch (err) {
            console.error(`Room ${room.roomId} calendar fetch failed`, err);
            return { ...room, dailyPolicies: [] };
        }
    });

    const fullData = await Promise.all(calendarPromises);

    // 🌟 [수정 포인트 2] 페이징 정보가 있었다면 합쳐서 반환
    if (responseData.content) {
        return {
            ...responseData, // totalPages, totalElements, number 등 유지
            content: fullData // content만 캘린더 정보가 포함된 데이터로 교체
        };
    } else {
        return fullData; // 페이징이 아니면 배열 그대로 반환
    }

  } catch (error) {
    console.error("통합 캘린더 데이터 조회 오류:", error);
    throw error;
  }
};

/**
 * 7. 일별 정책 개별 수정/생성
 */
export const updateDailyPolicy = async (policyData) => {
  try {
    const response = await api.post(DAILY_POLICY_ENDPOINTS.POLICY, policyData);
    return response.data;
  } catch (error) {
    console.error("정책 저장/수정 오류:", error);
    throw error;
  } 
};

/**
 * 8. 기간 정책 일괄 수정
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

export const getRoomByAccommodationIDWithMainPhoto = async (accommodationId, page = 0, size = 5) => {
  try {
    const response = await api.get(
      ROOM_ENDPOINTS.ROOMS.LIST_BY_ACCOMMODATION_WITH_PHOTO(accommodationId),
      {
        params: {
          page: page,
          size: size
        }
      }
    );
    return response.data; // 
  } catch (error) {
    console.error(`숙소 ${accommodationId}의 객실 목록 조회 오류 (이미지 통합):`, error);
    throw error;
  }
};