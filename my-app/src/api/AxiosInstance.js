// src/api/AxiosInstance.js

import axios from "axios";
import { axiosConfig, AUTH_ENDPOINTS } from "../config";

const api = axios.create(axiosConfig);

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url.includes('/login') || originalRequest.url.includes('/reissue')) {
            return Promise.reject(error);
        }

        // 401 또는 403 에러 발생 시 토큰 재발급 시도
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const accessToken = localStorage.getItem("accessToken");
                const refreshToken = localStorage.getItem("refreshToken");

                // 저장된 토큰이 없으면 재발급 시도조차 하지 않음
                if (!accessToken || !refreshToken) {
                    throw new Error("토큰 없음");
                }

                const response = await axios.post(AUTH_ENDPOINTS.REISSUE, {
                    accessToken,
                    refreshToken
                }, axiosConfig);

                const newAccess = response.data.accessToken;
                const newRefresh = response.data.refreshToken;

                localStorage.setItem("accessToken", newAccess);
                if (newRefresh) {
                    localStorage.setItem("refreshToken", newRefresh);
                }

                originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
                return api(originalRequest);

            } catch (reissueError) {
                console.error("토큰 재발급 실패:", reissueError);
                
                localStorage.clear(); // 깔끔하게 비우기

                // 로그인 페이지가 아닐 때만 알림 띄우기
                if (window.location.pathname !== "/" && !window.location.pathname.includes('/login')) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    window.location.href = "/";
                }
                return Promise.reject(reissueError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;