const API_BASE_URL = "http://localhost:9090";

export const USER_ENDPOINTS = {
    USERS: {
        LIST: `${API_BASE_URL}/user`, 
        ADD : `${API_BASE_URL}/user/signup`, 
        LOGIN : `${API_BASE_URL}/user/login`, 
        CHECK_EMAIL : `${API_BASE_URL}/user/check-email`, 
        CHECK_NICKNAME : `${API_BASE_URL}/user/check-nickname`,
        SEND_VERIFICATION: `${API_BASE_URL}/user/send-verification`,
        VERIFY_CODE: `${API_BASE_URL}/user/verify-code`,
        GET : (id) => `${API_BASE_URL}/user/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/user/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/user/${id}`, 
    },
}

export const PARTNER_ENDPOINTS = {
    PARTNERS: { 
        LIST: `${API_BASE_URL}/partner`, 
        ADD : `${API_BASE_URL}/partner/signup`, 
        LOGIN : `${API_BASE_URL}/partner/login`, 
        CHECK_EMAIL : `${API_BASE_URL}/partner/check-email`, 
        SEND_VERIFICATION: `${API_BASE_URL}/partner/send-verification`,
        VERIFY_CODE: `${API_BASE_URL}/partner/verify-code`,
        GET : (id) => `${API_BASE_URL}/partner/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/partner/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/partner/${id}`, 
    }
}

export const BOOKING_ENDPOINTS = {
    BOOKINGS: {
        LIST: `${API_BASE_URL}/bookings`, 
        ADD : `${API_BASE_URL}/bookings`, 
        GET : (id) => `${API_BASE_URL}/bookings/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/bookings/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/bookings/${id}`, 
        GET_BY_USER: (userId) => `${API_BASE_URL}/bookings/user/${userId}`, 
    },
}

export const ROOM_ENDPOINTS = {
    ROOMS: {
        LIST: `${API_BASE_URL}/rooms`, 
        ADD : `${API_BASE_URL}/rooms`, 
        GET : (id) => `${API_BASE_URL}/rooms/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/rooms/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/rooms/${id}`, 
        LIST_BY_ACCOMMODATION_WITH_PHOTO: (accommodationId) =>
             `${API_BASE_URL}/rooms/by-accommodation/${accommodationId}/with-main-photo`,
        GET_BY_ACCOMMODATION: (accommodationId) => `${API_BASE_URL}/rooms/accommodation/${accommodationId}`,
        GET_CALENDAR: (roomId) => `${API_BASE_URL}/rooms/${roomId}/calendar`,
        POLICY: `${API_BASE_URL}/rooms/policy`,
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
        LIST_ALL: `${API_BASE_URL}/partner/accommodations`, 
        LIST_BY_PARTNER: (partnerId) =>
             `${API_BASE_URL}/partner/accommodations/by-partner/${partnerId}`, 
        LIST_BY_PARTNER_WITH_PHOTO: (partnerId) =>
             `${API_BASE_URL}/partner/accommodations/by-partner/${partnerId}/with-main-photo`, 
             
        ADD: `${API_BASE_URL}/partner/accommodations`, 
        GET: (id) => `${API_BASE_URL}/partner/accommodations/${id}`,
        GET_WITH_ALL_PHOTOS: (id) => `${API_BASE_URL}/partner/accommodations/${id}/with-all-photos`, 
        
        MODIFY: (id) => `${API_BASE_URL}/partner/accommodations/${id}`,
        DELETE: (id) => `${API_BASE_URL}/partner/accommodations/${id}`,
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
        ADD_LIST: (roomId) => `${API_BASE_URL}/partner/rooms/photos/${roomId}`,
        DELETE: (photoId) => `${API_BASE_URL}/partner/rooms/photos/${photoId}`,
        GET_METADATA_LIST: (roomId) => `${API_BASE_URL}/partner/rooms/photos/list/${roomId}`,
        GET_BLOB_DATA: (photoId) => `${API_BASE_URL}/partner/rooms/photos/${photoId}/data`,
        REORDER: (roomId) => `/partner/rooms/photos/${roomId}/reorder`, 
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
        ADD: `${API_BASE_URL}/favorites/create`,
        LIST:`${API_BASE_URL}/favorites/list`,
        DELETE:`${API_BASE_URL}/favorites/delete`,
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