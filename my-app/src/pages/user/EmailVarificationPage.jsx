import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { checkEmailDuplication, sendVerificationEmail, verifyEmailCode } from '../../api/userAPI'; 
import { checkPartnerEmailDuplication, sendPartnerVerificationEmail, verifyPartnerEmailCode } from '../../api/partnerAPI'; 

const INITIAL_TIMER_SECONDS = 180; 

function EmailVerificationPage({ type = 'signup' }) {
    const { } = useOutletContext(); 
    const navigate = useNavigate();
    const location = useLocation();
    
    const bizData = location.state?.isBizInfoVerified ? location.state : {}; 
    const initialEmail = location.state?.email || bizData.contactEmail || ''; 

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

    const config = {
        signup: {
            title: '이메일 인증',
            subtitle: '회원가입을 위해 이메일 인증을 진행해 주세요.',
            placeholder: 'example@travel.com',
            sendCode: sendVerificationEmail,
            verifyCode: verifyEmailCode,
            nextRoute: '/user/signup'
        },
        partner: {
            title: '비즈니스 이메일 확인',
            subtitle: '파트너 등록을 위해 소속 이메일을 인증해 주세요.',
            placeholder: '회사 이메일을 입력해주세요.',
            sendCode: sendPartnerVerificationEmail,
            verifyCode: verifyPartnerEmailCode,
            nextRoute: '/partner/bizverification' 
        }
    };
    const currentConfig = config[type] || config.signup;


    useEffect(() => {
        if (initialEmail && step === 2) {
            handleSendCode(initialEmail);
        }
    }, []); 

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
            const errorMessage = error.response?.data?.message || '인증번호 발송에 실패했습니다.';
            alert('오류 발생: ' + errorMessage);
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

                alert('인증 완료: 이메일 인증이 완료되었습니다. 회원가입을 계속 진행합니다.');
                
                const nextState = { 
                    ...bizData, 
                    verifiedEmail: email, 
                    isEmailVerified: true 
                };
                
                if (type === 'partner') {
                    nextState.contactEmail = email;
                    delete nextState.verifiedEmail; 
                }

                // [수정] nextRoute가 /partner/bizverification을 가리키도록 변경되었으므로,
                // 파트너의 경우 인증된 이메일 정보만 가지고 BizVerificationPage로 이동합니다.
                // BizVerificationPage에서 이 정보를 받아 등록 정보를 채우는 용도로 사용합니다.
                navigate(currentConfig.nextRoute, { state: nextState });
                
            } else {
                setIsCodeValid(false);
                alert('인증 실패: 인증번호가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error("인증번호 검증 오류:", error);
            alert('검증 오류: ' + (error.response?.data?.message || '인증번호 검증 중 오류가 발생했습니다.'));
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
                    disabled={step === 2 || isSending} 
                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 
                        ${!isEmailValid ? 'border-red-500' : 'border-gray-300'} ${step === 2 ? 'bg-gray-100' : 'bg-white'}`}
                    placeholder={currentConfig.placeholder}
                />
                {!isEmailValid && <p className="text-red-500 text-xs mt-1">유효한 이메일 주소를 입력해 주세요.</p>}
            </div>

            {step === 1 && (
                <button 
                    onClick={() => handleSendCode(email)}
                    disabled={!email || isSending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    id="code"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                        setVerificationCode(value);
                                        setIsCodeValid(true);
                                    }}
                                    maxLength="6"
                                    disabled={!isTimerActive || isVerifying || isVerified}
                                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 
                                        ${!isCodeValid ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="인증번호 6자리"
                                />
                                <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 font-bold ${timer <= 30 && isTimerActive ? 'text-red-500' : 'text-gray-600'}`}>
                                    {formatTime(timer)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 text-sm">
                            <p className={`font-medium ${isTimerActive ? 'text-green-600' : 'text-red-500'}`}>
                                {isTimerActive ? '인증번호가 발송되었습니다.' : '인증 시간이 만료되었습니다.'}
                            </p>
                            <button 
                                onClick={() => handleSendCode(email)}
                                disabled={isVerified || isSending}
                                className="text-gray-500 hover:text-blue-600 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? '전송 중...' : '인증번호 재전송'}
                            </button>
                        </div>
                        {!isCodeValid && <p className="text-red-500 text-xs mt-1">인증번호가 일치하지 않거나 만료되었습니다.</p>}
                    </div>

                    <button 
                        onClick={handleVerifyCode}
                        disabled={isVerifying || !isTimerActive || verificationCode.length !== 6 || isVerified}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition duration-150 ease-in-out mt-5 disabled:bg-indigo-300"
                    >
                        {isVerified ? '인증 완료됨' : isVerifying ? '확인 중...' : '확인'}
                    </button>
                </>
            )}

            {step === 2 && !isVerified && (
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