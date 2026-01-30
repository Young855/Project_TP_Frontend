import axios from 'axios';
import { AUTH_ENDPOINTS, axiosConfig } from '../config'; // config 경로에 맞춰 수정하세요

/**
 * 1. 비밀번호 재설정 메일 발송 요청
 * @param {string} email 
 */
export const requestPasswordReset = async (email) => {
    const response = await axios.post(
        AUTH_ENDPOINTS.REQUEST_RESET, 
        { email }, 
        axiosConfig
    );
    return response.data;
};

/**
 * 2. 토큰 유효성 검사 (페이지 진입 시)
 * @param {string} token 
 */
export const verifyResetToken = async (token) => {
    // GET 요청 파라미터로 token 전달
    const response = await axios.get(
        `${AUTH_ENDPOINTS.VERIFY_RESET}?token=${token}`, 
        axiosConfig
    );
    return response.data;
};

/**
 * 3. 새 비밀번호로 변경 요청
 * @param {object} { token, newPassword } 
 */
export const resetPassword = async ({ token, newPassword }) => {
    const response = await axios.post(
        AUTH_ENDPOINTS.RESET_PASSWORD, 
        { token, newPassword }, 
        axiosConfig
    );
    return response.data;
};