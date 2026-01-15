// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Mail, Key } from 'lucide-react';
import { loginUser } from '../../api/loginAPI'; // [주의] 경로가 api/loginAPI.js 인지 확인

const LoginPage = () => {
  const { onLogin } = useOutletContext(); // App.js의 로그인 상태 갱신 함수
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // 1. API 호출
      const data = await loginUser(email, password);
      
      // 2. 응답 데이터 구조 분해 (백엔드 LoginResponseDTO 구조 참고)
      const { tokenDTO, nickname, email, accountId, role } = data;

      // 3. 토큰 및 유저 정보 저장
      if (tokenDTO) {
          localStorage.setItem('accessToken', tokenDTO.accessToken);
          localStorage.setItem('refreshToken', tokenDTO.refreshToken);
      }
      
      localStorage.setItem('nickname', nickname || '여행자');
      localStorage.setItem('email', email);
      localStorage.setItem('accountId', accountId);
      localStorage.setItem('role', role);

      // 4. 전역 상태 업데이트 및 이동
      if (onLogin) onLogin();
      
      alert(`${nickname || '회원'}님 환영합니다!`);
      
      // 관리자인 경우 관리자 페이지로, 아니면 메인으로
     if (role === ROLE_ID.ADMIN) { // 또는 if (role === 1)
        window.location.href = "/admin";
    } else {
        window.location.href = "/";
    }
    } catch (err) {
      console.error("로그인 실패:", err);
      // 백엔드 에러 메시지가 있다면 보여줌, 없으면 기본 메시지
      const msg = err.response?.data?.message || '이메일 또는 비밀번호가 일치하지 않습니다.';
      setError(msg);
    }
  };

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
              className="form-input transition duration-200 w-full p-2 border rounded-md"
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
              className="form-input transition duration-200 w-full p-2 border rounded-md"
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
            <button type="submit" className="btn-primary w-full py-3 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 rounded-xl bg-blue-600 text-white font-bold">
              로그인
            </button>
          </div>
        </form>

        <div className="text-sm text-center text-gray-600 mt-8 flex justify-center space-x-6">
          <button onClick={() => navigate('/find-password')} className="hover:text-blue-600 transition-colors font-medium">비밀번호 찾기</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => navigate('/user/email-verification')} className="hover:text-blue-600 transition-colors font-medium">회원가입</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;