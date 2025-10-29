import React, { useState, useEffect } from 'react';

/**
 * 생년월일 선택 컴포넌트 (변경 없음)
 * @param {object} props
 * @param {string} props.year - 현재 선택된 연도
 * @param {function} props.setYear - 연도 설정 함수
 * @param {string} props.month - 현재 선택된 월
 * @param {function} props.setMonth - 월 설정 함수
 * @param {string} props.day - 현재 선택된 일
 * @param {function} props.setDay - 일 설정 함수
 */
const BirthDatePicker = ({ year, setYear, month, setMonth, day, setDay }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // 간단한 구현 (월별 일수 미적용)

  return (
    <div className="flex space-x-2">
      <select 
        value={year} 
        onChange={(e) => setYear(e.target.value)} 
        className="form-select flex-1"
        aria-label="Year of birth"
      >
        <option value="">년도</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}년</option>
        ))}
      </select>
      <select 
        value={month} 
        onChange={(e) => setMonth(e.target.value)} 
        className="form-select flex-1"
        aria-label="Month of birth"
      >
        <option value="">월</option>
        {months.map((m) => (
          <option key={m} value={String(m).padStart(2, '0')}>{m}월</option>
        ))}
      </select>
      <select 
        value={day} 
        onChange={(e) => setDay(e.target.value)} 
        className="form-select flex-1"
        aria-label="Day of birth"
      >
        <option value="">일</option>
        {days.map((d) => (
          <option key={d} value={String(d).padStart(2, '0')}>{d}일</option>
        ))}
      </select>
    </div>
  );
};


/**
 * 회원가입 페이지 (R002)
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 */
export default function SignupPage({ setPage }) {
  // R002: 입력 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user'); // 기본값 'user'
  
  // 생년월일
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  // R002: 에러 및 유효성 상태 관리
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState(''); // 비밀번호 에러 상태 추가
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 중복 확인 여부

  // 비밀번호 유효성 검사 함수 (요청 사항 반영)
  const validatePassword = (currentPassword) => {
    // 영문 대/소문자, 숫자, 특수기호(@$!%*?&)를 포함하여 8~20자
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

  // 비밀번호 확인 유효성 검사 함수
  const validatePasswordConfirm = (currentPasswordConfirm) => {
    if (currentPasswordConfirm !== password) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
      return false;
    } else {
      setPasswordConfirmError('');
      return true;
    }
  };
  
  // 이메일 유효성 검사 (간단화)
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

  // R002: 이메일 중복 확인 (Mock)
  const handleEmailCheck = () => {
    if (!validateEmail(email)) return;

    // Mock 서버 요청
    setTimeout(() => {
      // 실제로는 서버에서 이메일 중복 확인
      const isDuplicated = email === 'test@example.com'; // Mock 데이터
      if (isDuplicated) {
        setEmailError('이미 사용 중인 이메일입니다.');
        setIsEmailVerified(false);
      } else {
        setEmailError('사용 가능한 이메일입니다.');
        setIsEmailVerified(true);
      }
    }, 500);
  };
  
  // R002: 닉네임 중복 확인 (Mock)
  const handleNicknameCheck = () => {
      // 닉네임이 입력되었는지 확인
      if (!nickname.trim()) {
          setNicknameError('닉네임을 입력해주세요.');
          return;
      }

      // Mock 서버 요청
      setTimeout(() => {
          // 실제로는 서버에서 닉네임 중복 확인
          const isDuplicated = nickname === 'admin'; // Mock 데이터
          if (isDuplicated) {
              setNicknameError('이미 사용 중인 닉네임입니다.');
          } else {
              setNicknameError('사용 가능한 닉네임입니다.');
          }
      }, 500);
  };

  // 비밀번호 입력 핸들러
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // 입력 중에는 에러 메시지를 지우고, onBlur에서 검증
    if (newPassword.length > 0 && passwordError) {
        setPasswordError('');
    }
    // 비밀번호가 바뀔 때, 확인 필드도 다시 검사 (선택 사항이지만 일관성을 위해)
    if (passwordConfirm.length > 0) {
        validatePasswordConfirm(passwordConfirm);
    }
  };

  // 비밀번호 확인 입력 핸들러
  const handlePasswordConfirmChange = (e) => {
    const newPasswordConfirm = e.target.value;
    setPasswordConfirm(newPasswordConfirm);
    // 입력 중에는 에러 메시지를 지우고, onBlur에서 검증
    if (newPasswordConfirm.length > 0 && passwordConfirmError) {
        setPasswordConfirmError('');
    }
  };


  // 회원가입 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    let isValid = true;
    
    // R002: 필수 필드 유효성 검사

    // 1. 이메일
    if (!validateEmail(email)) isValid = false;
    if (!isEmailVerified) {
        setEmailError('이메일 중복 확인이 필요합니다.');
        isValid = false;
    }

    // 2. 비밀번호
    if (!validatePassword(password)) isValid = false;
    if (!validatePasswordConfirm(passwordConfirm)) isValid = false;
    
    // 3. 이름/닉네임
    if (name.trim() === '') { console.error('이름을 입력해주세요.'); isValid = false; }
    if (nickname.trim() === '') { 
        setNicknameError('닉네임을 입력해주세요.');
        isValid = false; 
    }
    
    // 닉네임 중복 확인이 안 된 경우
    if (nicknameError !== '사용 가능한 닉네임입니다.') {
        // 닉네임이 입력되지 않은 경우를 제외하고, 중복 확인 요청
        if (nickname.trim() && nicknameError.length === 0) {
            setNicknameError('닉네임 중복 확인이 필요합니다.');
        }
        isValid = false;
    }

    if (isValid) {
      // Mock 회원가입 로직
      console.log('회원가입 정보:', {
        email,
        password: '***', // 보안상 실제 비밀번호 로그 방지
        name,
        nickname,
        phone,
        birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
        role,
      });

      // R002: 성공 모달 대신 간단한 알림 후 로그인 페이지로 이동
      console.log('회원가입 성공 (Mock)');
      // alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'); // alert 대신 콘솔 메시지 사용
      setPage('login');
    } else {
      console.log('회원가입 실패: 유효성 검사 실패');
      // 유효성 검사 실패 시 각 필드의 에러 메시지가 표시됨
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">회원가입</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* R002: 이메일 (아이디) */}
          <div>
            <label htmlFor="email" className="form-label">이메일 (아이디)</label>
            <div className="flex space-x-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailVerified(false); // 이메일 변경 시 중복 확인 초기화
                    setEmailError(''); // 입력 시 에러 메시지 초기화
                }}
                onBlur={() => validateEmail(email)}
                className={`form-input flex-1 ${emailError && 'border-red-500'}`}
                placeholder="예: example@travel.com"
                required
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={!email || emailError === '유효한 이메일 주소를 입력해주세요.'}
                className="btn-secondary w-28"
              >
                중복 확인
              </button>
            </div>
            {emailError && <p className={`text-sm mt-1 ${isEmailVerified ? 'text-blue-500' : 'text-red-500'}`}>{emailError}</p>}
          </div>

          {/* R002: 비밀번호 */}
          <div>
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => validatePassword(password)} // onBlur에서 검증
              className={`form-input ${passwordError && 'border-red-500'}`}
              placeholder="영문, 숫자, 특수기호 포함 8~20자"
              required
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          {/* R002: 비밀번호 확인 */}
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
            />
            {passwordConfirmError && <p className="text-red-500 text-sm mt-1">{passwordConfirmError}</p>}
          </div>
          
          {/* R002: 이름 */}
          <div className="mb-4">
              <label htmlFor="name" className="form-label">이름</label>
              <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="본명을 입력하세요"
                  required
              />
          </div>

          {/* R002: 닉네임 (레이아웃 변경 요청 사항 반영) */}
          <div className="mb-4">
              <label htmlFor="nickname" className="form-label">닉네임</label>
              <div className="flex space-x-2">
                <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => {
                        setNickname(e.target.value);
                        setNicknameError(''); // 입력 시 에러 메시지 초기화
                    }}
                    onBlur={handleNicknameCheck}
                    className={`form-input flex-1 ${nicknameError === '이미 사용 중인 닉네임입니다.' && 'border-red-500'}`}
                    placeholder="다른 사용자와 구분되는 별명"
                    required
                />
                <button
                  type="button"
                  onClick={handleNicknameCheck}
                  disabled={!nickname.trim()}
                  className="btn-secondary w-28"
                >
                  중복 확인
                </button>
              </div>
              {nicknameError && <p className={`text-sm mt-1 ${nicknameError === '사용 가능한 닉네임입니다.' ? 'text-blue-500' : 'text-red-500'}`}>{nicknameError}</p>}
          </div>

          {/* R002: 전화번호 */}
          <div>
            <label htmlFor="phone" className="form-label">전화번호 (선택)</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              placeholder="예: 010-1234-5678"
            />
          </div>
          
          {/* R002: 생년월일 */}
          <div>
            <label className="form-label">생년월일 (선택)</label>
            <BirthDatePicker 
              year={birthYear} setYear={setBirthYear}
              month={birthMonth} setMonth={setBirthMonth}
              day={birthDay} setDay={setBirthDay}
            />
          </div>
          
          <div>

               <input type="hidden" name="role" value="user" /> 
            
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="btn-primary w-full"
          >
            회원가입
          </button>
        </form>
        
        {/* 로그인 페이지로 이동 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={() => setPage('LoginPage')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>

      {/* R002: 커스텀 스타일 (Tailwind CSS 확장) */}
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
