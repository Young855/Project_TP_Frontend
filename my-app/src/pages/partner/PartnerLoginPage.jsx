// src/pages/PartnerLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Mail, Key } from 'lucide-react';
import { loginPartner } from '../../api/loginAPI'; // [주의] 경로 확인

const PartnerLoginPage = () => {
  const { onLogin, showModal } = useOutletContext(); 
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLoading) return;

    if (!email || !password) {
      setError('파트너 이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
        // 1. 파트너 로그인 API 호출
        const data = await loginPartner(email, password);
        
        // 2. 데이터 구조 분해
        const { tokenDTO, nickname, email, accountId, role } = data;

        // 3. 토큰 저장
        if (tokenDTO) {
            localStorage.setItem('accessToken', tokenDTO.accessToken);
            localStorage.setItem('refreshToken', tokenDTO.refreshToken);
        }

        // 4. 정보 저장 (닉네임 자리에 CEO 이름이 옴)
        localStorage.setItem('nickname', nickname || '파트너');
        localStorage.setItem('email',  email);
        localStorage.setItem('accountId', accountId);
        
        // 파트너임을 구분하기 위해 role 저장 권장
        localStorage.setItem('role', role); 
        
        // 5. 전역 상태 갱신
        if (onLogin) onLogin();

        alert(`파트너 ${nickname}님 환영합니다!`);
        
        // 6. 파트너 메인 페이지로 이동 (없으면 기본 메인으로)
        window.location.href = "/partner"; // 혹은 "/"

    } catch (err) {
        console.error('파트너 로그인 오류:', err);
        const msg = err.response?.data?.message || '로그인에 실패했습니다. 이메일과 승인 상태를 확인해주세요.';
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">파트너 로그인</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" /> 비즈니스 이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@business.com"
              className="form-input w-full p-2 border rounded-md"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="form-label flex items-center">
              <Key size={16} className="mr-2 text-gray-400" /> 비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="form-input w-full p-2 border rounded-md"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <button 
              type="submit" 
              className="btn-primary w-full py-3 text-lg font-bold text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '파트너 로그인'}
            </button>
          </div>
        </form>
        
        <div className="text-sm text-center text-gray-600 mt-8 flex justify-center space-x-6">
          <button 
            onClick={() => showModal('알림', '파트너 비밀번호 찾기 기능은 고객센터에 문의해주세요.', null)} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            비밀번호 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => navigate('/partner/email-verification')} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            파트너 등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerLoginPage;