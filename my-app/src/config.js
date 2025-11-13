const API_BASE_URL = "http://localhost:9090";

export const USER_ENDPOINTS = {
    USERS: {
        LIST: `${API_BASE_URL}/user`, // GET /user
        ADD : `${API_BASE_URL}/user/signup`, // POST /user/signup
        LOGIN : `${API_BASE_URL}/user/login`, 
        CHECK_EMAIL : `${API_BASE_URL}/user/check-email`, 
        CHECK_NICKNAME : `${API_BASE_URL}/user/check-nickname`,
        SEND_VERIFICATION: `${API_BASE_URL}/user/send-verification`,
        VERIFY_CODE: `${API_BASE_URL}/user/verify-code`,
        GET : (id) => `${API_BASE_URL}/user/${id}`, // GET /user/{id}
        MODIFY : (id) => `${API_BASE_URL}/user/${id}`, // PUT /user/{id}
        DELETE : (id) => `${API_BASE_URL}/user/${id}`, // DELETE /user/{id}
    },
}

export const PARTNER_ENDPOINTS = {
    PARTNERS: { // USERS 대신 PARTNERS로 변경하여 Partner 엔티티의 API를 명확히 함
        LIST: `${API_BASE_URL}/partner`, // GET /partner
        ADD : `${API_BASE_URL}/partner/signup`, // POST /partner/signup (회원가입/등록)
        LOGIN : `${API_BASE_URL}/partner/login`, // POST /partner/login (파트너 로그인)
        CHECK_EMAIL : `${API_BASE_URL}/partner/check-email`, // GET /partner/check-email (파트너 이메일 중복 확인)
        SEND_VERIFICATION: `${API_BASE_URL}/partner/send-verification`,
        VERIFY_CODE: `${API_BASE_URL}/partner/verify-code`,
        GET : (id) => `${API_BASE_URL}/partner/${id}`, // GET /partner/{id}
        MODIFY : (id) => `${API_BASE_URL}/partner/${id}`, // PUT /partner/{id}
        DELETE : (id) => `${API_BASE_URL}/partner/${id}`, // DELETE /partner/{id}
    }
}

export const BOOKING_ENDPOINTS = {
    BOOKINGS: {
        LIST: `${API_BASE_URL}/bookings`, // GET /bookings
        ADD : `${API_BASE_URL}/bookings`, // POST /bookings
        GET : (id) => `${API_BASE_URL}/bookings/${id}`, // GET /bookings/{id}
        MODIFY : (id) => `${API_BASE_URL}/bookings/${id}`, // PUT /bookings/{id}
        DELETE : (id) => `${API_BASE_URL}/bookings/${id}`, // DELETE /bookings/{id}
        GET_BY_USER: (userId) => `${API_BASE_URL}/bookings/user/${userId}`, // GET /bookings/user/{userId}
    },
}

export const ROOM_ENDPOINTS = {
    ROOMS: {
        LIST: `${API_BASE_URL}/rooms`, // GET /rooms
        ADD : `${API_BASE_URL}/rooms`, // POST /rooms
        GET : (id) => `${API_BASE_URL}/rooms/${id}`, // GET /rooms/{id}
        MODIFY : (id) => `${API_BASE_URL}/rooms/${id}`, // PUT /rooms/{id}
        DELETE : (id) => `${API_BASE_URL}/rooms/${id}`, // DELETE /rooms/{id}
        // RoomController의 추가 엔드포인트
        GET_BY_PROPERTY: (propertyId) => `${API_BASE_URL}/rooms/property/${propertyId}`, // GET /rooms/property/{propertyId}
    },
}

export const PROPERTIES_ENDPOINTS = {
    PROPERTIES: {
        // 모든 숙소 조회 (관리자용)
        LIST_ALL: `${API_BASE_URL}/properties`, 
        LIST_BY_PARTNER: (partnerId) => `${API_BASE_URL}/partner/properties/${partnerId}`, 
        ADD: `${API_BASE_URL}/properties`, // POST /properties
        GET: (id) => `${API_BASE_URL}/properties/${id}`,
        MODIFY: (id) => `${API_BASE_URL}/properties/${id}`,
        DELETE: (id) => `${API_BASE_URL}/properties/${id}`,
    },
};

export const AMENITIES_ENDPOINTS ={
    AMENITIES: {
        LIST: `${API_BASE_URL}/amenities`, // GET /amenities
        ADD : `${API_BASE_URL}/amenities`, // POST /amenities
        GET : (id) => `${API_BASE_URL}/amenities/${id}`, // GET /amenities/{id}
        MODIFY : (id) => `${API_BASE_URL}/amenities/${id}`, // PUT /amenities/{id}
        DELETE : (id) => `${API_BASE_URL}/amenities/${id}`, // DELETE /amenities/{id}
    },
}

export const PROPERTY_AMENITY_ENDPOINTS = {
    LIST_BY_PROPERTY: (propertyId) => `${API_BASE_URL}/properties/${propertyId}/amenities`,
    ADD: `${API_BASE_URL}/properties/amenities`, 
    DELETE: (propertyId, amenityId) => `${API_BASE_URL}/properties/${propertyId}/amenities/${amenityId}`,
    UPDATE_ALL_BY_PROPERTY: (propertyId) => `${API_BASE_URL}/properties/${propertyId}/amenities`,
};

export const ITINERARY_ENDPOINTS = {
    ITINERARIES: {
        LIST: `${API_BASE_URL}/itineraries`, // GET /itineraries
        ADD : `${API_BASE_URL}/itineraries`, // POST /itineraries
        GET : (id) => `${API_BASE_URL}/itineraries/${id}`, // GET /itineraries/{id}
        MODIFY : (id) => `${API_BASE_URL}/itineraries/${id}`, // PUT /itineraries/{id}
        DELETE : (id) => `${API_BASE_URL}/itineraries/${id}`, // DELETE /itineraries/{id}
    },
}

export const ITINERARY_ITEM_ENDPOINTS = {
    ITINERARY_ITEMS: {
        LIST: `${API_BASE_URL}/itinerary-items`, // GET /itinerary-items
        ADD : `${API_BASE_URL}/itinerary-items`, // POST /itinerary-items
        GET : (id) => `${API_BASE_URL}/itinerary-items/${id}`, // GET /itinerary-items/{id}
        MODIFY : (id) => `${API_BASE_URL}/itinerary-items/${id}`, // PUT /itinerary-items/{id}
        DELETE : (id) => `${API_BASE_URL}/itinerary-items/${id}`, // DELETE /itinerary-items/{id}
    },
}

export const HASHTAG_ENDPOINTS = {
    HASHTAGS: {
        LIST: `${API_BASE_URL}/hashtags`, // GET /hashtags
        ADD : `${API_BASE_URL}/hashtags`, // POST /hashtags
        GET : (id) => `${API_BASE_URL}/hashtags/${id}`, // GET /hashtags/{id}
        MODIFY : (id) => `${API_BASE_URL}/hashtags/${id}`, // PUT /hashtags/{id}
        DELETE : (id) => `${API_BASE_URL}/hashtags/${id}`, // DELETE /hashtags/{id}
    },
}

export const FAVORITE_ENDPOINTS = {
    FAVORITES: {
        LIST: `${API_BASE_URL}/favorites`, // GET /favorites
        ADD : `${API_BASE_URL}/favorites`, // POST /favorites
        GET : (id) => `${API_BASE_URL}/favorites/${id}`, // GET /favorites/{id}
        DELETE : (id) => `${API_BASE_URL}/favorites/${id}`, // DELETE /favorites/{id}
    },
}

export const BOOKINGROOM_ENDPOINTS ={
    BOOKINGROOM: {
        LIST: `${API_BASE_URL}/bookingrooms`, // GET /bookingrooms
        ADD : `${API_BASE_URL}/bookingrooms`, // POST /bookingrooms
        // 복합 키: GET /bookingrooms/{bookingId}/{roomId}
        GET : (bookingId, roomId) => `${API_BASE_URL}/bookingrooms/${bookingId}/${roomId}`, 
        // 복합 키: PUT /bookingrooms/{bookingId}/{roomId}
        MODIFY : (bookingId, roomId) => `${API_BASE_URL}/bookingrooms/${bookingId}/${roomId}`, 
        // 복합 키: DELETE /bookingrooms/{bookingId}/{roomId}
        DELETE : (bookingId, roomId) => `${API_BASE_URL}/bookingrooms/${bookingId}/${roomId}`, 
    },
}

export const axiosConfig = {
    baseURL: API_BASE_URL,
    headers: {
        "Content-type" : "application/json"
    },
    withCredentials: true // 쿠키/인증 정보를 포함한 요청 허용
};

export default{
    API_BASE_URL,
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
}