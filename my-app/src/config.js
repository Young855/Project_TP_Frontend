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
        GET_BY_PROPERTY: (propertyId) => `${API_BASE_URL}/rooms/property/${propertyId}`, 
    },
}

export const PROPERTIES_ENDPOINTS = {
    PROPERTIES: {
        LIST_ALL: `${API_BASE_URL}/properties`, 
        LIST_BY_PARTNER: (partnerId) => `${API_BASE_URL}/partner/properties/by-partner/${partnerId}`, 
        ADD: `${API_BASE_URL}/partner/properties`, 
        GET: (id) => `${API_BASE_URL}/partner/properties/${id}`,
        MODIFY: (id) => `${API_BASE_URL}/partner/properties/${id}`,
        DELETE: (id) => `${API_BASE_URL}/partner/properties/${id}`,
    },
};

export const AMENITIES_ENDPOINTS ={
    AMENITIES: {
        LIST: `${API_BASE_URL}/amenities`, 
        ADD : `${API_BASE_URL}/amenities`, 
        GET : (id) => `${API_BASE_URL}/amenities/${id}`, 
        MODIFY : (id) => `${API_BASE_URL}/amenities/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/amenities/${id}`, 
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
        LIST: `${API_BASE_URL}/favorites`, 
        ADD : `${API_BASE_URL}/favorites`, 
        GET : (id) => `${API_BASE_URL}/favorites/${id}`, 
        DELETE : (id) => `${API_BASE_URL}/favorites/${id}`, 
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
    PROPERTIES_ENDPOINTS,
    AMENITIES_ENDPOINTS,
    PROPERTY_AMENITY_ENDPOINTS,
    ITINERARY_ENDPOINTS,
    ITINERARY_ITEM_ENDPOINTS,
    HASHTAG_ENDPOINTS,
    FAVORITE_ENDPOINTS,
    BOOKINGROOM_ENDPOINTS,
}