// src/api/AxiosInstance.js

import axios from "axios";
import { axiosConfig, AUTH_ENDPOINTS } from "../config";

const api = axios.create(axiosConfig);

// 🔄 재발급 진행 중인지 체크하는 플래그
let isRefreshing = false;
// ⏳ 재발급 동안 대기 중인 요청들을 담을 배열
let failedQueue = [];

// 대기 중인 요청들을 처리하는 함수
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

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

        // 로그인이나 재발급 요청 자체에서 에러가 난 건은 무한 루프 방지를 위해 바로 reject
        if (originalRequest.url.includes('/login') || originalRequest.url.includes('/reissue')) {
            return Promise.reject(error);
        }

        // 401(Unauthorized) 또는 403(Forbidden) 에러 발생 시
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            
            // 1. 이미 재발급이 진행 중이라면? -> 대기열(Queue)에 넣고 기다림
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token) => {
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err) => {
                            reject(err);
                        },
                    });
                });
            }

            // 2. 재발급 진행 시작
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const accessToken = localStorage.getItem("accessToken");
                const refreshToken = localStorage.getItem("refreshToken");

                if (!accessToken || !refreshToken) {
                    throw new Error("토큰 없음");
                }

                // 토큰 재발급 요청
                const response = await axios.post(AUTH_ENDPOINTS.REISSUE, {
                    accessToken,
                    refreshToken
                }, axiosConfig);

                const newAccess = response.data.accessToken;
                const newRefresh = response.data.refreshToken;

                // 새 토큰 저장
                localStorage.setItem("accessToken", newAccess);
                if (newRefresh) {
                    localStorage.setItem("refreshToken", newRefresh);
                }

                // 3. 재발급 성공! -> 대기 중이던 요청들에게 새 토큰 전달 및 실행
                processQueue(null, newAccess);

                // 현재 실패했던 요청도 재시도
                originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
                return api(originalRequest);

            } catch (reissueError) {
                // 4. 재발급 실패 -> 대기 중이던 요청들도 모두 에러 처리
                processQueue(reissueError, null);
                
                console.error("토큰 재발급 최종 실패:", reissueError);
                localStorage.clear();

                if (window.location.pathname !== "/" && !window.location.pathname.includes('/login')) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    window.location.href = "/";
                }
                return Promise.reject(reissueError);
            } finally {
                // 상태 초기화
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;