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
        aria-label="출생 연도"
      >
        <option value="">년</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select 
        value={month} 
        onChange={(e) => setMonth(e.target.value)} 
        className="form-select flex-1"
        aria-label="출생 월"
      >
        <option value="">월</option>
        {months.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select 
        value={day} 
        onChange={(e) => setDay(e.target.value)} 
        className="form-select flex-1"
        aria-label="출생 일"
      >
        <option value="">일</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
};


/**
 * 회원가입 페이지 (User.java 엔티티 기준)
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {function} props.showModal - 모달 표시 함수
 */
const SignupPage = ({ setPage, showModal }) => {
  
  const [email, setEmail] = useState(''); // email
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); 
  const [nickname, setNickname] = useState(''); 
  const [phone, setPhone] = useState(''); 
  
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState(''); 

  // --- [수정됨] 인증 관련 state 추가 ---
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  // ---

  const checkEmail = () => {
    // 이메일 인증 관련 상태 초기화
    setShowVerificationInput(false);
    setIsEmailVerified(false);
    setVerificationCode('');
    setVerificationError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    console.log(`Checking email duplication for: ${email}`);
    
    // 목업(Mock) API 응답
    if (email === 'test@example.com') {
      setEmailError('이미 사용 중인 이메일입니다.');
    } else {
      setEmailError('사용 가능한 이메일입니다. 인증번호를 입력해주세요.'); 
      setShowVerificationInput(true); // [수정됨] 인증번호 입력창 표시
    }
  };

  // --- [추가됨] 인증번호 확인 함수 ---
  const handleVerification = () => {
    // 목업(Mock) 인증 로직
    if (verificationCode === '123456') { // 데모용 인증번호
      setIsEmailVerified(true);
      setEmailError('이메일이 성공적으로 인증되었습니다.');
      setVerificationError('');
      setShowVerificationInput(false); // 인증 성공 시 입력창 숨김
    } else {
      setIsEmailVerified(false);
      setVerificationError('인증번호가 올바르지 않습니다.');
    }
  };
  // ---

  const checkNickname = () => {
    if (!nickname || nickname.length < 2) {
        setNicknameError('닉네임은 2자 이상 입력해주세요.');
        return;
    }
    console.log(`Checking nickname duplication for: ${nickname}`);
    
    if (nickname === 'admin') {
      setNicknameError('이미 사용 중인 닉네임입니다.');
    } else {
      setNicknameError('사용 가능한 닉네임입니다.'); 
    }
  };

  const validatePassword = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('영문 대/소문자, 숫자, 특수기호를 포함해 8~20자로 입력해주세요.');
    } else {
      setPasswordError('');
    }
  };
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // [수정됨] isEmailValid 로직 변경
    const isEmailValid = isEmailVerified; // 이메일 인증 완료 여부 확인
    const isNicknameValid = nicknameError === '사용 가능한 닉네임입니다.';
    
    if (passwordError || !isEmailValid || !isNicknameValid || !year || !month || !day || !name || !phone) {
      // alert() 대신 모달 사용 권장 (props.showModal 활용)
      showModal('입력 오류', '입력 정보를 다시 확인해주세요. (이메일 인증 포함)', () => {});
      return;
    }
    
    const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const signupData = {
      email,
      password,
      name,
      nickname,
      phone,
      birthDate
    };

    console.log('Mock signup Data (based on User.java):', signupData);
    
    showModal('회원가입 완료', '환영합니다! 로그인 페이지로 이동합니다.', () => {
      setPage('login');
    });
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">회원가입</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor="email" className="form-label">이메일</label>
            <div className="flex space-x-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  // [수정됨] 이메일 변경 시 인증 상태 초기화
                  setEmail(e.target.value);
                  setShowVerificationInput(false);
                  setIsEmailVerified(false);
                  setVerificationError('');
                  setEmailError('');
                }}
                placeholder="example@email.com"
                className="form-input flex-1"
                disabled={isEmailVerified} // [수정됨] 인증 완료 후 수정 방지
                required
              />
              <button 
                  type="button" 
                  onClick={checkEmail} 
                  className="btn-secondary-outline whitespace-nowrap px-3"
                  disabled={isEmailVerified} // [수정됨] 인증 완료 후 비활성화
                >
                {isEmailVerified ? '인증 완료' : '중복 확인'}
              </button>
            </div>
            {/* [수정됨] 에러 메시지 클래스 로직 변경 */}
            {emailError && <p className={`text-sm mt-1 ${isEmailVerified || emailError.includes('사용 가능한') ? 'text-green-600' : 'text-red-500'}`}>{emailError}</p>}
          
            {/* --- [추가됨] 인증번호 입력란 --- */}
            {showVerificationInput && !isEmailVerified && (
              <div className="mt-2">
                <label htmlFor="verificationCode" className="form-label">인증번호</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호 6자리 (123456)"
                    className="form-input flex-1"
                  />
                  <button 
                    type="button" 
                    onClick={handleVerification} 
                    className="btn-secondary-outline whitespace-nowrap px-3"
                  >
                    인증
                  </button>
                </div>
                {verificationError && <p className="text-red-500 text-sm mt-1">{verificationError}</p>}
              </div>
            )}
            {/* --- */}
          </div>

          <div>
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validatePassword}
              placeholder="영문, 숫자, 특수기호 포함 8~20자"
              className="form-input"
              autoComplete="new-password"
              required
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="form-input"
              autoComplete="new-password"
              required
            />
            {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
          </div>

          <div>
            <label htmlFor="name" className="form-label">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="실명을 입력하세요"
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="nickname" className="form-label">닉네임</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용할 닉네임을 입력하세요"
          _           className="form-input flex-1"
                required
              />
              <button type="button" onClick={checkNickname} className="btn-secondary-outline whitespace-nowrap px-3">
                중복 확인
              </button>
            </div>
            {nicknameError && <p className={`text-sm mt-1 ${nicknameError === '사용 가능한 닉네임입니다.' ? 'text-green-600' : 'text-red-500'}`}>{nicknameError}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="form-label">전화번호</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="'-' 없이 숫자만 입력"
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">생년월일</label>
            <BirthDatePicker year={year} setYear={setYear} month={month} setMonth={setMonth} day={day} setDay={setDay} />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full text-lg mt-4">
              가입하기
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151; /* text-gray-700 */
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
          border-radius: 0.5rem; /* rounded-lg */
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #2563EB; /* hover:bg-blue-700 */
        }
        .btn-secondary-outline {
          padding: 0.75rem 1rem;
          background-color: white;
          color: #3B82F6; /* text-blue-600 */
          font-weight: 600;
          border: 1px solid #3B82F6; /* border-blue-600 */
          border-radius: 0.5rem; /* rounded-lg */
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }
        .btn-secondary-outline:hover {
          background-color: #EFF6FF; /* hover:bg-blue-50 */
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
