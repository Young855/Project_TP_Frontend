import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Mail, Key, User, Globe } from 'lucide-react'; // 아이콘 추가
// 파트너 API 관련 코드는 별도의 파일로 분리하여 설명합니다.

/**
 * 파트너 로그인 페이지
 */
const PartnerLoginPage = () => {
  // useOutletContext를 사용하여 MainLayout에서 제공된 context를 가져옵니다.
  // showModal은 그대로 사용하지만, onLogin 로직은 파트너 인증에 맞게 내부에서 처리해야 합니다.
  const { showModal } = useOutletContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 파트너 로그인 처리 (R007 기반)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLoading) return;

    if (!email || !password) {
      setError('파트너 이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    // --- R007: 파트너 로그인 기능의 Placeholder ---
    console.log('파트너 로그인 시도 (이메일:', email, ') - 기능 구현 예정');
    
    // API 호출 시뮬레이션
    try {
        // 실제 API 호출: const result = await partnerLoginAPI(email, password);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        // 로그인 성공 시 로직 (임시)
        // showModal('로그인 성공', '파트너 로그인에 성공했습니다!', null);
        // navigate('/partner/dashboard'); // 파트너 대시보드로 이동
        
        // 기능 미구현 Placeholder (원래 코드의 의도 유지)
        showModal('파트너 로그인 준비', '파트너 일반 로그인 기능은 백엔드 Security 설정 후 구현될 예정입니다.', null);

    } catch (err) {
        console.error('파트너 로그인 오류:', err);
        setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
        setIsLoading(false);
    }
    // ----------------------------------------
  };
  
  // R008: API 로그인 처리 (기능 없음, 틀만 유지)
  const handleApiLogin = (provider) => {
    // --- R008: API 로그인 기능의 Placeholder ---
    console.log(`${provider} API 로그인 시도 - 기능 구현 예정`);
    showModal('API 로그인 준비', `${provider}를 이용한 소셜 로그인 기능은 파트너 계정에서는 지원되지 않을 수 있습니다.`, null);
    // ----------------------------------------
  };

  // 소셜 로그인 버튼 컴포넌트
  const SocialLoginButton = ({ provider, bgColor, textColor, icon, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center w-full py-3 px-4 rounded-xl font-semibold text-lg transition duration-200 border ${bgColor} ${textColor} hover:opacity-90 shadow-md`}
      aria-label={`${provider}로 로그인`}
    >
      {icon}
      <span className="ml-3">{provider} 로그인</span>
    </button>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">파트너 로그인</h2>

        {/* R008: API 로그인 섹션 (상단) - 파트너 시스템에서는 보통 주석 처리하거나 제거함 */}
        <div className="space-y-4 mb-8">
          <SocialLoginButton
            provider="Google"
            bgColor="bg-white"
            textColor="text-gray-700"
            icon={<Globe size={20} className="text-red-500" />}
            onClick={() => handleApiLogin('Google')}
          />
          <SocialLoginButton
            provider="Kakao"
            bgColor="bg-[#FEE500]"
            textColor="text-gray-900"
            icon={<Key size={20} />}
            onClick={() => handleApiLogin('Kakao')}
          />
          <SocialLoginButton
            provider="Naver"
            bgColor="bg-[#03C75A]"
            textColor="text-white"
            icon={<User size={20} />}
            onClick={() => handleApiLogin('Naver')}
          />
        </div>

        {/* 구분선 */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">또는</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="form-label flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" /> 이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@email.com"
              className="form-input transition duration-200"
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>
          
          {/* 비밀번호 */}
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
              className="form-input transition duration-200"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          {/* 에러 메시지 표시 */}
          {error && (
            <div className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          {/* 로그인 버튼 */}
          <div>
            <button 
              type="submit" 
              className="btn-primary w-full text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '파트너 로그인'}
            </button>
          </div>
        </form>
        
        {/* 회원가입, 비밀번호 찾기 링크 */}
        <div className="text-sm text-center text-gray-600 mt-8 flex justify-center space-x-6">
          <button 
            onClick={() => showModal('기능 준비 중', '파트너 비밀번호 찾기 기능은 준비 중입니다.', null)} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            비밀번호 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => navigate('/partner/signup')} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            파트너 등록
          </button>
        </div>
      </div>

      {/* R002: 커스텀 스타일 (LoginPage.jsx에서 복사) */}
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
          border-radius: 0.75rem; /* rounded-xl */
          background-color: #F9FAFB; /* bg-gray-50 */
          transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .form-input:focus {
          outline: none;
          border-color: #3B82F6; /* focus:border-blue-500 */
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); /* focus:ring-blue-500/20 */
          background-color: white;
        }
        .btn-primary {
          padding: 0.9rem 1rem;
          background-color: #3B82F6; /* bg-blue-600 */
          color: white;
          font-weight: 700;
          border-radius: 0.75rem; /* rounded-xl */
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #2563EB; /* hover:bg-blue-700 */
        }
        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PartnerLoginPage;
