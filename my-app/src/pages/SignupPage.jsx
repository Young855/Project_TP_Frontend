import React, { useState, useEffect } from 'react';
import BirthDatePicker from '../components/BirthDatePicker';

/**
 * 회원가입 페이지
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 * @param {function} props.showModal - 모달 표시 함수
 */
const SignupPage = ({ setPage, showModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // R001: 이메일 형식 및 중복 확인
  const checkEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    // --- AUTHENTICATION LOGIC ---
    // Mock: API로 이메일 중복 확인
    /*
    fetch(`/api/auth/check-email?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.isDuplicate) {
          setEmailError('이미 사용 중인 이메일입니다.');
        } else {
          setEmailError('사용 가능한 이메일입니다.'); // 성공 메시지 (초록색)
        }
      });
    */
    // Mock 로직
    if (email === 'test@example.com') {
      setEmailError('이미 사용 중인 이메일입니다.');
    } else {
      setEmailError('사용 가능한 이메일입니다.'); // CSS로 초록색 처리 필요
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
    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwordError || emailError === '이미 사용 중인 이메일입니다.' || !year || !month || !day) {
      alert('입력 정보를 다시 확인해주세요.');
      return;
    }
    
    // --- AUTHENTICATION LOGIC ---
    // 실제 회원가입 요청
    /*
    fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, birthDate: `${year}-${month}-${day}` })
    })
    .then(res => {
      if (!res.ok) throw new Error('회원가입 실패');
      return res.json();
    })
    .then(data => {
      // R006: 환영 메시지 및 로그인 페이지로 이동
      showModal('회원가입 완료', '환영합니다! 로그인 페이지로 이동합니다.', () => {
        setPage('login');
      });
    })
    .catch(err => {
      alert('회원가입 중 오류가 발생했습니다.');
    });
    */
    
    // Mock 로직
    console.log('Mock signup:', { email, password, birthDate: `${year}-${month}-${day}` });
    // R006: 환영 메시지 및 로그인 페이지로 이동
    showModal('회원가입 완료', '환영합니다! 로그인 페이지로 이동합니다.', () => {
      setPage('login');
    });
    // --- END AUTHENTICATION LOGIC ---
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
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
a        </div>
          <div>
            {/* R004: 생년월일 드롭다운 */}
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
    </div>
  );
};

export default SignupPage;