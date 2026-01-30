import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyResetToken, resetPassword } from "@/api/authAPI";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isValid, setIsValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // [추가] 에러 상태 관리
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // 1. 페이지 로드 시 토큰 검증
  useEffect(() => {
    if (!token) {
      alert("잘못된 접근입니다.");
      navigate("/login");
      return;
    }
    verifyResetToken(token)
      .then(() => setIsValid(true)) // 유효하면 폼 보여줌
      .catch(() => {
        alert("유효하지 않거나 만료된 링크입니다.");
        navigate("/user/forgot-password"); // 다시 요청하러 보냄
      });
  }, [token, navigate]);

  // [추가] SignupPage에서 가져온 비밀번호 유효성 검사 로직
  const validatePassword = (currentPassword) => {
    // 영문 대/소문자, 숫자, 특수기호 포함 8~20자
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!regex.test(currentPassword)) {
      setPasswordError('영문 대/소문자, 숫자, 특수기호(@$!%*?&) 포함 8~20자');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // [추가] SignupPage에서 가져온 비밀번호 확인 검사 로직
  const validateConfirmPassword = (val) => {
    if (val !== newPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // [수정] 제출 전 유효성 검사 실행
    const isPasswordValid = validatePassword(newPassword);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmValid) {
      return; // 유효하지 않으면 중단
    }
    
    try {
      // 2. 토큰과 새 비밀번호 전송
      await resetPassword({ token, newPassword });
      alert("비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.");
      navigate("/login-selection");
    } catch (error) {
      alert("변경 실패: " + error.message);
    }
  };

  if (!isValid) return <div className="text-center mt-20">유효성 검사 중...</div>;

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">새 비밀번호 설정</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 새 비밀번호 입력 */}
        <div>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (passwordError) setPasswordError(''); // 입력 시 에러 초기화
            }}
            onBlur={() => validatePassword(newPassword)} // 포커스 잃을 때 검사
            className={`w-full border p-3 rounded ${passwordError ? 'border-red-500' : ''}`}
            required
          />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div>
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) setConfirmPasswordError(''); // 입력 시 에러 초기화
            }}
            onBlur={() => validateConfirmPassword(confirmPassword)} // 포커스 잃을 때 검사
            className={`w-full border p-3 rounded ${confirmPasswordError ? 'border-red-500' : ''}`}
            required
          />
          {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
        </div>

        <button type="submit" className="bg-blue-600 text-black p-3 rounded font-bold hover:bg-blue-700">
          비밀번호 변경하기
        </button>
      </form>
    </div>
  );
}