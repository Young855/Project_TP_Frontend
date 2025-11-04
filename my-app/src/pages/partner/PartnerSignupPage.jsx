import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 

// ⚠️ 빌드 오류 해결: '../../api/partnerAPI' 모듈을 찾을 수 없어 모의(Mock) 함수로 대체합니다.
// 실제 API 로직을 사용할 때는 아래 함수들을 원래의 import 문으로 교체해 주세요.
const createPartner = async (data) => {
    console.log("MOCK API CALL: createPartner called with data:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // 성공 응답 시뮬레이션
    return { success: true, partnerId: 'P12345', ...data };
};

const checkPartnerEmailDuplication = async (email) => {
    console.log("MOCK API CALL: checkPartnerEmailDuplication called for email:", email);
    await new Promise(resolve => setTimeout(resolve, 500));
    // 'test@example.com'은 중복으로 가정
    return email === 'test@example.com'; 
};

/**
 * 파트너 등록 페이지 (PartnerSignupPage)
 */
export default function PartnerSignupPage() {
  const navigate = useNavigate();

  // Partner 엔티티 필드 기반 상태
  const [bizName, setBizName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [password, setPassword] = useState(''); // User 계정 생성을 위한 비밀번호
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // ⬇️ 스크린샷 기반으로 추가된 필수 필드 상태
  const [bizRegNumber, setBizRegNumber] = useState(''); // 사업자등록번호 (10자리 숫자)
  const [ceoName, setCeoName] = useState('');           // 대표자 성명
  const [openingDate, setOpeningDate] = useState('');   // 개업일자 (YYYYMMDD)

  // 에러 및 검증 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [bizNameError, setBizNameError] = useState('');
  
  // ⬇️ 추가된 필수 필드 에러 상태
  const [bizRegNumberError, setBizRegNumberError] = useState('');
  const [ceoNameError, setCeoNameError] = useState('');
  const [openingDateError, setOpeningDateError] = useState('');
  const [bizVerificationError, setBizVerificationError] = useState(''); // 국세청 API 검증 에러
  
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 중복 확인 여부
  // ⬇️ 사업자 정보 API 검증 상태
  const [isBizInfoVerified, setIsBizInfoVerified] = useState(false); // 사업자 정보 API 확인 여부

  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 및 API 호출 상태

  /* --- 유효성 검사 함수 --- */
  
  const validatePassword = (currentPassword) => {
    // 영문 대/소문자, 숫자, 특수기호 포함 8~20자 정규식
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
  
  // ⬇️ 사업자등록번호 유효성 검사
  const validateBizRegNumber = (number) => {
      // 숫자 10자리만 허용
      const cleanedNumber = number.replace(/-/g, '').trim(); // '-' 제거
      const regex = /^\d{10}$/;
      if (!regex.test(cleanedNumber)) {
          setBizRegNumberError('사업자등록번호는 숫자 10자리여야 합니다.');
          return false;
      }
      setBizRegNumberError('');
      return true;
  };

  // ⬇️ 개업일자 유효성 검사
  const validateOpeningDate = (date) => {
      // YYYYMMDD 포맷
      const cleanedDate = date.replace(/-/g, '').trim(); // '-' 제거
      const regex = /^\d{8}$/;
      if (!regex.test(cleanedDate)) {
          setOpeningDateError('개업일자는 YYYYMMDD 형식의 8자리 숫자여야 합니다.');
          return false;
      }
      setOpeningDateError('');
      return true;
  };

  /* --- 중복 확인 핸들러 (partnerAPI.js 사용) --- */

  const handleEmailCheck = async () => {
    if (!validateEmail(contactEmail)) return;

    try {
        setIsSubmitting(true); 

        // API 호출 시뮬레이션
        const isDuplicated = await checkPartnerEmailDuplication(contactEmail); 

        if (isDuplicated) {
            setEmailError('이미 등록된 사업자 이메일입니다.');
            setIsEmailVerified(false);
        } else {
            setEmailError('사용 가능한 이메일입니다.');
            setIsEmailVerified(true);
        }
    } catch (error) {
        console.error('이메일 중복 확인 API 오류:', error);
        setEmailError('중복 확인 중 오류가 발생했습니다.');
        setIsEmailVerified(false);
    } finally {
        setIsSubmitting(false); 
    }
  };
  
  /* --- ⬇️ 국세청 사업자 등록 정보 API 호출 Placeholder --- */
  
  // 국세청 API Base URL: api.odcloud.kr/api/nts-businessman/v1/...
  const checkBizInfo = async () => {
      // 1. 필수 필드 검사
      let isValid = true;
      if (!validateBizRegNumber(bizRegNumber)) isValid = false;
      if (ceoName.trim() === '') { setCeoNameError('대표자 성명을 입력해주세요.'); isValid = false; } else { setCeoNameError(''); }
      if (!validateOpeningDate(openingDate)) isValid = false;
      
      if (!isValid) {
          setBizVerificationError('사업자 정보 필수 항목을 정확히 입력해주세요.');
          return;
      }
      
      setBizVerificationError('');
      setIsSubmitting(true);
      
      // ⚠️ 실제 API 호출 로직 Placeholder
      console.log('--- 국세청 사업자 정보 진위 확인 API 호출 시도 ---');
      console.log('사업자번호:', bizRegNumber.replace(/-/g, ''));
      console.log('대표자성명:', ceoName);
      console.log('개업일자:', openingDate.replace(/-/g, ''));
      
      try {
          // TODO: 실제 API 키와 URL을 사용하여 axios 호출 구현 필요
          // const response = await axios.post(
          //     'http://api.odcloud.kr/api/nts-businessman/v1/status', 
          //     { b_no: [bizRegNumber.replace(/-/g, '')], ... }, // 요청 형식 맞춤
          //     { params: { serviceKey: 'YOUR_SERVICE_KEY' } }
          // );
          
          await new Promise(resolve => setTimeout(resolve, 1500)); // API 호출 시뮬레이션
          
          // 2. 결과 처리 (API 응답을 가정)
          const mockSuccess = Math.random() > 0.3; // 70% 확률로 성공 가정
          
          if (mockSuccess) {
              setBizVerificationError('사업자 정보가 확인되었습니다.');
              setIsBizInfoVerified(true);
          } else {
              setBizVerificationError('국세청에 등록되지 않은 사업자 정보입니다. 정보를 확인해주세요.'); 
              setIsBizInfoVerified(false);
          }
          
      } catch (error) {
          console.error('국세청 API 호출 오류:', error);
          setBizVerificationError('사업자 정보 확인 중 오류가 발생했습니다.');
          setIsBizInfoVerified(false);
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


  /* --- 최종 제출 핸들러 --- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // 중복 제출 방지

    let isValid = true;
    let errorMessages = []; // 모든 에러 메시지를 수집할 배열

    // 1. 필수 필드 및 유효성 검사 (필수 입력값 누락 검사 포함)
    if (bizName.trim() === '') { setBizNameError('사업자명을 입력해주세요.'); isValid = false; errorMessages.push('사업자/회사 이름이 입력되지 않았습니다.'); } else { setBizNameError(''); } 
    if (!validateEmail(contactEmail)) { isValid = false; if(emailError) errorMessages.push(`이메일: ${emailError}`); }
    if (!validatePassword(password)) { isValid = false; if(passwordError) errorMessages.push(`비밀번호: ${passwordError}`); }
    if (!validatePasswordConfirm(passwordConfirm)) { isValid = false; if(passwordConfirmError) errorMessages.push(`비밀번호 확인: ${passwordConfirmError}`); }
    
    // 2. 추가된 필수 필드 검사 및 유효성
    if (!validateBizRegNumber(bizRegNumber)) { isValid = false; if(bizRegNumberError) errorMessages.push(`사업자등록번호: ${bizRegNumberError}`); }
    if (ceoName.trim() === '') { setCeoNameError('대표자 성명을 입력해주세요.'); isValid = false; errorMessages.push('대표자 성명이 입력되지 않았습니다.'); } else { setCeoNameError(''); }
    if (!validateOpeningDate(openingDate)) { isValid = false; if(openingDateError) errorMessages.push(`개업일자: ${openingDateError}`); }

    // 3. 이메일 및 사업자 정보 확인 여부
    if (validateEmail(contactEmail) && !isEmailVerified) {
        setEmailError('이메일 중복 확인이 필요합니다.');
        isValid = false;
        errorMessages.push('이메일 중복 확인이 완료되지 않았습니다.');
    }
    // 국세청 API 검증 필수화
    if (!isBizInfoVerified) { // isValid 체크를 밖으로 빼고 필수 확인 항목으로만 처리
        setBizVerificationError('사업자등록정보 진위 확인이 필요합니다.');
        isValid = false;
        errorMessages.push('사업자등록정보 진위 확인이 완료되지 않았습니다.');
    }
    
    if (!isValid) {
        // 에러들을 모아서 alert 창으로 띄우기 (사용자 요청: alert 유지)
        const uniqueErrors = [...new Set(errorMessages)].filter(msg => msg.includes('입력되지 않았') || msg.includes('필요') || msg.includes(':')); 
        window.alert("파트너 등록을 완료하려면 아래 항목을 확인해주세요:\n\n" + uniqueErrors.join('\n'));
        return; // 유효성 검사 실패 시 제출 중단
    }

    // 유효성 검사 통과 시
    if (isValid) {
        setIsSubmitting(true);
        
        // PartnerDTO에 필요한 데이터 구성
        const partnerData = {
            // User 엔티티에 필요한 정보
            email: contactEmail, 
            passwordHash: password, 
            name: bizName, 
            role: 'ROLE_PARTNER', 

            // Partner 상세 정보 (수정된 DTO 필드 반영)
            bizName,
            contactEmail,
            contactPhone: contactPhone.trim() || null, 
            
            // ⬇️ 추가된 필수 필드 데이터
            bizRegNumber: bizRegNumber.replace(/-/g, '').trim(), // 하이픈 제거 후 전송
            ceoName,
            openingDate: openingDate.replace(/-/g, '').trim(), // 하이픈 제거 후 전송
        };

        try {
            // API 호출 시뮬레이션
            const createdPartner = await createPartner(partnerData); 

            console.log('파트너 등록 성공:', createdPartner);
            // alert() 유지
            window.alert('파트너 등록(회원가입)이 완료되었습니다! 로그인 페이지로 이동합니다.');
            
            navigate('/partner/login'); // 파트너 로그인 페이지로 이동
        } catch (error) {
            // AxiosError 처리
            const errorMessage = error.response?.data?.message || error.message || '파트너 등록 중 알 수 없는 오류가 발생했습니다.';
            console.error('파트너 등록 API 호출 오류:', error);
            // alert() 유지
            window.alert(`등록 실패: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }
  };
    

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">파트너 등록 (Partner Signup)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
                // 이메일은 계속 입력 가능
                className={`form-input flex-1 ${emailError && 'border-red-500'}`} 
                placeholder="파트너 연락용 이메일"
                required
                disabled={isSubmitting} 
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                // 이메일 중복 확인 버튼은 계속 사용 가능
                disabled={!contactEmail || !!emailError || isSubmitting || isEmailVerified}
                // 💡 스타일 개선: 입력 필드 높이와 일치시키기 위해 Tailwind 유틸리티 조합 사용
                className="bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 transition-colors duration-200 
                           rounded-lg font-medium text-sm flex-shrink-0 whitespace-nowrap flex items-center justify-center 
                           w-28 py-3 px-4 disabled:text-gray-600 disabled:opacity-100" 
              >
                {isSubmitting && emailError === '' ? '확인 중...' : '중복 확인'}
              </button>
            </div>
            {emailError && <p className={`text-sm mt-1 ${isEmailVerified && emailError === '사용 가능한 이메일입니다.' ? 'text-blue-500' : 'text-red-500'}`}>{emailError}</p>}
          </div>

          {/* 비밀번호 (User 계정 생성용) */}
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
              // 💡 수정 완료: 사업자 정보 확인 후에도 입력 가능해야 함
              disabled={isSubmitting} 
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

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
              // 💡 수정 완료: 사업자 정보 확인 후에도 입력 가능해야 함
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
              // 💡 수정 완료: 사업자 정보 확인 후에도 입력 가능해야 함
              disabled={isSubmitting} 
            />
          </div>
          
          {/* --- ⬇️ 국세청 사업자 등록 정보 필드 및 검증 섹션 --- */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">필수 사업자 정보 확인</h3>
              
              {/* 사업자등록번호 (bizRegNumber) - 확인 후 입력 불가 유지 */}
              <div>
                  <label htmlFor="bizRegNumber" className="form-label">사업자등록번호 (필수)</label>
                  <input
                      type="text"
                      id="bizRegNumber"
                      name="bizRegNumber"
                      value={bizRegNumber}
                      onChange={(e) => {
                          setBizRegNumber(e.target.value);
                          setBizRegNumberError('');
                          setIsBizInfoVerified(false); // 값 변경 시 확인 상태 초기화
                      }}
                      onBlur={() => validateBizRegNumber(bizRegNumber)}
                      className={`form-input ${bizRegNumberError && 'border-red-500'}`}
                      placeholder="하이픈 제외 10자리 숫자"
                      required
                      maxLength={10} // 10자리
                      disabled={isSubmitting || isBizInfoVerified} // 유지
                  />
                  {bizRegNumberError && <p className="text-red-500 text-sm mt-1">{bizRegNumberError}</p>}
              </div>

              {/* 대표자 성명 (ceoName) - 확인 후 입력 불가 유지 */}
              <div>
                  <label htmlFor="ceoName" className="form-label">대표자 성명 (필수)</label>
                  <input
                      type="text"
                      id="ceoName"
                      name="ceoName"
                      value={ceoName}
                      onChange={(e) => {
                          setCeoName(e.target.value);
                          setCeoNameError('');
                          setIsBizInfoVerified(false);
                      }}
                      className={`form-input ${ceoNameError && 'border-red-500'}`}
                      placeholder="대표자 한글/영문 성명"
                      required
                      disabled={isSubmitting || isBizInfoVerified} // 유지
                  />
                  {ceoNameError && <p className="text-red-500 text-sm mt-1">{ceoNameError}</p>}
              </div>

              {/* 개업일자 (openingDate) - 확인 후 입력 불가 유지 */}
              <div>
                  <label htmlFor="openingDate" className="form-label">개업일자 (필수)</label>
                  <input
                      type="text"
                      id="openingDate"
                      name="openingDate"
                      value={openingDate}
                      onChange={(e) => {
                          setOpeningDate(e.target.value);
                          setOpeningDateError('');
                          setIsBizInfoVerified(false);
                      }}
                      onBlur={() => validateOpeningDate(openingDate)}
                      className={`form-input ${openingDateError && 'border-red-500'}`}
                      placeholder="YYYYMMDD 형식"
                      required
                      maxLength={8}
                      disabled={isSubmitting || isBizInfoVerified} // 유지
                  />
                  {openingDateError && <p className="text-red-500 text-sm mt-1">{openingDateError}</p>}
              </div>
              
              {/* 사업자 정보 확인 버튼 */}
              <button
                  type="button"
                  onClick={checkBizInfo}
                  disabled={isSubmitting || isBizInfoVerified}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md 
                      ${isBizInfoVerified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'}
                  `}
                  // NOTE: index.css에 btn-primary가 있지만, 이 버튼은 동적 색상 로직이므로 인라인 Tailwind 클래스 유지
              >
                  {isSubmitting ? '정보 확인 중...' : isBizInfoVerified ? '정보 확인 완료' : '사업자등록정보 진위 확인'}
              </button>
              
              {/* 사업자 확인 결과 메시지 */}
              {bizVerificationError && (
                  <p className={`text-sm mt-1 p-2 rounded-lg ${isBizInfoVerified ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
                      {bizVerificationError}
                  </p>
              )}
          </div>
          {/* --- ⬆️ 국세청 사업자 등록 정보 필드 및 검증 섹션 --- */}

          {/* 등록 버튼 */}
          <button
            type="submit"
            // NOTE: index.css에 정의된 btn-primary 클래스 사용
            className="btn-primary w-full"
            // 💡 수정: 모든 필수 필드 및 확인 상태를 체크하여 disabled 여부 결정
            disabled={
                !isBizInfoVerified  // 사업자 정보 확인 필수
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

      {/* R002: index.css에 있는 클래스가 이미 로드되어 있다고 가정하고,
          이 파일에 불필요한 인라인 <style> 블록은 제거했습니다. 
      */}
    </div>
  );
}
