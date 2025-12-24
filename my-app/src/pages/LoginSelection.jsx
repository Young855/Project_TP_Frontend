import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Mail, Key, User, Globe, Briefcase } from 'lucide-react'; // Briefcase 아이콘 추가

/**
 * 로그인 진입 선택 페이지 (Social, Email, Business)
 */
const LoginSelectionPage = () => {
  const { showModal } = useOutletContext();
  const navigate = useNavigate();

  // R008: API 로그인 처리 (기능 없음, 틀만 유지)
  const handleApiLogin = (provider) => {
    console.log(`${provider} API 로그인 시도 - 기능 구현 예정`);
    showModal('API 로그인 준비', `${provider}를 이용한 소셜 로그인 기능은 Security 설정 후 구현될 예정입니다.`, null);
  };
  
  // 소셜 로그인 버튼 컴포넌트 (스타일 유지)
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
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">로그인</h2>

        {/* R008: 소셜 로그인 섹션 */}
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
        </div>

        {/* 구분선 */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">또는</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => navigate('../user/login')} 
            className="btn-primary w-full text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
          >
            <Mail size={20} className="mr-3" /> 이메일로 로그인하기
          </button>
          <button
            type="button"
            onClick={() => navigate('../partner/login')}
            className="flex items-center justify-center w-full py-3 px-4 rounded-xl font-semibold text-lg transition duration-200 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Briefcase size={20} className="mr-3 text-blue-600" /> 비즈니스 계정으로 로그인하기
          </button>
        </div>
        
        
      </div>
    </div>
  );
};

export default LoginSelectionPage;