import axios from "axios";
import { 
    USER_ENDPOINTS, 
    axiosConfig // 공통 설정 객체
} from "../config"; // config 파일 경로를 맞춰주세요.

// axios 인스턴스 생성 (withCredentials: true 및 baseURL 적용)
const api = axios.create(axiosConfig);

// 유저 로그인 (이메일, 비밀번호)
export const loginUser = async (email, password) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.LOGIN, { email, password });
    return response.data;
  } catch (error) {
    console.error("로그인 오류:", error);
    throw error;
  }
};

// 모든 유저 조회 (관리자용)
export const getAllUsers = async () => {
  try {
    const response = await api.get(USER_ENDPOINTS.USERS.LIST);
    return response.data;
  } catch (error) {
    console.error("유저 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 유저 조회 (GET /users/{id})
export const getUser = async (id) => {
  try {
    const response = await api.get(USER_ENDPOINTS.USERS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`유저 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 유저 생성 (회원가입)
export const createUser = async (userData) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.ADD, userData);
    return response.data;
  } catch (error) {
    console.error("유저 생성 오류:", error);
    throw error;
  }
};

// 유저 정보 수정 (PUT /users/{id})
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(USER_ENDPOINTS.USERS.MODIFY(id), userData);
    return response.data;
  } catch (error) {
    console.error(`유저 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 유저 삭제 (DELETE /users/{id})
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(USER_ENDPOINTS.USERS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`유저 ${id} 삭제 오류:`, error);
    throw error;
  }
};