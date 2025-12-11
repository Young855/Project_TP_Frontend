import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    createPartner, 
    checkPartnerEmailDuplication, 
} from '../../api/partnerAPI'; 

const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

export default function PartnerSignupPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const verifiedBizData = location.state || {};

  const bizRegNumber = verifiedBizData.bizRegNumber || '';
  const ceoName = verifiedBizData.ceoName || '';
  const openingDate = verifiedBizData.openingDate || '';
  const isBizInfoVerified = verifiedBizData.isBizInfoVerified || false; 
  const initialVerifiedEmail = verifiedBizData.contactEmail || ''; 

  // [수정 1] 불필요한 좌표/도시 State 삭제, 주소만 남김
  const [addressFull, setAddressFull] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [bizName, setBizName] = useState('');
  const [contactEmail, setContactEmail] = useState(initialVerifiedEmail); 
  const [password, setPassword] = useState(''); 
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [bizNameError, setBizNameError] = useState('');
  const [bizVerificationError, setBizVerificationError] = useState(''); 
  const [isEmailVerified, setIsEmailVerified] = useState(!!initialVerifiedEmail); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    if (!!initialVerifiedEmail) {
        setIsEmailVerified(true);
    }
    
    if (!isBizInfoVerified) {
      console.warn('사업자 정보 진위 확인이 필요합니다. Step 1로 이동합니다.');
      navigate('/partner/bizverification', { replace: true }); 
    }
    if (isBizInfoVerified) {
        setBizVerificationError('사업자 정보 진위 확인이 완료되었습니다.');
    }
  }, [isBizInfoVerified, navigate, initialVerifiedEmail]);


  /* --- 유효성 검사 함수 --- */
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

  const handleAddressSearch = async () => {
    if (!KAKAO_API_KEY) {
        setErrMsg("Kakao API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
        return;
    }
    
    if (addressFull.trim() === '') {
        setErrMsg('주소를 입력한 후 검색 버튼을 눌러주세요.');   
        return;
    }

    try {
        const response = await axios.get(
            'https://dapi.kakao.com/v2/local/search/address.json',
            {
                params: { query: addressFull },
                headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
            }
        );

        if (response.data.documents.length > 0) {
            const firstResult = response.data.documents[0];
            
            const fullAddr = firstResult.road_address
                           ? firstResult.road_address.address_name 
                           : firstResult.address.address_name;
            
            // [수정 2] 좌표, 도시 저장 로직 제거 -> 오직 주소 문자열만 저장
            setAddressFull(fullAddr); 
            setErrMsg(""); 

        } else {
            setErrMsg('검색 결과가 없습니다. 주소를 확인해주세요.');
        }

    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        setErrMsg('API 호출 중 오류가 발생했습니다.');
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
        return;
    }
    if (isEmailVerified) {
        window.alert('이미 확인이 완료된 이메일입니다.');
        return;
    }

    try {
        setIsSubmitting(true); 
        const duplicationResponse = await checkPartnerEmailDuplication(contactEmail);
        const isDuplicated = duplicationResponse.isDuplicated; 
        
        if (isDuplicated) { 
            setEmailError('이미 등록된 사업자 이메일입니다.'); 
            setIsEmailVerified(false);
        } else {
            setEmailError('사용 가능한 이메일입니다.');
            setIsEmailVerified(true); 
            window.alert('사용 가능한 이메일입니다.');
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || '이메일 확인 중 오류가 발생했습니다.';
        console.error('이메일 확인 중 예기치 않은 오류 발생:', error);
        setEmailError(errorMsg);
        setIsEmailVerified(false);
        window.alert(`이메일 확인 실패: ${errorMsg}`);
    } finally {
        setIsSubmitting(false); 
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length > 0 && passwordError) { setPasswordError(''); }
    if (passwordConfirm.length > 0) { validatePasswordConfirm(passwordConfirm); }
  };

  const handlePasswordConfirmChange = (e) => {
    const newPasswordConfirm = e.target.value;
    setPasswordConfirm(newPasswordConfirm);
    if (newPasswordConfirm.length > 0 && passwordConfirmError) { setPasswordConfirmError(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isBizInfoVerified) return;

    let isValid = true;
    let errorMessages = [];

    if (bizName.trim() === '') { setBizNameError('사업자명을 입력해주세요.'); isValid = false; errorMessages.push('사업자/회사 이름이 입력되지 않았습니다.'); } else { setBizNameError(''); } 
    if (!validateEmail(contactEmail)) { isValid = false; if(emailError) errorMessages.push(`이메일: ${emailError}`); }
    if (!validatePassword(password)) { isValid = false; if(passwordError) errorMessages.push(`비밀번호: ${passwordError}`); }
    if (!validatePasswordConfirm(passwordConfirm)) { isValid = false; if(passwordConfirmError) errorMessages.push(`비밀번호 확인: ${passwordConfirmError}`); }
    
    if (validateEmail(contactEmail) && !isEmailVerified) {
        setEmailError('이메일 중복 확인이 완료되지 않았습니다.');
        isValid = false;
        errorMessages.push('이메일 중복 확인이 완료되지 않았습니다.');
    }
    
    if (!isBizInfoVerified) {
        setBizVerificationError('사업자등록정보 진위 확인이 필요합니다.');
        isValid = false;
        errorMessages.push('사업자등록정보 진위 확인이 완료되지 않았습니다.');
    }
    
    if (!isValid) {
        const uniqueErrors = [...new Set(errorMessages)].filter(msg => msg.includes('입력되지 않았') || msg.includes('필수') || msg.includes(':')); 
        window.alert("파트너 등록을 완료하려면 아래 항목을 확인해주세요:\n\n" + uniqueErrors.join('\n'));
        return; 
    }

    if (isValid) {
        setIsSubmitting(true);
        
       const partnerData = {
            bizName,
            contactEmail,
            contactPhone: contactPhone.trim() || null, 
            bizRegNumber,
            ceoName,
            openingDate,
            passwordHash: password,
            businessAddress: addressFull // 주소만 전송
        };

        try {
            const createdPartner = await createPartner(partnerData); 
            console.log('파트너 등록 성공:', createdPartner);
            window.alert('파트너 등록(회원가입)이 완료되었습니다! 로그인 페이지로 이동합니다.');
            navigate('/partner/login'); 
        } catch (error) {
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
            <label htmlFor="contactEmail" className="form-label">비즈니스 이메일 (아이디)</label>
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
                className={`form-input flex-1 ${emailError && !isEmailVerified ? 'border-red-500' : ''} ${isEmailVerified ? 'border-green-500' : ''}`} 
                placeholder="파트너 연락용 이메일"
                required
                disabled={isSubmitting || isEmailVerified}
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={!contactEmail || !!emailError || isSubmitting || isEmailVerified} 
                className="bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 transition-colors duration-200 
                           rounded-lg font-medium text-sm flex-shrink-0 whitespace-nowrap flex items-center justify-center 
                           w-28 py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed" 
              >
                {isEmailVerified ? "확인 완료" : (isSubmitting ? '확인 중...' : '중복 확인')}
              </button>
            </div>
            
            {emailError && (
                <p className={`text-sm mt-1 ${isEmailVerified ? 'text-green-500' : 'text-red-500'}`}>
                    {emailError}
                </p>
            )}
            {isEmailVerified && !emailError && (
                <p className="text-sm mt-1 text-green-500">
                    사용 가능한 이메일입니다.
                </p>
            )}
          </div>

            <div>
                <label className="form-label">사업자 주소</label>
                <div className="flex space-x-2">
                    <input 
                        type="text"
                        name="address"
                        value={addressFull} 
                        onChange={(e) => setAddressFull(e.target.value)}
                        className="form-input flex-1"
                        placeholder="도로명 주소를 입력하거나 '주소 검색'을 이용하세요" 
                        maxLength={255}
                        required
                    />
                    <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="btn-secondary-outline whitespace-nowrap" 
                    >
                        주소 검색
                    </button>
                </div>
                {errMsg && (
                    <p className="text-sm text-red-500 mt-1">{errMsg}</p>
                )}
            </div>

            {/* [수정 3] 도시 입력창 및 Hidden 좌표값 Input 삭제 */}

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

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={
                !isBizInfoVerified || !isEmailVerified || isSubmitting
            }
          >
            {isSubmitting ? '등록 중...' : '파트너 등록 및 회원가입'}
          </button>
        </form>
        
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