import { 
    PARTNER_ENDPOINTS, 
} from "../config"; 
import api from "./AxiosInstance"; 


export const partnerLogin = async (email, password) => {
  try {
    const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.LOGIN, { email, password });
    return response.data;
  } catch (error) {
    console.error("파트너 로그인 오류:", error);
    throw error;
  }
};

export const checkPartnerEmailDuplication = async (email) => {
    try {
        const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.CHECK_EMAIL, { email });
        if (typeof response.data === 'boolean') {
            return { isDuplicated: response.data }; 
        }
        return response.data; 
    } catch (error) {
        console.error("파트너 이메일 중복 확인 오류:", error);
        throw error;
    }
};

export const sendPartnerVerificationEmail = async (email) => {
  try {
    await api.post(PARTNER_ENDPOINTS.PARTNERS.SEND_VERIFICATION, { email });
    return true; 
  } catch (error) {
    console.error("파트너 인증메일 발송 오류:", error);
    throw error;
  }
};

export const verifyPartnerEmailCode = async (email, code) => {
  try {
    const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.VERIFY_CODE, { email, code });
    if (typeof response.data === 'boolean') {
        return { verified: response.data }; 
    }
    return response.data; 
  } catch (error) {
    console.error("파트너 인증코드 확인 오류:", error);
    throw error;
  }
};

export const createPartner = async (partnerData) => {
  try {
    const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.ADD, partnerData);
    return response.data;
  } catch (error) {
    console.error("파트너 등록 오류:", error);
    throw error;
  }
};

export const getAllPartners = async () => {
  try {
    const response = await api.get(PARTNER_ENDPOINTS.PARTNERS.LIST);
    return response.data;
  } catch (error) {
    console.error("파트너 리스트 조회 오류:", error);
    throw error;
  }
};

export const getPartner = async (id) => {
  try {
    const response = await api.get(PARTNER_ENDPOINTS.PARTNERS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 조회 오류:`, error);
    throw error;
  }
};

export const getPartnerByAccountId = async (accountId) => {
    try {
        const response = await api.get(
            PARTNER_ENDPOINTS.PARTNERS.GET_BY_ACCOUNT(accountId)
        );
        return response.data; // 여기서 partnerId가 포함된 DTO가 반환됨
    } catch (error) {
        console.error("파트너 정보 조회 실패:", error);
        throw error;
    }
};

export const updatePartner = async (id, partnerData) => {
  try {
    const response = await api.put(PARTNER_ENDPOINTS.PARTNERS.MODIFY(id), partnerData);
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 수정 오류:`, error);
    throw error;
  }
};

export const deletePartner = async (id) => {
  try {
    const response = await api.delete(PARTNER_ENDPOINTS.PARTNERS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 삭제 오류:`, error);
    throw error;
  }
};