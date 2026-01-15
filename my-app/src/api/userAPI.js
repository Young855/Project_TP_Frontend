import axios from "axios";
import { 
    USER_ENDPOINTS, 
    axiosConfig
} from "../config";

const api = axios.create(axiosConfig);

export const checkEmailDuplication = async (email) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.CHECK_EMAIL, { email });
    // [수정] 백엔드 응답이 true/false 불리언 값일 경우 객체로 래핑하여 반환
    if (typeof response.data === 'boolean') {
        return { isDuplicated: response.data };
    }
    return response.data;
  } catch (error) {
    console.error("이메일 중복 확인 오류:", error);
    throw error;
  }
};

export const checkNicknameDuplication = async (nickname) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.CHECK_NICKNAME, { nickname });
    return response.data;
  } catch (error) {
    console.error("닉네임 중복 확인 오류:", error);
    throw error;
  }
};

export const sendVerificationEmail = async (email) => {
  try {
    await api.post(USER_ENDPOINTS.USERS.SEND_VERIFICATION, { email });
    return true; 
  } catch (error) {
    console.error("인증메일 발송 오류:", error);
    throw error;
  }
};

export const verifyEmailCode = async (email, code) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.VERIFY_CODE, { email, code });
    if (typeof response.data === 'boolean') {
        return { verified: response.data };
    }
    return response.data; 
  } catch (error) {
    console.error("인증코드 확인 오류:", error);
    throw error;
  }
};


export const loginUser = async (email, password) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.LOGIN, { email, password });
    console.log("데이터: "+response.data.email);
    return response.data;
  } catch (error) {
    console.error("로그인 오류:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get(USER_ENDPOINTS.USERS.LIST);
    return response.data;
  } catch (error) {
    console.error("유저 리스트 조회 오류:", error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await api.get(USER_ENDPOINTS.USERS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`유저 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 회원가입
export const createUser = async (userData) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.ADD, userData);
    return response.data; 
  } catch (error) {
    console.error("유저 생성 오류:", error);
    throw error;
  }
};

// 소셜 회원가입
export const createSocialUser = async (userData) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.SOCIAL_ADD, userData);
    return response.data; 
  } catch (error) {
    console.error("소셜 유저 생성 오류:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(USER_ENDPOINTS.USERS.MODIFY(id), userData);
    return response.data;
  } catch (error)
 {
    console.error(`유저 ${id} 수정 오류:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(USER_ENDPOINTS.USERS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`유저 ${id} 삭제 오류:`, error);
    throw error;
  }
};