import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../api/userAPI';
import BirthDatePicker from '../../components/BirthDataPicker'; // 프로젝트 트리 기준 import

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  // const [role] = useState('user'); // 사용하지 않으므로 제거하거나 그대로 유지 (아래 userData에서 명시적으로 사용)

  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  // isEmailVerified와 isNicknameVerified를 별도로 관리하여 제출 시 중복 확인 상태를 명확히 체크
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);

  // --- 유효성 함수들 ---
  const validateEmail = (currentEmail) => {
    // . 을 이스케이프한 정규식
    // 이메일 유효성 검사는 통과했으나 중복 확인이 안 된 상태를 분리하기 위해
    // 유효성만 체크하고 에러 메시지는 '중복 확인 필요'와 분리해서 관리하도록 합니다.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!currentEmail.trim()) {
      setEmailError('이메일 주소를 입력해주세요.');
      return false;
    }
    if (!emailRegex.test(currentEmail)) {
      setEmailError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }
    setEmailError(''); // 유효성 통과
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
      // 비밀번호 확인을 입력하지 않았을 경우
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

  // 닉네임 유효성 (필수 입력 확인만)
  const validateNickname = (currentNickname) => {
    if (!currentNickname.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      setIsNicknameVerified(false); // 닉네임 유효하지 않으면 중복 확인 상태 초기화
      return false;
    }
    return true;
  };

  // --- 중복 확인 핸들러들 (알럿 포함) ---
  const handleEmailCheck = () => {
    if (!validateEmail(email)) {
      setIsEmailVerified(false); // 유효하지 않으면 초기화
      return;
    }

    // 예시: 실제 API 호출 대신 임시 시뮬
    setTimeout(() => {
      const isDuplicated = email === 'test@example.com';
      if (isDuplicated) {
        setEmailError('이미 사용 중인 이메일입니다.');
        setIsEmailVerified(false);
        alert('이미 사용 중인 이메일입니다.');
      } else {
        // setEmailError를 '사용 가능한 이메일입니다.'로 설정하는 대신
        // isEmailVerified 상태로만 성공을 판단하도록 수정하여 Error UI와 분리
        setEmailError(''); 
        setIsEmailVerified(true);
        alert('사용 가능한 이메일입니다.');
      }
    }, 300);
  };

  const handleNicknameCheck = () => {
    if (!validateNickname(nickname)) {
      setIsNicknameVerified(false); // 유효하지 않으면 초기화
      return;
    }

    // 예시: 실제 API 호출 대신 임시 시뮬
    setTimeout(() => {
      const isDuplicated = nickname === 'admin';
      if (isDuplicated) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        setIsNicknameVerified(false);
        alert('이미 사용 중인 닉네임입니다.');
      } else {
        // setNicknameError를 '사용 가능한 닉네임입니다.'로 설정하는 대신
        // isNicknameVerified 상태로만 성공을 판단하도록 수정하여 Error UI와 분리
        setNicknameError(''); 
        setIsNicknameVerified(true);
        alert('사용 가능한 닉네임입니다.');
      }
    }, 300);
  };

  // --- 입력 핸들러 (입력 중 에러 초기화) ---
  const onEmailChange = (e) => {
    setEmail(e.target.value);
    setIsEmailVerified(false); // 이메일이 바뀌면 중복 확인 상태 초기화
    setEmailError('');
  };
  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    // 비밀번호 입력 시 비밀번호 확인 유효성 즉시 재검사
    if (passwordConfirm.length > 0) validatePasswordConfirm(passwordConfirm); 
  };
  const onPasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);
    if (passwordConfirmError) setPasswordConfirmError('');
    // 비밀번호 확인 입력 시 유효성 즉시 검사
    validatePasswordConfirm(e.target.value);
  };
  const onNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsNicknameVerified(false); // 닉네임이 바뀌면 중복 확인 상태 초기화
    setNicknameError('');
  };

  // --- 제출 핸들러 (API는 건들지 않음) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    const requiredChecks = [];
    const validationErrors = {}; // 유효성 검사 에러 메시지를 수집할 객체

    // 모든 유효성 검사를 실행하고 결과를 바탕으로 isValid를 설정 (순서 중요)
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isPasswordConfirmValid = validatePasswordConfirm(passwordConfirm);
    const isNicknameInputValid = validateNickname(nickname); // 필수 입력 확인

    if (!isEmailValid) {
      isValid = false;
      validationErrors['이메일 주소'] = emailError || '필수 입력';
    } else if (!isEmailVerified) {
      isValid = false;
      requiredChecks.push('이메일 중복 확인');
    }

    if (!isPasswordValid) {
      isValid = false;
      validationErrors['비밀번호'] = passwordError || '필수 입력';
    }

    // 비밀번호 확인은 비밀번호와 일치하는지, 그리고 입력되었는지 체크
    if (!isPasswordConfirmValid) {
      isValid = false;
      validationErrors['비밀번호 확인'] = passwordConfirmError || '필수 입력';
    }

    if (!isNicknameInputValid) {
      isValid = false;
      validationErrors['닉네임'] = nicknameError || '필수 입력';
    } else if (!isNicknameVerified) {
      // 닉네임은 입력되었으나 중복 확인을 안 한 경우
      isValid = false;
      requiredChecks.push('닉네임 중복 확인');
    }

    // 생년월일 (선택 항목이지만, 미선택 시 alert에 포함되도록 요청)
    if (!birthYear || !birthMonth || !birthDay) {
       requiredChecks.push('생년월일');
       // isValid는 false로 두지 않음 (선택 사항이므로)
       // 하지만 이 경우 회원가입 정보가 부족하다는 알림은 필요
    }

    if (!isValid) {
      let alertMessage = '회원가입에 실패했습니다. 다음 항목들을 확인해주세요:\n\n';

      // 1. 유효성 검사 실패 항목 (에러 메시지 포함)
      const errorKeys = Object.keys(validationErrors);
      if (errorKeys.length > 0) {
          alertMessage += `**유효성 검사 실패:**\n`;
          errorKeys.forEach(key => {
              alertMessage += `- ${key}: ${validationErrors[key]}\n`;
          });
          alertMessage += '\n';
      }

      // 2. 필수 확인/선택 항목 누락
      if (requiredChecks.length > 0) {
          alertMessage += `**필수 확인 누락:**\n- ${requiredChecks.join(', ')}\n\n`;
      }
      
      // 3. 생년월일 선택 누락 (선택 사항이지만 요청대로 포함)
      if (!birthYear || !birthMonth || !birthDay) {
          alertMessage += `**선택 항목 누락:**\n- 생년월일 (입력 권장)\n`;
      }


      alert(alertMessage);
      return;
    }

    // 데이터 구성: role을 'ROLE_USER'로 명시
    const userData = {
      email,
      passwordHash: password, // 백엔드 요구사항에 따라 필드명 조정 필요 (예: password)
      nickname,
      phone: phone.trim() || null,
      birthDate:
        birthYear && birthMonth && birthDay
          ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
          : null,
      role: 'ROLE_USER', // 일반적으로 사용하는 권한명으로 수정
      isDeleted: false,
    };

    try {
      const createdUser = await createUser(userData); // <-- API 호출은 그대로
      console.log('회원가입 성공:', createdUser);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || '회원가입 중 알 수 없는 오류가 발생했습니다.';
      console.error('회원가입 API 오류:', err);
      alert(`회원가입 실패: ${errorMessage}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">회원가입</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="form-label">이메일 (아이디)</label>
            <div className="flex space-x-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={onEmailChange}
                onBlur={() => validateEmail(email)}
                className={`form-input flex-1 ${!isEmailVerified && emailError ? 'border-red-500' : ''}`}
                placeholder="예: example@travel.com"
                required
              />
              <button 
                type="button" 
                onClick={handleEmailCheck} 
                className="w-28 bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!email || !validateEmail(email)}
              >
                중복 확인
              </button>
            </div>
            {emailError && (
              <p className={`text-sm mt-1 ${isEmailVerified ? 'text-blue-500' : 'text-red-500'}`}>
                {emailError}
              </p>
            )}
            {isEmailVerified && !emailError && (
               <p className="text-sm mt-1 text-blue-500">
                 사용 가능한 이메일입니다.
               </p>
            )}
          </div>

          {/* 비밀번호 */}
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

          {/* 비밀번호 확인 */}
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

          {/* 닉네임 */}
          <div className="mb-4">
            <label htmlFor="nickname" className="form-label">닉네임</label>
            <div className="flex space-x-2">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={onNicknameChange}
                onBlur={handleNicknameCheck} // 닉네임 입력 후 Blur 시 중복 확인 자동 실행
                className={`form-input flex-1 ${!isNicknameVerified && nicknameError ? 'border-red-500' : ''}`}
                placeholder="다른 사용자와 구분되는 별명"
                required
              />
              <button 
                type="button" 
                onClick={handleNicknameCheck} 
                className="w-28 bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!nickname.trim()}
              >
                중복 확인
              </button>
            </div>
            {nicknameError && (
              <p className={`text-sm mt-1 ${isNicknameVerified ? 'text-blue-500' : 'text-red-500'}`}>
                {nicknameError}
              </p>
            )}
            {isNicknameVerified && !nicknameError && (
                <p className="text-sm mt-1 text-blue-500">
                  사용 가능한 닉네임입니다.
                </p>
            )}
          </div>

          {/* 전화번호 (선택) */}
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

          {/* 생년월일 (요청대로 미선택 시 alert 포함) */}
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