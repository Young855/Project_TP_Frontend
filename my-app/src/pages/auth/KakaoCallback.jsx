import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const KakaoCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🌟 핵심: 요청을 보냈는지 체크하는 변수 (화면이 리렌더링돼도 값 유지)
  const isRequestSent = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    // 1. 코드가 있고, 아직 요청을 안 보냈을 때만 실행!
    if (code && !isRequestSent.current) {
      
      // 🌟 "나 요청 보낸다!"라고 깃발 꽂기 (중복 실행 방지)
      isRequestSent.current = true;
      
      console.log("카카오 인가 코드 발견 (1회만 실행):", code);
      
      axios.post("http://localhost:9090/api/auth/kakao", { code })
        .then((res) => {
          console.log("백엔드 응답 도착:", res.data); // 데이터가 왔을 때만 로그 찍힘
          
          const { registered, isRegistered, accessToken, email, nickname } = res.data;
          const loginSuccess = registered || isRegistered;

          if (loginSuccess) {
            // [상황 1] 로그인 성공
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("nickname", nickname || "여행자");
            localStorage.setItem("email", email || "");

            alert(`${nickname || '여행자'}님 환영합니다!`);
            
            // 헤더 갱신을 위해 새로고침 이동
            window.location.href = "/"; 
          } else {
            // [상황 2] 미가입 회원
            alert("신규 회원입니다. 이메일 인증을 진행해주세요.");
            navigate("/user/email-verification", { 
              state: { email, nickname, signupType: "SOCIAL" } 
            });
          }
        })
        .catch((err) => {
          console.error("로그인 처리 중 에러:", err);
          // 중복 요청 에러일 수 있으므로 사용자에게 알리기 전에 콘솔 확인
          // alert("로그인 처리에 실패했습니다.");
          // navigate("/login-selection");
        });
    }
  }, [location, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        {/* 로딩 스피너 (선택 사항) */}
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-xl font-bold text-gray-700">로그인 처리 중입니다...</div>
      </div>
    </div>
  );
};

export default KakaoCallback;