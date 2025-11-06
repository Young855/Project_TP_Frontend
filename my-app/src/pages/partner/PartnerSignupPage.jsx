// PartnerSignupPage.jsx (Step 2)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

// 🚀 API 호출 로직 구조 Placeholder 1: 파트너 생성 (무조건 성공)
// TODO: 실제 서버의 파트너 등록 API 엔드포인트로 교체해야 합니다.
const createPartner = async (data) => {
    console.log("--- 파트너 등록 API 호출 시도 (Placeholder: 무조건 성공) ---");
    console.log("전송 데이터:", data);
    
    // 1. API 호출 시뮬레이션 (네트워크 지연)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. ⚠️ 실제 API 호출 로직 Placeholder (주석 처리)
    /*
    try {
        const response = await axios.post('YOUR_SERVER_URL/api/partner/signup', data);
        return response.data; // 서버 응답 반환
    } catch (error) {
        console.error("실제 API 호출 오류:", error);
        // throw error; // 오류 발생 시 catch 블록으로 던지기
    }
    */

    // 3. Mock 성공 응답 반환 (로직 구조 완성 시까지 유지)
    return { success: true, partnerId: 'P12345', ...data };
};

// 🚀 API 호출 로직 구조 Placeholder 2: 이메일 중복 확인 (무조건 사용 가능: false 반환)
// TODO: 실제 서버의 이메일 중복 확인 API 엔드포인트로 교체해야 합니다.
const checkPartnerEmailDuplication = async (email) => {
    console.log("--- 이메일 중복 확인 API 호출 시도 (Placeholder: 무조건 사용 가능) ---");
    console.log("확인 이메일:", email);
    
    // 1. API 호출 시뮬레이션 (네트워크 지연)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 2. ⚠️ 실제 API 호출 로직 Placeholder (주석 처리)
    /*
    try {
       const response = await axios.get(`YOUR_SERVER_URL/api/partner/check-email?email=${email}`);
       return response.data.isDuplicated; // 서버 응답 반환 (true/false)
    } catch (error) {
       console.error("실제 API 호출 오류:", error);
       // throw error; 
    }
    */
    
    // 3. Mock 성공 응답 반환 (중복 아님/사용 가능: false)
    return false; 
};

/**
 * 파트너 등록 페이지 (PartnerSignupPage) - Step 2
 */
export default function PartnerSignupPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // Step 1에서 전달받은 데이터
  const verifiedBizData = location.state || {};

  // Step 1에서 확인된 데이터
  const bizRegNumber = verifiedBizData.bizRegNumber || '';
  const ceoName = verifiedBizData.ceoName || '';
  const openingDate = verifiedBizData.openingDate || '';
  const isBizInfoVerified = verifiedBizData.isBizInfoVerified || false; 

  // Partner 엔티티 필드 기반 상태 (Step 2에서 입력받는 필드)
  const [bizName, setBizName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // 에러 및 검증 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [bizNameError, setBizNameError] = useState('');
  const [bizVerificationError, setBizVerificationError] = useState(''); 
  
  const [isEmailVerified, setIsEmailVerified] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // 💡 Step 1 데이터 없으면 이전 페이지로 리다이렉트 (유효성)
  useEffect(() => {
    if (!isBizInfoVerified) {
      console.warn('사업자 정보 진위 확인이 필요합니다. Step 1로 이동합니다.');
      navigate('/partner/bizverification', { replace: true }); 
    }
    // Step 1 데이터가 있다면, 확인 완료 메시지를 표시
    if (isBizInfoVerified) {
        setBizVerificationError('사업자 정보 진위 확인이 완료되었습니다.');
    }
  }, [isBizInfoVerified, navigate]);


  /* --- 유효성 검사 함수 (Step 2에서 사용되는 필드만 유지) --- */
  const validatePassword = (currentPassword) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!currentPassword) {
        setPasswordError('비밀번호를 입력해주세요.');
        return false;
    }
    if (!passwordRegex.test(currentPassword)) {
      setPasswordError('영문 대/소문자, 숫자, 특수기호(@$!%*?&)를 포함해 8~20자로 입력해주세요.');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const validatePasswordConfirm = (currentPasswordConfirm) => {
    if (currentPasswordConfirm !== password) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
      return false;
    } else {
      setPasswordConfirmError('');
      return true;
    }
  };
  
  const validateEmail = (currentEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentEmail)) {
        setEmailError('유효한 이메일 주소를 입력해주세요.');
        return false;
    } else {
        setEmailError('');
        return true;
    }
  };
  
  /* --- 중복 확인 핸들러 --- */
  const handleEmailCheck = async () => {
    if (!validateEmail(contactEmail)) return;

    try {
        setIsSubmitting(true); 
        
        // 💡 Placeholder 함수 호출
        const isDuplicated = await checkPartnerEmailDuplication(contactEmail); 
        
        if (isDuplicated) { 
            // Mock이 false를 반환하므로 실행 안 됨
            setEmailError('이미 등록된 사업자 이메일입니다.'); 
            setIsEmailVerified(false);
        } else {
            // Mock이 false를 반환하므로 실행됨 (사용 가능)
            setEmailError('사용 가능한 이메일입니다.');
            setIsEmailVerified(true);
        }
    } catch (error) {
        console.error('이메일 중복 확인 중 예기치 않은 오류 발생:', error);
        setEmailError('중복 확인 중 오류가 발생했습니다.');
        setIsEmailVerified(false);
    } finally {
        setIsSubmitting(false); 
    }
  };
  
  // 비밀번호 입력 핸들러
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length > 0 && passwordError) { setPasswordError(''); }
    if (passwordConfirm.length > 0) { validatePasswordConfirm(passwordConfirm); }
  };

  // 비밀번호 확인 입력 핸들러
  const handlePasswordConfirmChange = (e) => {
    const newPasswordConfirm = e.target.value;
    setPasswordConfirm(newPasswordConfirm);
    if (newPasswordConfirm.length > 0 && passwordConfirmError) { setPasswordConfirmError(''); }
  };

  /* --- 최종 제출 핸들러 (Mock 로직에 맞게 조정) --- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isBizInfoVerified) return;

    let isValid = true;
    let errorMessages = [];

    // 1. Step 2 필수 필드 및 유효성 검사
    if (bizName.trim() === '') { setBizNameError('사업자명을 입력해주세요.'); isValid = false; errorMessages.push('사업자/회사 이름이 입력되지 않았습니다.'); } else { setBizNameError(''); } 
    if (!validateEmail(contactEmail)) { isValid = false; if(emailError) errorMessages.push(`이메일: ${emailError}`); }
    if (!validatePassword(password)) { isValid = false; if(passwordError) errorMessages.push(`비밀번호: ${passwordError}`); }
    if (!validatePasswordConfirm(passwordConfirm)) { isValid = false; if(passwordConfirmError) errorMessages.push(`비밀번호 확인: ${passwordConfirmError}`); }
    
    // 2. 이메일 중복 확인 여부
    if (validateEmail(contactEmail) && !isEmailVerified) {
        setEmailError('이메일 중복 확인이 필요합니다.');
        isValid = false;
        errorMessages.push('이메일 중복 확인이 완료되지 않았습니다.');
    }
    
    // 3. Step 1 확인 여부 (방어 로직)
    if (!isBizInfoVerified) {
        setBizVerificationError('사업자등록정보 진위 확인이 필요합니다.');
        isValid = false;
        errorMessages.push('사업자등록정보 진위 확인이 완료되지 않았습니다.');
    }
    
    if (!isValid) {
        const uniqueErrors = [...new Set(errorMessages)].filter(msg => msg.includes('입력되지 않았') || msg.includes('필요') || msg.includes(':')); 
        window.alert("파트너 등록을 완료하려면 아래 항목을 확인해주세요:\n\n" + uniqueErrors.join('\n'));
        return; 
    }

    // 유효성 검사 통과 시
    if (isValid) {
        setIsSubmitting(true);
        
        const partnerData = {
            email: contactEmail, 
            passwordHash: password, 
            name: bizName,  

            // Partner 상세 정보 (Step 2 입력 및 Step 1 전달 데이터)
            bizName,
            contactEmail,
            contactPhone: contactPhone.trim() || null, 
            bizRegNumber,
            ceoName,
            openingDate, 
        };

        try {
            // 💡 Placeholder 함수 호출
            const createdPartner = await createPartner(partnerData); 

            console.log('파트너 등록 성공:', createdPartner);
            window.alert('파트너 등록(회원가입)이 완료되었습니다! 로그인 페이지로 이동합니다.');
            
            navigate('/partner/login'); 
        } catch (error) {
            // Placeholder는 throw를 안 하므로 실행되지 않음. 실제 API 연동을 위해 구조 유지
            const errorMessage = error.response?.data?.message || error.message || '파트너 등록 중 알 수 없는 오류가 발생했습니다.';
            console.error('파트너 등록 중 예기치 않은 오류 발생:', error);
            window.alert(`등록 실패: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }
  };
    
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">파트너 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            
          {/* --- Step 1 확인 정보 요약 섹션 --- */}
          <div className="space-y-2 pt-2 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800"> 확인된 사업자 정보</h3>
              <p className="text-gray-700 text-sm">
                  **사업자등록번호**: {bizRegNumber} <br/>
                  **대표자 성명**: {ceoName} <br/>
                  **개업일자**: {openingDate}
              </p>
              {bizVerificationError && (
                  <p className={`text-sm mt-1 p-2 rounded-lg ${isBizInfoVerified ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
                      {bizVerificationError}
                  </p>
              )}
          </div>
          {/* --- Step 1 확인 정보 요약 섹션 끝 --- */}
          
          {/* 사업자명 (bizName) */}
          <div>
              <label htmlFor="bizName" className="form-label">사업자/회사 이름</label>
              <input
                  type="text"
                  id="bizName"
                  name="bizName"
                  value={bizName}
                  onChange={(e) => {
                      setBizName(e.target.value);
                      setBizNameError('');
                  }}
                  className={`form-input ${bizNameError && 'border-red-500'}`}
                  placeholder="예: TravelHub 파트너스"
                  required
                  disabled={isSubmitting}
              />
              {bizNameError && <p className="text-red-500 text-sm mt-1">{bizNameError}</p>}
          </div>
          
          {/* 비즈니스 이메일 (contactEmail) */}
          <div>
            <label htmlFor="contactEmail" className="form-label">비즈네스 이메일 (아이디)</label>
            <div className="flex space-x-2 items-center">
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={contactEmail}
                onChange={(e) => {
                    setContactEmail(e.target.value);
                    setIsEmailVerified(false); 
                    setEmailError('');
                }}
                onBlur={() => validateEmail(contactEmail)}
                className={`form-input flex-1 ${emailError && 'border-red-500'}`} 
                placeholder="파트너 연락용 이메일"
                required
                disabled={isSubmitting} 
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                // isEmailVerified가 true이면 비활성화됨
                disabled={!contactEmail || !!emailError || isSubmitting || isEmailVerified}
                className="bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 transition-colors duration-200 
                           rounded-lg font-medium text-sm flex-shrink-0 whitespace-nowrap flex items-center justify-center 
                           w-28 py-3 px-4 disabled:text-gray-600 disabled:opacity-100" 
              >
                {isSubmitting && emailError === '' ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {emailError && <p className={`text-sm mt-1 ${isEmailVerified && emailError === '사용 가능한 이메일입니다.' ? 'text-blue-500' : 'text-red-500'}`}>{emailError}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => validatePassword(password)}
              className={`form-input ${passwordError && 'border-red-500'}`}
              placeholder="영문, 숫자, 특수기호 포함 8~20자"
              required
              disabled={isSubmitting} 
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="passwordConfirm" className="form-label">비밀번호 확인</label>
            <input
              type="password"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={handlePasswordConfirmChange}
              onBlur={() => validatePasswordConfirm(passwordConfirm)}
              className={`form-input ${passwordConfirmError && 'border-red-500'}`}
              placeholder="비밀번호를 다시 입력하세요"
              required
              disabled={isSubmitting} 
            />
            {passwordConfirmError && <p className="text-red-500 text-sm mt-1">{passwordConfirmError}</p>}
          </div>
          
          {/* 대표 연락처 (contactPhone) */}
          <div>
            <label htmlFor="contactPhone" className="form-label">대표 연락처 (선택)</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="form-input"
              placeholder="예: 010-1234-5678"
              disabled={isSubmitting} 
            />
          </div>

          {/* 등록 버튼 */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={
                !isBizInfoVerified || isSubmitting // Step 1 확인 및 제출 상태 체크
            }
          >
            {isSubmitting ? '등록 중...' : '파트너 등록 및 회원가입'}
          </button>
        </form>
        
        {/* 로그인 페이지로 이동 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 파트너 계정이 있으신가요?{' '}
            <Link
              to="/partner/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}