import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Mail, Key} from 'lucide-react';

const LoginPage = () => {
  const { onLogin, showModal } = useOutletContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    console.log('일반 로그인 시도 (이메일:', email, ') - 기능 구현 예정');
    showModal('로그인 준비', '일반 로그인 기능은 백엔드 Security 설정 후 구현될 예정입니다.', null);
  };
  const handleApiLogin = (provider) => {
    console.log(`${provider} API 로그인 시도 - 기능 구현 예정`);
    showModal('API 로그인 준비', `${provider}를 이용한 소셜 로그인 기능은 Security 설정 후 구현될 예정입니다.`, null);
  };
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


        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="email" className="form-label flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" /> 이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="form-input transition duration-200"
              autoComplete="email"
              required
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
              className="form-input transition duration-200"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <button type="submit" className="btn-primary w-full text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200">
              로그인
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-600 mt-8 flex justify-center space-x-6">
          <button 
            onClick={() => navigate('/find-password')} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            비밀번호 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => navigate('/user/signup')} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            회원가입
          </button>
        </div>
      </div>

      
    </div>
  );
};

export default LoginPage;
