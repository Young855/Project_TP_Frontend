import axios from "axios";
import { 
    PARTNER_ENDPOINTS, // 파트너 엔드포인트 사용
    axiosConfig // 공통 설정 객체
} from "../config"; // config 파일 경로를 맞춰주세요.

// axios 인스턴스 생성 (withCredentials: true 및 baseURL 적용)
const api = axios.create(axiosConfig);

// 파트너 로그인 (이메일, 비밀번호)
// PartnerLoginPage.jsx에서 필요로 함 (R007)
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
// PartnerSignupPage.jsx에서 필요로 함 (중복확인 버튼)
export const checkPartnerEmailDuplication = async (email) => {
    try {
        // GET /partner/check-email?email=... 형식으로 요청
        const response = await api.get(PARTNER_ENDPOINTS.PARTNERS.CHECK_EMAIL, {
            params: { email }
        });
        // 백엔드에서 중복 여부를 boolean으로 응답한다고 가정 (중복되면 true, 아니면 false)
        return response.data; 
    } catch (error) {
        // 409 Conflict 등의 상태 코드를 받아 처리하거나, 에러를 던져서 상위에서 처리
        console.error("파트너 이메일 중복 확인 오류:", error);
        throw error;
    }
};

// 파트너 생성 (회원가입/등록)
// PartnerSignupPage.jsx에서 필요로 함 (최종 제출)
export const createPartner = async (partnerData) => {
  try {
    const response = await api.post(PARTNER_ENDPOINTS.PARTNERS.ADD, partnerData);
    return response.data;
  } catch (error) {
    console.error("파트너 등록 오류:", error);
    throw error;
  }
};

// 모든 파트너 조회 (관리자용)
// userAPI.js와 유사하게, 필요할 경우를 대비하여 추가
export const getAllPartners = async () => {
  try {
    const response = await api.get(PARTNER_ENDPOINTS.PARTNERS.LIST);
    return response.data;
  } catch (error) {
    console.error("파트너 리스트 조회 오류:", error);
    throw error;
  }
};

// 단일 파트너 조회 (GET /partner/{id})
export const getPartner = async (id) => {
  try {
    const response = await api.get(PARTNER_ENDPOINTS.PARTNERS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 조회 오류:`, error);
    throw error;
  }
};

// 파트너 정보 수정 (PUT /partner/{id})
export const updatePartner = async (id, partnerData) => {
  try {
    const response = await api.put(PARTNER_ENDPOINTS.PARTNERS.MODIFY(id), partnerData);
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 수정 오류:`, error);
    throw error;
  }
};

// 파트너 삭제 (DELETE /partner/{id})
export const deletePartner = async (id) => {
  try {
    const response = await api.delete(PARTNER_ENDPOINTS.PARTNERS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`파트너 ${id} 삭제 오류:`, error);
    throw error;
  }
};