import api from "./AxiosInstance"; // 위에서 만든 인터셉터 달린 api
import { AUTH_ENDPOINTS } from "../config"; // config에서 엔드포인트 가져옴

// 일반 유저 로그인
export const loginUser = async (email, password) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
        return response.data;
    } catch (error) {
        console.error("로그인 오류:", error);
        throw error;
    }
};

// 파트너 로그인
export const loginPartner = async (email, password) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.PARTNER_LOGIN, { email, password });
        return response.data;
    } catch (error) {
        console.error("파트너 로그인 오류:", error);
        throw error;
    }
};

// 카카오 로그인
export const loginKakao = async (code) => {
    try {
        const response = await api.post(AUTH_ENDPOINTS.KAKAO_LOGIN, { code });
        return response.data;
    } catch (error) {
        console.error("카카오 로그인 오류:", error);
        throw error;
    }
};