import axios from "axios";
import { axiosConfig, AUTH_ENDPOINTS } from "../config";

// 1. config.js의 설정을 기반으로 인스턴스 생성
const api = axios.create(axiosConfig);

// 2. 요청 인터셉터: 헤더에 AccessToken 자동 추가
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

// 3. 응답 인터셉터: 401 에러(토큰 만료) 시 재발급 로직
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401 에러이고, 아직 재시도하지 않은 요청인 경우
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const accessToken = localStorage.getItem("accessToken");
                const refreshToken = localStorage.getItem("refreshToken");

                // 토큰 재발급 요청
                // 주의: 인터셉터가 걸린 'api' 대신 깡통 'axios'를 써야 무한 루프에 안 빠짐
                // endpoint는 config.js에서 가져온 AUTH_ENDPOINTS.REISSUE 사용
                const response = await axios.post(AUTH_ENDPOINTS.REISSUE, {
                    accessToken,
                    refreshToken
                }, axiosConfig);

                // 재발급 성공 시 로컬스토리지 갱신
                const newAccess = response.data.accessToken;
                const newRefresh = response.data.refreshToken;

                localStorage.setItem("accessToken", newAccess);
                if (newRefresh) {
                    localStorage.setItem("refreshToken", newRefresh);
                }

                // 실패했던 요청의 헤더를 새 토큰으로 교체 후 재요청
                originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
                return api(originalRequest);

            } catch (reissueError) {
                console.error("토큰 재발급 실패:", reissueError);
                
                // 로그아웃 처리
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("nickname");
                localStorage.removeItem("email");

                if (window.location.pathname !== "/") {
                    alert("세션이 만료되었습니다.");
                    window.location.href = "/login-selection";
                }
                return Promise.reject(reissueError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;