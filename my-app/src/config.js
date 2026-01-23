const API_BASE_URL = "http://localhost:9090";
const AI_API_BASE_URL = "http://localhost:8000";

export const USER_ENDPOINTS = {
    USERS: {
        LIST: `${API_BASE_URL}/users`, 
        ADD : `${API_BASE_URL}/users/signup`, 
        SOCIAL_ADD : `${API_BASE_URL}/users/social-signup`,
        LOGIN : `${API_BASE_URL}/users/login`, 
        CHECK_EMAIL : `${API_BASE_URL}/users/check-email`, 
        CHECK_NICKNAME : `${API_BASE_URL}/users/check-nickname`,
        SEND_VERIFICATION: `${API_BASE_URL}/users/send-verification`,
        VERIFY_CODE: `${API_BASE_URL}/users/verify-code`,
        INFO : (accountid)=>`${API_BASE_URL}/users/account/${accountid}`,
        GET : (id) => `${API_BASE_URL}/users/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/users/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/users/${id}`, 
    },
}
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/users/login`,          
    PARTNER_LOGIN: `${API_BASE_URL}/auth/partners/login`, 
    KAKAO_LOGIN: `${API_BASE_URL}/auth/api/kakao`, 
    
    REISSUE: `${API_BASE_URL}/auth/api/reissue`,          
};

export const PARTNER_ENDPOINTS = {
    PARTNERS: { 
        LIST: `${API_BASE_URL}/partner/partnerpage`, 
        ADD : `${API_BASE_URL}/partner/signup`, 
        LOGIN : `${API_BASE_URL}/partner/login`, 
        CHECK_EMAIL : `${API_BASE_URL}/partner/check-email`, 
        SEND_VERIFICATION: `${API_BASE_URL}/partner/send-verification`,
        VERIFY_CODE: `${API_BASE_URL}/partner/verify-code`,
        GET : (id) => `${API_BASE_URL}/partner/partnerpage/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/partner/partnerpage/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/partner/partnerpage/${id}`, 
        GET_BY_ACCOUNT: (accountId) => `${API_BASE_URL}/partner/account/${accountId}`,
    }
}

export const BOOKING_ENDPOINTS = {
    BOOKINGS: {
        LIST: `${API_BASE_URL}/bookings`, 
        ADD : `${API_BASE_URL}/bookings`, 
        PREPARE: `${API_BASE_URL}/bookings/prepare`,
        
        // ✅ (추가) 예약 페이지에서 쓰는 이메일 인증 (기존 UserController 재사용)
        SEND_EMAIL_VERIFICATION: `${API_BASE_URL}/user/send-verification`,
        VERIFY_EMAIL_CODE: `${API_BASE_URL}/user/verify-code`,

        // ✅ 유저별 예약 조회 (GET /bookings/user/{userId})
        GET_BY_USER: (userId) => `${API_BASE_URL}/bookings/user/${userId}`,
        UPDATE_BOOKER: (id) => `${API_BASE_URL}/bookings/${id}/booker`,
        CONFIRM_PAYMENT: (id) => `${API_BASE_URL}/bookings/${id}/payment/confirm`,

        GET : (id) => `${API_BASE_URL}/bookings/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/bookings/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/bookings/${id}`, 
        GET_BY_USER: (userId) => `${API_BASE_URL}/bookings/user/${userId}`, 
    },
}
export const RECOMMENDATION_ENDPOINTS = {
    RECOMMENDATION: `${AI_API_BASE_URL}/recommendation`
};

export const ROOM_ENDPOINTS = {
    ROOMS: {
        LIST: `${API_BASE_URL}/rooms/admin`, 
        ADD : `${API_BASE_URL}/rooms/partner`, 
        GET : (id) => `${API_BASE_URL}/rooms/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/rooms/partner/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/rooms/partner/${id}`, 
        LIST_BY_ACCOMMODATION_WITH_PHOTO: (accommodationId) =>
             `${API_BASE_URL}/rooms/by-accommodation/${accommodationId}/with-main-photo`,
        GET_BY_ACCOMMODATION: (accommodationId) => `${API_BASE_URL}/rooms/accommodation/${accommodationId}`,
    },
}

export const DAILY_POLICY_ENDPOINTS = {
    CALENDAR: `${API_BASE_URL}/daily-policies/calendar`, 
    POLICY: `${API_BASE_URL}/daily-policies`,
    BULK: `${API_BASE_URL}/daily-policies/bulk`,
};

// [수정] PROPERTIES -> ACCOMMODATIONS
export const ACCOMMODATIONS_ENDPOINTS = {
    ACCOMMODATIONS: {
        LIST_ALL: `${API_BASE_URL}/accommodations`, 
        GET_DETAIL: (id) => `${API_BASE_URL}/accommodations/${id}/detail`,
        
        LIST_BY_PARTNER: (partnerId) =>
             `${API_BASE_URL}/accommodations/by-partner/${partnerId}`, 
        LIST_BY_PARTNER_WITH_PHOTO: (partnerId) =>
             `${API_BASE_URL}/accommodations/by-partner/${partnerId}/with-main-photo`, 
        SEARCH_WITH_MAIN_PHOTO: `${API_BASE_URL}/accommodations/search/with-main-photo`,
        ADD: `${API_BASE_URL}/accommodations`, 
        GET: (id) => `${API_BASE_URL}/accommodations/${id}`,
        GET_WITH_ALL_PHOTOS: (id) => `${API_BASE_URL}/accommodations/${id}/with-all-photos`, 
        MODIFY: (id) => `${API_BASE_URL}/accommodations/${id}`,
        DELETE: (id) => `${API_BASE_URL}/accommodations/${id}`,
    },
};

export const ACCOMMODATION_PHOTO_ENDPOINTS = {
    PHOTOS: {
        ADD_LIST: (accommodationId) => `${API_BASE_URL}/partner/accommodations/photos/${accommodationId}`,
        DELETE: (photoId) => `${API_BASE_URL}/partner/accommodations/photos/${photoId}`,
        GET_METADATA_LIST: (accommodationId) => `${API_BASE_URL}/partner/accommodations/photos/list/${accommodationId}`,
        GET_BLOB_DATA: (photoId) => `${API_BASE_URL}/partner/accommodations/photos/${photoId}/data`,
        REORDER: (accommodationId) => `/partner/accommodations/photos/${accommodationId}/reorder`, // 백엔드 @PostMapping("/{accommodationId}/reorder") 와 일치
    }
}
export const ROOM_PHOTO_ENDPOINTS = {
    PHOTOS: {
        ADD_LIST: (roomId) => `${API_BASE_URL}/rooms/partner/photos/${roomId}`,
        DELETE: (photoId) => `${API_BASE_URL}/rooms/partner/photos/${photoId}`,
        GET_METADATA_LIST: (roomId) => `${API_BASE_URL}/rooms/photos/list/${roomId}`,
        GET_BLOB_DATA: (photoId) => `${API_BASE_URL}/rooms/photos/${photoId}/data`,
        REORDER: (roomId) => `/rooms/partner/photos/${roomId}/reorder`, 
    }
}

export const AMENITIES_ENDPOINTS ={
    AMENITIES: {
        LIST: `${API_BASE_URL}/amenities`, 
        ADD : `${API_BASE_URL}/amenities`, 
        GET : (id) => `${API_BASE_URL}/amenities/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/amenities/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/amenities/${id}`, 
    },
}


export const ACCOMMODATION_AMENITY_ENDPOINTS = {
    LIST_BY_ACCOMMODATION: (accommodationId) => `${API_BASE_URL}/accommodations/${accommodationId}/amenities`,
    ADD: `${API_BASE_URL}/accommodations/amenities`, 
    DELETE: (accommodationId, amenityId) => `${API_BASE_URL}/accommodations/${accommodationId}/amenities/${amenityId}`,
    UPDATE_ALL_BY_ACCOMMODATION: (accommodationId) => `${API_BASE_URL}/accommodations/${accommodationId}/amenities`,
};

export const ITINERARY_ENDPOINTS = {
    ITINERARIES: {
        LIST: `${API_BASE_URL}/itineraries`, 
        ADD : `${API_BASE_URL}/itineraries`, 
        GET : (id) => `${API_BASE_URL}/itineraries/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/itineraries/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/itineraries/${id}`, 
    },
}

export const ITINERARY_ITEM_ENDPOINTS = {
    ITINERARY_ITEMS: {
        LIST: `${API_BASE_URL}/itinerary-items`, 
        ADD : `${API_BASE_URL}/itinerary-items`, 
        GET : (id) => `${API_BASE_URL}/itinerary-items/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/itinerary-items/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/itinerary-items/${id}`, 
    },
}

export const HASHTAG_ENDPOINTS = {
    HASHTAGS: {
        LIST: `${API_BASE_URL}/hashtags`, 
        ADD : `${API_BASE_URL}/hashtags`, 
        GET : (id) => `${API_BASE_URL}/hashtags/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/hashtags/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/hashtags/${id}`, 
    },
}

export const FAVORITE_ENDPOINTS = {
    FAVORITES: {
        ADD: `${API_BASE_URL}/favorites`,
        LIST:`${API_BASE_URL}/favorites`,
        DELETE:`${API_BASE_URL}/favorites`,
    },
}

export const BOOKINGROOM_ENDPOINTS ={
    BOOKINGROOM: {
        LIST: `${API_BASE_URL}/bookingrooms`, 
        ADD : `${API_BASE_URL}/bookingrooms`, 
        GET : (bookingId, roomId) => `${API_BASE_URL}/bookingrooms/${bookingId}/${roomId}`, 
        MODIFY : (bookingId, roomId) => `${API_BASE_URL}/bookingrooms/${bookingId}/${roomId}`, 
        DELETE : (bookingId, roomId) => `${API_BASE_URL}/bookingrooms/${bookingId}/${roomId}`, 
    },
}

export const ADMIN_ENDPOINTS = {
    ACCOMMODATIONS: {
        SEARCH: `${API_BASE_URL}/admin/accommodations/search`,
        BULK_STATUS: `${API_BASE_URL}/admin/accommodations/status/bulk`,
    },
    ACCOUNTS: {
        SEARCH: `${API_BASE_URL}/admin/accounts/search`,
        BULK_ROLE: `${API_BASE_URL}/admin/accounts/role/bulk`,
    },
}

export const PRICE_ENDPOINTS = {
    CALCULATE: `${API_BASE_URL}/prices/calculate`, 
}

export const USER_PREFERENCE_ENDPOINTS = {
    GET: (userId) => `${API_BASE_URL}/api/preference/${userId}`,   // GET 조회
    SAVE: (userId) => `${API_BASE_URL}/api/preference/${userId}`,
};

export const axiosConfig = {
    baseURL: API_BASE_URL,
    headers: {
        "Content-type" : "application/json"
    },
    withCredentials: true 
};

export default{
    API_BASE_URL,
    USER_ENDPOINTS,
    PARTNER_ENDPOINTS,
    BOOKING_ENDPOINTS,
    ROOM_ENDPOINTS,
    ADMIN_ENDPOINTS,
    ACCOMMODATIONS_ENDPOINTS,
    ACCOMMODATION_PHOTO_ENDPOINTS,
    AMENITIES_ENDPOINTS,
    ACCOMMODATION_AMENITY_ENDPOINTS,
    ITINERARY_ENDPOINTS,
    ITINERARY_ITEM_ENDPOINTS,
    HASHTAG_ENDPOINTS,
    FAVORITE_ENDPOINTS,
    ROOM_PHOTO_ENDPOINTS,
    BOOKINGROOM_ENDPOINTS,
    DAILY_POLICY_ENDPOINTS,
    PRICE_ENDPOINTS,
}