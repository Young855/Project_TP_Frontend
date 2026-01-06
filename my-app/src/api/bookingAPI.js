import axios from "axios";
import { axiosConfig, BOOKING_ENDPOINTS } from "../config";

const api = axios.create(axiosConfig);

// 예약 목록 조회 (GET /bookings) 
export const getAllBookings = async () => {
    try {
        const res = await api.get(BOOKING_ENDPOINTS.BOOKINGS.LIST);
        return res.data;
    } catch (error) {
        console.error("예약 목록 조회 오류: ", error);
        throw error;
        }
};

// 예약 생성 (POST /bookings)
export const createBooking = async (bookingData) => {
    try {
        const res = await api.post(BOOKING_ENDPOINTS.BOOKINGS.ADD, bookingData);
        return res.data;
    } catch (error) {
        console.error("예약 생성 오류: ", error);
        throw error;
    }
};

// 결제 확정 (POST /bookings/{id}/payment/confirm)
export const confirmPayment = async (id, paymentData) => {
    try {
        const res = await api.post(BOOKING_ENDPOINTS.BOOKINGS.CONFIRM_PAYMENT(id), paymentData);
        return res.data;
    } catch (error) {
        console.error(`결제 확정 오류(bookingId=${id}): `, error);
        throw error;
    }
};

// 예약 단건 조회 (GET /bookings/{id})
export const getBooking = async (id) => {
    try {
        const res = await api.get(BOOKING_ENDPOINTS.BOOKINGS.GET(id));
        return res.data;
    } catch (error) {
        console.error(`예약 ${id} 조회 오류: `, error);
        throw error;
    }
};

// 예약 수정 (PUT /booking/{id})
export const updateBooking = async (id, bookingData) => {
    try {
        const res = await api.put(BOOKING_ENDPOINTS.BOOKINGS.MODIFY(id), bookingData);
        return res.data;
    } catch (error) {
        console.error(`예앾${id} 수정 오류: `, error);
        throw error;
    }
};

// 예약자 정보 저장 (PUT /bookings/{id}/booker)
export const updateBookerInfo = async (id, bookerInfo) => {
    try {
        const res = await api.put(BOOKING_ENDPOINTS.BOOKINGS.UPDATE_BOOKER(id), bookerInfo);
        return res.data;
    } catch (error) {
        console.error(`예약자 정보 저장 오류(bookingId=${id}): `, error);
        throw error;        
    }
};

// 예약 삭제 (DELETE /bookings/{id})
export const deleteBooking = async (id) => {
    try {
        const res = await api.delete(BOOKING_ENDPOINTS.BOOKINGS.DELETE(id));
        return res.data;
    } catch (error) {
        console.error(`예약 ${id} 삭제 오류: `, error);
        throw error;
    }
};

// 유저별 예약 조회 (GET /bookings/user/{userId})
export const getBookingByUserId = async (userId) => {
    try {
        const res = await api.get(BOOKING_ENDPOINTS.BOOKINGS.GET_BY_USER(userId));
        return res.data;
    } catch (error) {
        console.error(`유저 ${userId} 예약 조회 오류: `, error);
        throw error;
    }
};