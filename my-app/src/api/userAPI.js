import axios from "axios";
import { 
    USER_ENDPOINTS, 
    axiosConfig
} from "../config";

const api = axios.create(axiosConfig);

export const loginUser = async (email, password) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.LOGIN, { email, password });
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

export const createUser = async (userData) => {
  try {
    const response = await api.post(USER_ENDPOINTS.USERS.ADD, userData);
    return response.data;
  } catch (error) {
    console.error("유저 생성 오류:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(USER_ENDPOINTS.USERS.MODIFY(id), userData);
    return response.data;
  } catch (error) {
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