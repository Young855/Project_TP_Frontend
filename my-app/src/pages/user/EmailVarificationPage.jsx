import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { sendVerificationEmail, verifyEmailCode, checkEmailDuplication } from '../../api/userAPI'; 
import { sendPartnerVerificationEmail, verifyPartnerEmailCode } from '../../api/partnerAPI'; 

const INITIAL_TIMER_SECONDS = 180; 

function EmailVerificationPage() {
    // type은 props가 아니라 location.state나 경로에서 파악하는 것이 더 유연할 수 있으나,
    // 기존 구조를 유지하며 location.state를 우선시합니다.
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. 상태 파악 (Partner vs Normal vs Social)
    const state = location.state || {};
    // signupType: 'PARTNER' | 'SOCIAL' | 'NORMAL' (없으면 기본값 NORMAL 취급)
    const signupType = state.signupType || (state.isBizInfoVerified ? 'PARTNER' : 'NORMAL');
    
    const initialEmail = state.email || state.contactEmail || ''; 
    const initialNickname = state.nickname || ''; // 소셜에서 넘어온 닉네임

    // 소셜이면 이메일 수정 불가
    const isSocial = signupType === 'SOCIAL';
    const isPartner = signupType === 'PARTNER';

    // 2. State 초기화
    // 이메일이 이미 있으면 바로 2단계(인증번호 입력)로 시작할 수도 있지만, 
    // "중복확인"을 확실히 하기 위해 자동 전송 로직에서 제어합니다.
    const [step, setStep] = useState(initialEmail ? 2 : 1); 
    const [email, setEmail] = useState(initialEmail);
    const [verificationCode, setVerificationCode] = useState('');
    
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [isCodeValid, setIsCodeValid] = useState(true); 
    const [isVerifying, setIsVerifying] = useState(false); 
    const [isVerified, setIsVerified] = useState(false); 
    const [isSending, setIsSending] = useState(false); 

    const [timer, setTimer] = useState(INITIAL_TIMER_SECONDS);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef(null);
    const hasSentCodeRef = useRef(false); // 자동 전송 중복 방지

    // 설정 분리
    const config = {
        NORMAL: {
            title: '이메일 인증',
            subtitle: '회원가입을 위해 이메일 인증을 진행해 주세요.',
            placeholder: 'example@travel.com',
            sendCode: sendVerificationEmail,
            verifyCode: verifyEmailCode,
            nextRoute: '/user/signup'
        },
        SOCIAL: {
            title: '소셜 계정 추가 인증',
            subtitle: '안전한 가입을 위해 이메일 인증을 진행해 주세요.',
            placeholder: '소셜 계정 이메일',
            sendCode: sendVerificationEmail, // 소셜도 일반 유저 API 사용 (상황에 따라 다름)
            verifyCode: verifyEmailCode,
            nextRoute: '/user/signup'
        },
        PARTNER: {
            title: '비즈니스 이메일 확인',
            subtitle: '파트너 등록을 위해 소속 이메일을 인증해 주세요.',
            placeholder: '회사 이메일을 입력해주세요.',
            sendCode: sendPartnerVerificationEmail,
            verifyCode: verifyPartnerEmailCode,
            nextRoute: '/partner/bizverification' 
        }
    };
    
    // 매칭되는 설정이 없으면 NORMAL로 간주
    const currentConfig = config[signupType] || config.NORMAL;

    // 자동 전송 로직 (페이지 진입 시 이메일이 있으면)
    useEffect(() => {
        if (initialEmail && step === 2 && !hasSentCodeRef.current) {
            hasSentCodeRef.current = true;
            handleSendCode(initialEmail);
        }
    }, []); 

    // 타이머 로직
    useEffect(() => {
        if (isTimerActive && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && isTimerActive) {
            setIsTimerActive(false);
            clearInterval(timerRef.current);
            alert('인증 만료: 인증 시간이 만료되었습니다. 인증번호를 재전송해 주세요.');
        }
        return () => clearInterval(timerRef.current);
    }, [isTimerActive, timer]);

    const formatTime = (totalSeconds) => {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleSendCode = async (targetEmail = email) => {
        if (isSending) return; 

        if (!targetEmail || !/\S+@\S+\.\S+/.test(targetEmail)) {
            setIsEmailValid(false);
            alert('입력 오류: 유효한 이메일 주소를 입력해 주세요.');
            return;
        }

        setIsEmailValid(true);
        setIsSending(true);
        
        try {
            // [중요] Partner가 아닌 경우(일반, 소셜)에는 "중복 확인"을 먼저 수행
            if (!isPartner) {
                try {
                    const dupResponse = await checkEmailDuplication(targetEmail);
                    if (dupResponse.isDuplicated) {
                        alert('이미 가입된 이메일입니다. 로그인 페이지로 이동해 주세요.');
                        setIsSending(false);
                        // 소셜인데 중복이면? -> 이미 가입된 계정이니 로그인 유도
                        // 일반인데 중복이면? -> 로그인 유도
                        return; 
                    }
                } catch (dupError) {
                    console.error("중복 확인 오류:", dupError);
                    alert('이메일 중복 확인 중 오류가 발생했습니다.');
                    setIsSending(false);
                    return;
                }
            }

            // 중복이 아니면 인증코드 발송
            await currentConfig.sendCode(targetEmail);
            
            alert('발송 성공: 인증번호가 이메일로 발송되었습니다. 메일함을 확인해 주세요.');
            
            setStep(2); 
            setTimer(INITIAL_TIMER_SECONDS);
            setIsTimerActive(true);
            setVerificationCode('');
            setIsCodeValid(true);
            setIsVerified(false); 

        } catch (error) {
            console.error("API 오류:", error);
            alert(error.response?.data?.message || '인증번호 발송에 실패했습니다.');
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyCode = async () => {
        if (isVerifying || isVerified) return; 
        if (verificationCode.length !== 6) {
            setIsCodeValid(false);
            alert('입력 오류: 인증번호 6자리를 정확히 입력해 주세요.');
            return;
        }
        if (timer === 0 || !isTimerActive) {
            alert('인증 만료: 인증 시간이 만료되었습니다. 인증번호를 재전송해 주세요.');
            return;
        }

        setIsVerifying(true);
        setIsCodeValid(true);

        try {
            const response = await currentConfig.verifyCode(email, verificationCode); 

            if (response.verified) {
                setIsVerified(true); 
                setIsTimerActive(false); 
                clearInterval(timerRef.current);

                alert('인증 완료: 이메일 인증이 완료되었습니다.');
                
                // 다음 페이지로 넘길 데이터 구성
                const nextState = { 
                    ...state, 
                    verifiedEmail: email, 
                    isEmailVerified: true,
                    signupType: signupType, // NORMAL, SOCIAL, PARTNER 유지
                    nickname: initialNickname // 소셜일 경우 닉네임 보존
                };
                
                if (isPartner) {
                    nextState.contactEmail = email;
                    delete nextState.verifiedEmail; 
                }

                navigate(currentConfig.nextRoute, { state: nextState });
                
            } else {
                setIsCodeValid(false);
                alert('인증 실패: 인증번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error("검증 오류:", error);
            alert('검증 오류: ' + (error.response?.data?.message || '오류가 발생했습니다.'));
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-10 p-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">{currentConfig.title}</h2>
            <p className="mb-6 text-gray-600">{currentConfig.subtitle}</p>

            <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 주소*
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setIsEmailValid(true);
                    }}
                    // 소셜이거나, 전송중이거나, step 2이면 수정 불가
                    disabled={isSocial || step === 2 || isSending} 
                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 
                        ${!isEmailValid ? 'border-red-500' : 'border-gray-300'} 
                        ${(isSocial || step === 2) ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder={currentConfig.placeholder}
                />
                {!isEmailValid && <p className="text-red-500 text-xs mt-1">유효한 이메일 주소를 입력해 주세요.</p>}
            </div>

            {step === 1 && (
                <button 
                    onClick={() => handleSendCode(email)}
                    disabled={!email || isSending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md disabled:opacity-50"
                >
                    {isSending ? '전송 중...' : '인증메일 전송'}
                </button>
            )}

            {step === 2 && (
                <>
                    <div className="mb-4">
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                            인증번호*
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => {
                                    setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                                    setIsCodeValid(true);
                                }}
                                maxLength="6"
                                disabled={!isTimerActive || isVerifying || isVerified}
                                className={`w-full px-4 py-2 border rounded-md ${!isCodeValid ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="인증번호 6자리"
                            />
                            <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 font-bold ${timer <= 30 && isTimerActive ? 'text-red-500' : 'text-gray-600'}`}>
                                {formatTime(timer)}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 text-sm">
                            <p className={isTimerActive ? 'text-green-600' : 'text-red-500'}>
                                {isTimerActive ? '인증번호가 발송되었습니다.' : '시간 만료'}
                            </p>
                            <button 
                                onClick={() => handleSendCode(email)}
                                disabled={isVerified || isSending}
                                className="text-gray-500 hover:text-blue-600"
                            >
                                {isSending ? '전송 중...' : '재전송'}
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleVerifyCode}
                        disabled={isVerifying || !isTimerActive || verificationCode.length !== 6 || isVerified}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md disabled:bg-indigo-300"
                    >
                        {isVerified ? '인증 완료됨' : isVerifying ? '확인 중...' : '확인'}
                    </button>
                </>
            )}

            {/* 소셜이 아닐 때만 이메일 변경 버튼 노출 */}
            {step === 2 && !isVerified && !isSocial && (
                <button 
                    onClick={() => {
                        setStep(1);
                        setIsTimerActive(false);
                        clearInterval(timerRef.current);
                    }}
                    className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                    이메일 주소 변경
                </button>
            )}
        </div>
    );
}

export default EmailVerificationPage;