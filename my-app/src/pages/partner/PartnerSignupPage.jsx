// PartnerSignupPage.jsx (Step 2)

import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { 
    createPartner, 
    checkPartnerEmailDuplication, 
    sendPartnerVerificationEmail, 
    verifyPartnerEmailCode        
} from '../../api/partnerAPI'; 

export default function PartnerSignupPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const verifiedBizData = location.state || {};

  const bizRegNumber = verifiedBizData.bizRegNumber || '';
  const ceoName = verifiedBizData.ceoName || '';
  const openingDate = verifiedBizData.openingDate || '';
  const isBizInfoVerified = verifiedBizData.isBizInfoVerified || false; 

  const [bizName, setBizName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [bizNameError, setBizNameError] = useState('');
  const [bizVerificationError, setBizVerificationError] = useState(''); 
  
  const [showAuthCodeInput, setShowAuthCodeInput] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authCodeError, setAuthCodeError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    if (!isBizInfoVerified) {
      console.warn('사업자 정보 진위 확인이 필요합니다. Step 1로 이동합니다.');
      navigate('/partner/bizverification', { replace: true }); 
    }
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
  
  const handleEmailCheck = async () => {
    if (!validateEmail(contactEmail)) {
        setIsEmailVerified(false); 
        setShowAuthCodeInput(false);
        return;
    }

    try {
        setIsSubmitting(true); 
        const isDuplicated = await checkPartnerEmailDuplication(contactEmail); 
        
        if (isDuplicated) { 
            setEmailError('이미 등록된 사업자 이메일입니다.'); 
            setIsEmailVerified(false);
            setShowAuthCodeInput(false);
        } else {
            await sendPartnerVerificationEmail(contactEmail);
            setEmailError('사용 가능한 이메일입니다. 인증번호를 발송했습니다.');
            setShowAuthCodeInput(true);
            setIsEmailVerified(false); // 코드를 확인해야만 true가 됨
            setAuthCodeError('');
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || '이메일 확인 중 오류가 발생했습니다.';
        console.error('이메일 확인 중 예기치 않은 오류 발생:', error);
        setEmailError(errorMsg);
        setIsEmailVerified(false);
        setShowAuthCodeInput(false);
    } finally {
        setIsSubmitting(false); 
    }
  };
  const handleVerifyCode = async () => {
    if (!authCode.trim()) {
      setAuthCodeError('인증번호를 입력해주세요.');
      return;
    }
    
    try {
      const isVerified = await verifyPartnerEmailCode(contactEmail, authCode);
      
      if (isVerified) {
        setIsEmailVerified(true);
        setAuthCodeError('');
        setShowAuthCodeInput(false);
        setEmailError('이메일 인증이 완료되었습니다.');
        window.alert('이메일 인증이 완료되었습니다.');
      } else {
        setIsEmailVerified(false);
        setAuthCodeError('인증번호가 올바르지 않습니다.');
      }
    } catch (error) {
      setIsEmailVerified(false);
      setAuthCodeError('인증번호 확인 중 오류가 발생했습니다.');
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
        
        // [수정] partnerData 객체를 Partner.java Entity 필드명과 100% 일치시킵니다.
        const partnerData = {
            // 'email'과 'name' 필드는 Partner.java에 없으므로 제거합니다.
            
            // Partner Entity 필드
            bizName,
            contactEmail,
            contactPhone: contactPhone.trim() || null, 
            bizRegNumber,
            ceoName,
            openingDate,
            passwordHash: password // React의 'password' state 값을 'passwordHash' key로 보냅니다.
        };

        try {
            // 💡 [수정] import한 API 함수를 호출합니다.
            const createdPartner = await createPartner(partnerData); 

            console.log('파트너 등록 성공:', createdPartner);
            window.alert('파트너 등록(회원가입)이 완료되었습니다! 로그인 페이지로 이동합니다.');
            
            navigate('/partner/login'); 
        } catch (error) {
            // partnerAPI.js에서 throw한 에러를 처리합니다.
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
                    setShowAuthCodeInput(false);
                    setAuthCode('');
                    setAuthCodeError('');
                }}
                onBlur={() => validateEmail(contactEmail)}
                className={`form-input flex-1 ${emailError && !isEmailVerified ? 'border-red-500' : ''} ${isEmailVerified ? 'border-green-500' : ''}`} 
                placeholder="파트너 연락용 이메일"
                required
                disabled={isSubmitting || showAuthCodeInput || isEmailVerified} // [수정] 인증 중/완료 시 비활성화
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={!contactEmail || !!emailError || isSubmitting || isEmailVerified || showAuthCodeInput} // [수정]
                className="bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 transition-colors duration-200 
                           rounded-lg font-medium text-sm flex-shrink-0 whitespace-nowrap flex items-center justify-center 
                           w-28 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed" // [수정] disabled 스타일 변경
              >
                {isEmailVerified ? "인증 완료" : (isSubmitting && emailError === '' ? '확인 중...' : '중복 확인')}
              </button>
            </div>
            {emailError && (
                <p className={`text-sm mt-1 ${isEmailVerified ? 'text-green-500' : (emailError === '사용 가능한 이메일입니다. 인증번호를 발송했습니다.' ? 'text-blue-500' : 'text-red-500')}`}>
                    {emailError}
                </p>
            )}
          </div>

          {showAuthCodeInput && (
            <div>
              <label htmlFor="authCode" className="form-label">인증번호</label>
              <div className="flex space-x-2">
                <input
                  id="authCode"
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className={`form-input flex-1 ${authCodeError ? 'border-red-500' : ''}`}
                  placeholder="이메일로 전송된 6자리 숫자"
                  maxLength={6}
                />
                <button 
                  type="button" 
                  onClick={handleVerifyCode} 
                  className="w-28 bg-blue-500 text-white hover:bg-blue-600 font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                >
                  번호 확인
                </button>
              </div>
              {authCodeError && (
                <p className="text-sm mt-1 text-red-500">
                  {authCodeError}
                </p>
              )}
            </div>
          )}

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