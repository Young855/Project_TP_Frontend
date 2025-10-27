import React, { useState, useEffect } from 'react';

/**
 * 생년월일 선택 컴포넌트
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
  // User.java 필드 매핑
  const [email, setEmail] = useState(''); // email
  const [password, setPassword] = useState(''); // passwordHash (전송 시 'password'로 보내면 백엔드가 해싱)
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); // name
  const [nickname, setNickname] = useState(''); // nickname
  const [phone, setPhone] = useState(''); // phone
  
  // birthDate
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  
  // 오류 상태
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nicknameError, setNicknameError] = useState(''); // nickname (unique)
  
  // R001: 이메일 형식 및 중복 확인
  const checkEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    // --- AUTHENTICATION LOGIC ---
    // Mock: API로 이메일 중복 확인
    console.log(`Checking email duplication for: ${email}`);
    // Mock 로직
    if (email === 'test@example.com') {
      setEmailError('이미 사용 중인 이메일입니다.');
    } else {
      setEmailError('사용 가능한 이메일입니다.'); // CSS로 초록색 처리 필요
    }
    // --- END AUTHENTICATION LOGIC ---
  };

  // User.java nickname (unique) 중복 확인
  const checkNickname = () => {
    if (!nickname || nickname.length < 2) {
        setNicknameError('닉네임은 2자 이상 입력해주세요.');
        return;
    }
    // --- AUTHENTICATION LOGIC ---
    // Mock: API로 닉네임 중복 확인
    console.log(`Checking nickname duplication for: ${nickname}`);
    // Mock 로직
    if (nickname === 'admin') {
      setNicknameError('이미 사용 중인 닉네임입니다.');
    } else {
      setNicknameError('사용 가능한 닉네임입니다.'); // CSS로 초록색 처리 필요
    }
    // --- END AUTHENTICATION LOGIC ---
  };


  // R002: 비밀번호 조건
  const validatePassword = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('영문 대/소문자, 숫자, 특수기호를 포함해 8~20자로 입력해주세요.');
    } else {
      setPasswordError('');
    }
  };

  // R003: 비밀번호 재입력 확인
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

    const isEmailValid = emailError === '사용 가능한 이메일입니다.';
    const isNicknameValid = nicknameError === '사용 가능한 닉네임입니다.';
    
    if (passwordError || !isEmailValid || !isNicknameValid || !year || !month || !day || !name || !phone) {
      // alert() 대신 모달 사용 권장 (props.showModal 활용)
      showModal('입력 오류', '입력 정보를 다시 확인해주세요.', () => {});
      return;
    }
    
    const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // --- AUTHENTICATION LOGIC ---
    // User.java 엔티티에 맞춘 데이터
    const signupData = {
      email,
      password, // 백엔드에서 해싱하여 passwordHash로 저장
      name,
      nickname,
      phone,
      birthDate // 'YYYY-MM-DD' 형식
      // role은 백엔드에서 기본값(예: 'USER')으로 설정
    };

    // 실제 회원가입 요청 (Mock)
    console.log('Mock signup Data (based on User.java):', signupData);
    
    // R006: 환영 메시지 및 로그인 페이지로 이동
    showModal('회원가입 완료', '환영합니다! 로그인 페이지로 이동합니다.', () => {
      setPage('login');
    });
    // --- END AUTHENTICATION LOGIC ---
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4 font-sans"> {/* 기본 폰트 적용 */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">회원가입</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="form-label">이메일</label>
            <div className="flex space-x-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="form-input flex-1"
                required
              />
              <button type="button" onClick={checkEmail} className="btn-secondary-outline whitespace-nowrap px-3">
                중복 확인
              </button>
            </div>
            {emailError && <p className={`text-sm mt-1 ${emailError === '사용 가능한 이메일입니다.' ? 'text-green-600' : 'text-red-500'}`}>{emailError}</p>}
          </div>

          {/* 비밀번호 */}
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

          {/* 비밀번호 확인 */}
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

          {/* 이름 (name) */}
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

          {/* 닉네임 (nickname) */}
          <div>
            <label htmlFor="nickname" className="form-label">닉네임</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용할 닉네임을 입력하세요"
                className="form-input flex-1"
                required
              />
              <button type="button" onClick={checkNickname} className="btn-secondary-outline whitespace-nowrap px-3">
                중복 확인
              </button>
            </div>
            {nicknameError && <p className={`text-sm mt-1 ${nicknameError === '사용 가능한 닉네임입니다.' ? 'text-green-600' : 'text-red-500'}`}>{nicknameError}</p>}
          </div>

          {/* 전화번호 (phone) */}
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

          {/* 생년월일 (birthDate) */}
          <div>
            <label className="form-label">생년월일</label>
            <BirthDatePicker year={year} setYear={setYear} month={month} setMonth={setMonth} day={day} setDay={setDay} />
          </div>

          {/* 가입하기 버튼 */}
          <div>
            <button type="submit" className="btn-primary w-full text-lg mt-4">
              가입하기
            </button>
          </div>
        </form>
      </div>

      {/* Tailwind CSS 스타일 정의 (가정) */}
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
