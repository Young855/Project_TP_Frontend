import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "@/api/authAPI"; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false); // 전송 완료 상태
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setIsSent(true); // 성공 시 화면 상태 변경
    } catch (error) {
      alert("가입되지 않은 이메일이거나 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // [UX 핵심] 전송 완료 시 보여줄 화면
  if (isSent) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow rounded text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">이메일 발송 완료!</h2>
        <p className="text-gray-600 mb-6">
          <strong>{email}</strong>으로 비밀번호 재설정 링크를 보냈습니다.<br />
          메일함을 확인해주세요.
        </p>
        <Link to="/login-selection" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-black">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  // 기본 입력 화면
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">비밀번호 찾기</h2>
      <p className="text-gray-500 text-sm mb-6">가입하신 이메일을 입력하시면 재설정 링크를 보내드립니다.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="이메일 주소 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-3 rounded"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-black p-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "전송 중..." : "인증 메일 전송"}
        </button>
      </form>
    </div>
  );
}