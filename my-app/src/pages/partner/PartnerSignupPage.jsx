// src/pages/partner/PartnerSignupPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
// import 경로가 올바른지 확인: src/pages/partner/ 에서 src/api/ 로 이동
import { createPartner, checkPartnerEmailDuplication } from '../../api/partnerAPI';

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
  
  // 에러 및 검증 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [bizNameError, setBizNameError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 중복 확인 여부

  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태

  /* --- 유효성 검사 함수 (SignupPage와 동일) --- */
  
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

  /* --- 중복 확인 핸들러 (partnerAPI.js 사용) --- */

  const handleEmailCheck = async () => {
    if (!validateEmail(contactEmail)) return;

    try {
        // 버튼 클릭 중복 방지를 위한 로딩 상태
        setIsSubmitting(true); 

        const isDuplicated = await checkPartnerEmailDuplication(contactEmail); // API 호출

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

  // 비밀번호 입력 핸들러 (SignupPage와 동일)
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length > 0 && passwordError) { setPasswordError(''); }
    if (passwordConfirm.length > 0) { validatePasswordConfirm(passwordConfirm); }
  };

  // 비밀번호 확인 입력 핸들러 (SignupPage와 동일)
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

    // 1. 필수 필드 검사
    if (bizName.trim() === '') { setBizNameError('사업자명을 입력해주세요.'); isValid = false; } else { setBizNameError(''); } // onBlur가 없으므로 여기서 바로 처리
    if (!validateEmail(contactEmail)) isValid = false;
    if (!validatePassword(password)) isValid = false;
    if (!validatePasswordConfirm(passwordConfirm)) isValid = false;

    // 2. 이메일 중복 확인 여부
    if (validateEmail(contactEmail) && !isEmailVerified) {
        setEmailError('이메일 중복 확인이 필요합니다.');
        isValid = false;
    }
    
    if (isValid) {
        setIsSubmitting(true);
        
        // PartnerDTO에 필요한 최소 데이터 구성
        const partnerData = {
            // 백엔드에서 User와 Partner를 동시에 처리하는 엔드포인트(/partner/signup)를 가정하고,
            // User 엔티티에 필요한 이메일, 비밀번호, 역할, 그리고 Partner 엔티티에 필요한 정보를 함께 보냅니다.
            email: contactEmail, 
            passwordHash: password, // 비밀번호
            name: bizName, // User의 이름으로 사업자명을 사용 (임시)
            role: 'ROLE_PARTNER', 

            // Partner 상세 정보
            bizName,
            contactEmail,
            contactPhone: contactPhone.trim() || null, 
        };

        try {
            const createdPartner = await createPartner(partnerData); // API 호출

            console.log('파트너 등록 성공:', createdPartner);
            alert('파트너 등록(회원가입)이 완료되었습니다! 로그인 페이지로 이동합니다.');
            
            navigate('/login'); // 로그인 페이지로 이동 (TODO: 실제 경로로 수정)
        } catch (error) {
            // AxiosError 처리 (500 Internal Server Error 또는 400 Bad Request 등)
            const errorMessage = error.response?.data?.message || error.message || '파트너 등록 중 알 수 없는 오류가 발생했습니다.';
            console.error('파트너 등록 API 호출 오류:', error);
            // 사용자에게 오류 메시지 표시
            alert(`등록 실패: ${errorMessage}`);
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
          <div>
            <label htmlFor="contactEmail" className="form-label">담당자 이메일 (아이디)</label>
            <div className="flex space-x-2">
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={contactEmail}
                onChange={(e) => {
                    setContactEmail(e.target.value);
                    setIsEmailVerified(false); // 이메일 변경 시 중복 확인 초기화
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
                disabled={!contactEmail || emailError === '유효한 이메일 주소를 입력해주세요.' || isSubmitting || isEmailVerified}
                className="btn-secondary w-28"
              >
                {isSubmitting ? '확인 중...' : '중복 확인'}
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
              disabled={isSubmitting}
            />
            {passwordConfirmError && <p className="text-red-500 text-sm mt-1">{passwordConfirmError}</p>}
          </div>
          
          {/* 연락처 (contactPhone) */}
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
          
          <input type="hidden" name="role" value="partner" /> 

          {/* 등록 버튼 */}
          <button
            type="submit"
            className="btn-primary w-full"
            // isSubmitting: 중복 클릭 방지 (API 호출 중)
            // !isEmailVerified: 이메일 중복 확인 필수
            // bizNameError || emailError || passwordError || passwordConfirmError: 입력 오류 시 제출 불가
            disabled={isSubmitting || !isEmailVerified || bizName.trim() === '' || !!emailError || !!passwordError || !!passwordConfirmError}
          >
            {isSubmitting ? '등록 중...' : '파트너 등록 및 회원가입'}
          </button>
        </form>
        
        {/* 로그인 페이지로 이동 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 파트너 계정이 있으신가요?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>

      {/* R002: 커스텀 스타일 (SignupPage.jsx에서 복사하여 재사용) */}
      <style>{`
        .form-label {
          display: block;
          font-size: 0.875rem; /* text-sm */
          font-weight: 500; /* font-medium */
          color: #1F2937; /* text-gray-700 */
          margin-bottom: 0.5rem;
        }
        .form-input, .form-select {
          display: block;
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #D1D5DB; /* border-gray-300 */
          border-radius: 0.5rem; /* rounded-lg */
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #3B82F6; /* focus:border-blue-500 */
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); /* focus:ring-blue-500/30 */
        }
        .btn-primary {
          padding: 0.75rem 1rem;
          background-color: #3B82F6; /* bg-blue-600 */
          color: white;
          font-weight: 600;
          border-radius: 0.5rem;
          transition: background-color 0.15s ease-in-out;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #2563EB; /* hover:bg-blue-700 */
        }
        .btn-primary:disabled {
          background-color: #9CA3AF; /* disabled:bg-gray-400 */
          cursor: not-allowed;
        }
        .btn-secondary {
            padding: 0.75rem 1rem;
            background-color: #F3F4F6; /* bg-gray-100 */
            color: #1F2937; /* text-gray-800 */
            font-weight: 500;
            border-radius: 0.5rem;
            border: 1px solid #D1D5DB;
            transition: background-color 0.15s ease-in-out;
        }
        .btn-secondary:hover:not(:disabled) {
            background-color: #E5E7EB; /* hover:bg-gray-200 */
        }
        .btn-secondary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .form-radio {
            color: #3B82F6;
        }
      `}</style>
    </div>
  );
}
