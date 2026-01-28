import api from "./AxiosInstance";
import { ADMIN_ENDPOINTS, axiosConfig } from "../config";



// 1. 계정 검색 함수
export const searchAccounts = async (params) => {
  try {
    const response = await api.get(ADMIN_ENDPOINTS.ACCOUNTS.SEARCH, { params });
    return response.data;
  } catch (error) {
    console.error("계정 검색 실패:", error);
    throw error;
  }
};

// 2. 권한 변경 함수
export const updateAccountRoles = async (roleUpdates) => {
  try {
    const response = await api.put(ADMIN_ENDPOINTS.ACCOUNTS.BULK_ROLE, roleUpdates);
    return response.data;
  } catch (error) {
    console.error("권한 업데이트 실패:", error);
    throw error;
  }
};