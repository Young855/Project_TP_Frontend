// src/pages/PartnerLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Mail, Key } from 'lucide-react';
import { loginPartner } from '../../api/loginAPI'; 
import { getPartnerByAccountId } from '../../api/partnerAPI';

const PartnerLoginPage = () => {
  const { onLogin } = useOutletContext(); 
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
        const data = await loginPartner(email, password);
        const { 
            tokenDTO, 
            nickname, 
            email: partnerEmail,
            accountId, 
            role 
        } = data;
        
        // accountId로 파트너 상세 정보 조회
        const partnerData = await getPartnerByAccountId(accountId);
            
        localStorage.setItem('partnerId', partnerData.partnerId);

        if (tokenDTO) {
            localStorage.setItem('accessToken', tokenDTO.accessToken);
            localStorage.setItem('refreshToken', tokenDTO.refreshToken);
        }

        localStorage.setItem('nickname', nickname || '파트너');
        localStorage.setItem('email', partnerEmail);
        localStorage.setItem('accountId', accountId);
        localStorage.setItem('role', role); 
        
        if (onLogin) onLogin();

        alert(`파트너 ${nickname}님 환영합니다!`);
        window.location.href = "/partner/accommodations"; // 파트너 메인으로 이동

    } catch (err) {
        console.error('파트너 로그인 오류:', err);
        
        const status = err.response?.status;
        const msg = err.response?.data?.message || '로그인에 실패했습니다. 이메일과 승인 상태를 확인해주세요.';

        // [핵심 로직] 상태 코드에 따른 분기 처리
        if (status === 403) {
            // 403 Forbidden: 승인 대기(Pending) 또는 권한 없음 -> Alert 창 띄우기
            // (백엔드에서 AccessDeniedException을 던져야 함)
            alert(msg); 
        } else {
            // 401 Unauthorized (비번 틀림), 400 Bad Request, 500 Server Error 등
            // -> 하단 붉은 박스(setError)에 표시
            setError(msg);
        }
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
              className="form-input transition duration-200 w-full p-2 border rounded-md"
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
              className="form-input transition duration-200 w-full p-2 border rounded-md"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          {/* 에러 메시지 표시 영역 (403이 아닐 때만 표시됨) */}
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
            onClick={() => navigate('/acc/forgot-password')} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            비밀번호 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => navigate('/partner/email-verification', { state: { signupType: 'PARTNER'}})} 
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