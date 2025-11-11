import axios from "axios";
import { 
    PARTNER_ENDPOINTS, // 파트너 엔드포인트 사용
    axiosConfig // 공통 설정 객체
} from "../config"; // config 파일 경로를 맞춰주세요.

// axios 인스턴스 생성 (withCredentials: true 및 baseURL 적용)
const api = axios.create(axiosConfig);

// 파트너 로그인 (이메일, 비밀번호)
export const partnerLogin = async (email, password) => {
  try {
    const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.LOGIN, { email, password });
    return response.data;
  } catch (error) {
    console.error("파트너 로그인 오류:", error);
    throw error;
  }
};

// 파트너 이메일 중복 확인
export const checkPartnerEmailDuplication = async (email) => {
    try {
        const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.CHECK_EMAIL, { email });
        return response.data; 
    } catch (error) {
        console.error("파트너 이메일 중복 확인 오류:", error);
        throw error;
    }
};

// 파트너 인증메일 발송
export const sendPartnerVerificationEmail = async (email) => {
  try {
    await api.post(PARTNER_ENDPOINTS.PARTNERS.SEND_VERIFICATION, { email });
    return true; 
  } catch (error) {
    console.error("파트너 인증메일 발송 오류:", error);
    throw error;
  }
};

// 파트너 인증코드 확인
export const verifyPartnerEmailCode = async (email, code) => {
  try {
    const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.VERIFY_CODE, { email, code });
    return response.data; 
  } catch (error) {
    console.error("파트너 인증코드 확인 오류:", error);
    throw error;
  }
};

// 파트너 생성 (회원가입/등록)
export const createPartner = async (partnerData) => {
  try {
    const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.ADD, partnerData);
    return response.data;
  } catch (error) {
    console.error("파트너 등록 오류:", error);
    throw error;
  }
};

// 모든 파트너 조회
export const getAllPartners = async () => {
  try {
    const response = await api.get(PARTNER_ENDPOINTS.PARTNERS.LIST);
    return response.data;
  } catch (error) {
    console.error("파트너 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 파트너 조회
export const getPartner = async (id) => {
  try {
    const response = await api.get(PARTNER_ENDPOINTS.PARTNERS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 파트너 정보 수정
export const updatePartner = async (id, partnerData) => {
  try {
    const response = await api.put(PARTNER_ENDPOINTS.PARTNERS.MODIFY(id), partnerData);
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 파트너 삭제
export const deletePartner = async (id) => {
  try {
    const response = await api.delete(PARTNER_ENDPOINTS.PARTNERS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 삭제 오류:`, error);
    throw error;
  }
};