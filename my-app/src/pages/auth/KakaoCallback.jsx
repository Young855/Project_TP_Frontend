import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginKakao } from "../../api/loginAPI"; 
// [추가] accountId로 userId 조회를 위한 API
import { getUserByAccount } from "../../api/userAPI"; 

const KakaoCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 중복 요청 방지
  const isRequestSent = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code && !isRequestSent.current) {
      isRequestSent.current = true;
      console.log("카카오 인가 코드 발견:", code);

      // [수정] 내부에서 await를 쓰기 위해 콜백을 async 함수로 변경
      loginKakao(code)
        .then(async (data) => {
          console.log("백엔드 응답 데이터:", data);
          
          // 백엔드 응답 구조 분해
          const { registered, tokenDTO, email, nickname, accountId, role } = data;

          if (registered && tokenDTO) {
            // [상황 1] 이미 가입된 회원 -> 로그인 처리
            localStorage.setItem("accessToken", tokenDTO.accessToken);
            localStorage.setItem("refreshToken", tokenDTO.refreshToken);
            localStorage.setItem("nickname", nickname || "여행자");
            localStorage.setItem("email", email || "");
            localStorage.setItem("accountId", accountId || "");
            localStorage.setItem("role", role);

            // ============================================================
            // [추가] userId 조회 및 저장 로직
            // ============================================================
            if (accountId) {
                try {
                    const userData = await getUserByAccount(accountId);
                    if (userData && userData.userId) {
                        console.log("카카오 로그인: userId 변환 완료 ->", userData.userId);
                        localStorage.setItem("userId", userData.userId); // ✅ userId 저장!
                    }
                } catch (err) {
                    console.error("카카오 로그인 중 userId 조회 실패:", err);
                }
            }

            alert(`${nickname || '여행자'}님 환영합니다!`);
            window.location.href = "/"; 
            
          } else {
            // [상황 2] 미가입 회원 -> 회원가입 진행
            alert("신규 회원입니다. 이메일 인증을 진행해주세요.");
            
            navigate("/user/email-verification", { 
              state: { 
                email: email, 
                nickname: nickname, 
                signupType: "SOCIAL" 
              } 
            });
          }
        })
        .catch((err) => {
          console.error("카카오 로그인 에러:", err);
          alert("로그인 처리에 실패했습니다. 다시 시도해주세요.");
          navigate("/login"); // 경로 확인 (보통 로그인 페이지로 이동)
        });
    }
  }, [location, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-xl font-bold text-gray-700">카카오 로그인 처리 중...</div>
      </div>
    </div>
  );
};

export default KakaoCallback;