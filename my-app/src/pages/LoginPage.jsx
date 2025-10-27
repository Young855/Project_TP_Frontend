import React, { useState } from 'react';

/**
 * 로그인 페이지
 * @param {object} props
 * @param {function} props.setPage - 페이지 이동 함수
 */
const LoginPage = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState(''); // 단순화된 로직에서는 제거

  const handleSubmit = (e) => {
    e.preventDefault();
    // 요청하신 코드의 '데이터 전송 형식' (alert)을 적용합니다.
    alert(`이메일: ${email}\n비밀번호: ${password}`);

    /* --- 기존 handleSubmit 로직 (단순화로 인해 주석 처리) ---
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    
    // R007: 로그인
    // --- AUTHENTICATION LOGIC ---
    // ... (API 호출 로직) ...
    
    // Mock 로그인 (기능 구현을 위해 주석 해제)
    if (email === "test@example.com" && password === "Test1234!") {
      console.log('Mock login success');
      onLogin(mockUser); // App.js의 isLoggedIn 상태 변경
    } else {
      setError('Mock: 이메일 또는 비밀번호가 일치하지 않습니다. (test@example.com / Test1234!)');
    }
    // --- END AUTHENTICATION LOGIC ---
    */
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">로그인</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="form-input"
              autoComplete="email"
              required // required 속성 추가 (요청하신 코드 참고)
            />
          </div>
          <div>
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="form-input"
              autoComplete="current-password"
              required // required 속성 추가 (요청하신 코드 참고)
            />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full text-lg">
              로그인
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-600 mt-6 flex justify-center space-x-4">
          <button onClick={() => setPage('find-password')} className="hover:text-blue-600 transition-colors">
            비밀번호 찾기
          </button>
          <span>|</span>
          <button onClick={() => setPage('signup')} className="hover:text-blue-600 transition-colors">
            회원가입
          </button>
        </div>
      </div>

    <style jsx global>{`
      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #374151; /* text-gray-700 */
      }
      .form-input {
        display: block;
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #D1D5DB; /* border-gray-300 */
        border-radius: 0.5rem; /* rounded-lg */
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      }
      .form-input:focus {
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
    `}</style>
    </div>
  );
};

export default LoginPage;
