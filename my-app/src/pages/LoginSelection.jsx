import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Mail, Key, User, Globe, Briefcase } from 'lucide-react';

/**
 * 로그인 진입 선택 페이지 (Social, Email, Business)
 */
const LoginSelectionPage = () => {
  const { showModal } = useOutletContext();
  const navigate = useNavigate();

  const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_API_KEY; 
  const KAKAO_REDIRECT_URI = "http://localhost:5173/oauth/callback/kakao";
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

  const handleApiLogin = (provider) => {
    // 🌟 [수정 3] 카카오 버튼 클릭 시 이동 로직 추가
    
    if (provider === 'Kakao') {
      console.log("---------------");
      console.log("이동할 주소:", KAKAO_AUTH_URL); // 👈 이 코드를 꼭 넣어보세요!
      console.log("---------------");
      console.log("카카오 로그인 페이지로 이동합니다.");
      window.location.href = KAKAO_AUTH_URL; // 리액트 라우터가 아닌 window 객체로 외부 이동
      return;
    }

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
        <div className="flex justify-center mb-8">
          <img src="/images/logo_travel_people.png" alt="Travel People" className="h-40 w-auto" />
        </div>

        {/* 소셜 로그인 섹션 */}
        <div className="space-y-4 mb-8">
          {/* Kakao 버튼 클릭 시 handleApiLogin('Kakao') 실행됨 */}
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