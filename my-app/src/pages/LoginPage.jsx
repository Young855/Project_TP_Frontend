import React, { useState } from 'react';
import { mockUser } from '../data/mockData';

/**
 * 로그인 페이지
 * @param {object} props
 * @param {function} props.onLogin - 로그인 처리 함수
 * @param {function} props.setPage - 페이지 이동 함수
 */
const LoginPage = ({ onLogin, setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    
    // R007: 로그인
    // --- AUTHENTICATION LOGIC ---
    // 실제 구현 시, 주석 해제 후 API 호출
    /*
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if (!res.ok) throw new Error('로그인 실패');
      return res.json();
    })
    .then(data => {
      // R014: JWT 발급 (localStorage/sessionStorage/cookie에 저장)
      localStorage.setItem('jwt', data.token); 
      onLogin(data.user); // App.js의 isLoggedIn 상태 변경
    })
    .catch(err => {
      setError('이메일 또는 비밀번호가 일치하지 않습니다.');
    });
    */
    
    // Mock 로그인 (기능 구현을 위해 주석 해제)
    if (email === "test@example.com" && password === "Test1234!") {
      console.log('Mock login success');
      onLogin(mockUser); // App.js의 isLoggedIn 상태 변경
    } else {
      setError('Mock: 이메일 또는 비밀번호가 일치하지 않습니다. (test@example.com / Test1234!)');
    }
    // --- END AUTHENTICATION LOGIC ---
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">로그인</h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
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
    </div>
  );
};

export default LoginPage;