import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  createUser, 
  checkEmailDuplication, 
  checkNicknameDuplication,
} from '../../api/userAPI';
import BirthDatePicker from '../../components/BirthDataPicker'; 

export default function SignupPage() {
  const navigate = useNavigate();
  const { showModal } = useOutletContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false); 
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);

  const validateEmail = (currentEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!currentEmail.trim()) {
      setEmailError('이메일 주소를 입력해주세요.');
      return false;
    }
    if (!emailRegex.test(currentEmail)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (currentPassword) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!currentPassword) {
      setPasswordError('비밀번호를 입력해주세요.');
      return false;
    }
    if (!passwordRegex.test(currentPassword)) {
      setPasswordError(
        '영문 대/소문자, 숫자, 특수기호(@$!%*?&)를 포함해 8~20자로 입력해주세요.'
      );
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validatePasswordConfirm = (currentPasswordConfirm) => {
    if (!currentPasswordConfirm) {
      setPasswordConfirmError('비밀번호 확인을 입력해주세요.');
      return false;
    }
    if (currentPasswordConfirm !== password) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setPasswordConfirmError('');
    return true;
  };

  const validateNickname = (currentNickname) => {
    if (!currentNickname.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      setIsNicknameVerified(false);
      return false;
    }
    setNicknameError('');
    return true;
  };

  const handleEmailCheck = async () => {
    if (!validateEmail(email)) {
      setIsEmailVerified(false); 
      return;
    }

    try {
      const duplicationResponse = await checkEmailDuplication(email);
      const isDuplicated = duplicationResponse.isDuplicated;
      
      if (isDuplicated) {
        setEmailError('이미 사용 중인 이메일입니다.');
        setIsEmailVerified(false);
        showModal('이메일 중복 확인', '이미 사용 중인 이메일입니다.', () => {});
      } else {
        // [수정] 중복이 아니면 인증번호 발송이나 페이지 이동 없이, 사용 가능 상태로 변경
        setEmailError(''); 
        setIsEmailVerified(true); 
        showModal('이메일 중복 확인', '사용 가능한 이메일입니다.', () => {});
      }
    } catch (error) {
      setEmailError('이메일 확인 중 오류가 발생했습니다.');
      setIsEmailVerified(false);
      showModal('오류', '이메일 확인 중 오류가 발생했습니다. 다시 시도해주세요.', () => {});
    }
  };

  // ❌ handleVerifyCode 함수 제거

  const handleNicknameCheck = async () => {
    if (!validateNickname(nickname)) {
      setIsNicknameVerified(false);
      return;
    }

    try {
      const isDuplicated = await checkNicknameDuplication(nickname);
      
      if (isDuplicated) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        setIsNicknameVerified(false);
        showModal('닉네임 중복 확인', '이미 사용 중인 닉네임입니다.', () => {});
      } else {
        setNicknameError(''); 
        setIsNicknameVerified(true);
        showModal('닉네임 중복 확인', '사용 가능한 닉네임입니다.', () => {});
      }
    } catch (error) {
      setNicknameError('닉네임 중복 확인 중 오류가 발생했습니다.');
      setIsNicknameVerified(false);
      showModal('오류', '닉네임 확인 중 오류가 발생했습니다. 다시 시도해주세요.', () => {});
    }
  };

  const onEmailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailVerified(false);
    setEmailError('');
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    if (passwordConfirm.length > 0) validatePasswordConfirm(passwordConfirm); 
  };
  const onPasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);
    if (passwordConfirmError) setPasswordConfirmError('');
    validatePasswordConfirm(e.target.value);
  };
  const onNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsNicknameVerified(false);
    setNicknameError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    const requiredChecks = [];
    const validationErrors = {};

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPasswordConfirmValid = validatePasswordConfirm(passwordConfirm);
    const isNicknameInputValid = validateNickname(nickname);

    
    // 1. 이메일 유효성 및 중복 확인 완료 여부
    if (!isEmailValid) {
      isValid = false;
      validationErrors['이메일 주소'] = emailError || '필수 입력';
    } else if (!isEmailVerified) {
      isValid = false;
      requiredChecks.push('이메일 중복 확인'); // 인증 대신 중복 확인 요구
    }

    // 2. 비밀번호 확인
    if (!isPasswordValid) {
      isValid = false;
      validationErrors['비밀번호'] = passwordError || '필수 입력';
    }
    if (!isPasswordConfirmValid) {
      isValid = false;
      validationErrors['비밀번호 확인'] = passwordConfirmError || '필수 입력';
    }

    // 3. 닉네임 확인
    if (!isNicknameInputValid) {
      isValid = false;
      validationErrors['닉네임'] = nicknameError || '필수 입력';
    } else if (!isNicknameVerified) {
      isValid = false;
      requiredChecks.push('닉네임 중복 확인');
    }

    // 4. 생년월일 확인
    if (!birthYear || !birthMonth || !birthDay) {
       requiredChecks.push('생년월일');
    }

    if (!isValid) {
      let alertMessage = '회원가입에 실패했습니다. 다음 항목들을 확인해주세요:\n\n';

      const errorKeys = Object.keys(validationErrors);
      if (errorKeys.length > 0) {
          alertMessage += `**유효성 검사 실패:**\n`;
          errorKeys.forEach(key => {
              alertMessage += `- ${key}: ${validationErrors[key]}\n`;
          });
          alertMessage += '\n';
      }

      if (requiredChecks.length > 0) {
          alertMessage += `**필수 확인 누락:**\n- ${requiredChecks.join(', ')}\n\n`;
      }
      
      if (!birthYear || !birthMonth || !birthDay) {
          alertMessage += `**선택 항목 누락:**\n- 생년월일 (입력 권장)\n`;
      }

      showModal('회원가입 실패', alertMessage, () => {});
      return;
    }

    const userData = {
      email,
      passwordHash: password,
      nickname,
      phone: phone.trim() || null,
      birthDate:
        birthYear && birthMonth && birthDay
          ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
          : null,
      role: 'ROLE_USER',
      isDeleted: false,
    };

    try {
      const createdUser = await createUser(userData);
      console.log('회원가입 성공:', createdUser);
      
      showModal('회원가입 성공', '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.', () => {
        navigate('/user/login');
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || '회원가입 중 알 수 없는 오류가 발생했습니다.';
      console.error('회원가입 API 오류:', err);
      showModal('회원가입 실패', `회원가입 실패: ${errorMessage}`, () => {});
    }
  };
  
  const checkEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.trim() && emailRegex.test(email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">회원가입</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">이메일 (아이디)</label>
            <div className="flex space-x-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={onEmailChange}
                onBlur={() => validateEmail(email)}
                className={`form-input flex-1 ${emailError ? 'border-red-500' : ''} ${isEmailVerified ? 'border-green-500' : ''}`}
                placeholder="예: example@travel.com"
                required
                disabled={isEmailVerified} 
              />
              <button 
                type="button" 
                onClick={handleEmailCheck} 
                className="w-28 bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!checkEmailFormat(email) || isEmailVerified}
              >
                {isEmailVerified ? "확인 완료" : "중복 확인"}
              </button>
            </div>
            {emailError && (
              <p className="text-sm mt-1 text-red-500">
                {emailError}
              </p>
            )}
            {isEmailVerified && !emailError && (
                <p className="text-sm mt-1 text-green-500">
                  사용 가능한 이메일입니다.
                </p>
            )}
          </div>

          {/* ❌ 인증번호 입력 필드 제거 */}

          <div>
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={onPasswordChange}
              onBlur={() => validatePassword(password)}
              className={`form-input ${passwordError ? 'border-red-500' : ''}`}
              placeholder="영문, 숫자, 특수기호 포함 8~20자"
              required
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="form-label">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={onPasswordConfirmChange}
              onBlur={() => validatePasswordConfirm(passwordConfirm)}
              className={`form-input ${passwordConfirmError ? 'border-red-500' : ''}`}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {passwordConfirmError && <p className="text-red-500 text-sm mt-1">{passwordConfirmError}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="nickname" className="form-label">닉네임</label>
            <div className="flex space-x-2">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={onNicknameChange}
                onBlur={handleNicknameCheck} 
                className={`form-input flex-1 ${!isNicknameVerified && nicknameError ? 'border-red-500' : ''} ${isNicknameVerified ? 'border-green-500' : ''}`}
                placeholder="다른 사용자와 구분되는 별명"
                required
                disabled={isNicknameVerified}
              />
              <button 
                type="button" 
                onClick={handleNicknameCheck} 
                className="w-28 bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!nickname.trim() || isNicknameVerified}
              >
                {isNicknameVerified ? "확인 완료" : "중복 확인"}
              </button>
            </div>
            {nicknameError && (
              <p className={`text-sm mt-1 ${isNicknameVerified ? 'text-blue-500' : 'text-red-500'}`}>
                {nicknameError}
              </p>
            )}
            {isNicknameVerified && !nicknameError && (
                <p className="text-sm mt-1 text-green-500">
                  사용 가능한 닉네임입니다.
                </p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="form-label">전화번호 (선택)</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              placeholder="예: 010-1234-5678"
            />
          </div>
          <div>
            <label className="form-label">생년월일 (선택)</label>
            <BirthDatePicker
              year={birthYear}
              setYear={setBirthYear}
              month={birthMonth}
              setMonth={setBirthMonth}
              day={birthDay}
              setDay={setBirthDay}
            />
          </div>

          <button type="submit" className="btn-primary w-full">회원가입</button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button type="button" onClick={() => navigate('/user/login')} className="text-blue-600 hover:text-blue-700 font-medium">
              로그인하기
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}