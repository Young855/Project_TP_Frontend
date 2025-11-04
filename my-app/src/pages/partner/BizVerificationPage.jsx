import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// 🚀 API 호출 로직 구조 Placeholder (무조건 성공)
// TODO: 실제 국세청 API 엔드포인트와 인증 로직(axios 등)으로 교체해야 합니다.
const checkBizInfoAPI = async (bizRegNumber, ceoName, openingDate) => {
    console.log('--- 국세청 사업자 정보 진위 확인 API 호출 시도 (Placeholder: 무조건 성공) ---');
    console.log('데이터:', { bizRegNumber, ceoName, openingDate });
    
    // 1. API 호출 시뮬레이션 (네트워크 지연)
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // 2. ⚠️ 실제 API 호출 로직 Placeholder (주석 처리)
    /*
    try {
        const response = await axios.post('YOUR_NTS_API_URL/status', {
            b_no: [bizRegNumber], 
        }, {
            params: { serviceKey: 'YOUR_SERVICE_KEY' }
        });

        // TODO: 응답 데이터(response.data)를 분석하여 실제 진위 여부 판단
        // return response.data.data[0].b_stt === '계속사업자'; 

    } catch (error) {
        console.error("실제 API 호출 오류:", error);
        // throw new Error(error.response?.data?.message || 'API 호출 실패');
    }
    */

    // 3. Mock 성공 응답 반환 (로직 구조 완성 시까지 유지)
    return true; 
};

/* --- 유효성 검사 함수 --- */
const validateBizRegNumber = (number) => {
    const cleanedNumber = number.replace(/-/g, '').trim();
    const regex = /^\d{10}$/;
    if (!regex.test(cleanedNumber)) {
        return '사업자등록번호는 숫자 10자리여야 합니다.';
    }
    return ''; // 에러 없음
};

const validateOpeningDate = (date) => {
    const cleanedDate = date.replace(/-/g, '').trim();
    const regex = /^\d{8}$/;
    if (!regex.test(cleanedDate)) {
        return '개업일자는 YYYYMMDD 형식의 8자리 숫자여야 합니다.';
    }
    return ''; // 에러 없음
};


/**
 * 파트너 등록 Step 1: 사업자 진위 확인 페이지
 */
export default function BizVerificationPage() {
    const navigate = useNavigate();
    
    // 상태 정의
    const [bizRegNumber, setBizRegNumber] = useState('');
    const [ceoName, setCeoName] = useState('');
    const [openingDate, setOpeningDate] = useState('');
    
    // 에러 상태
    const [bizRegNumberError, setBizRegNumberError] = useState('');
    const [ceoNameError, setCeoNameError] = useState('');
    const [openingDateError, setOpeningDateError] = useState('');
    const [bizVerificationError, setBizVerificationError] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBizInfoVerified, setIsBizInfoVerified] = useState(false);

    
    /* --- 국세청 사업자 등록 정보 API 호출 핸들러 (로직 구조) --- */
    const checkBizInfo = async () => {
        let isValid = true;
        let errorMessages = [];

        // 1. 필수 필드 및 유효성 검사
        const regNumError = validateBizRegNumber(bizRegNumber);
        if (regNumError) { setBizRegNumberError(regNumError); isValid = false; errorMessages.push(`사업자등록번호: ${regNumError}`); } else { setBizRegNumberError(''); }
        
        if (ceoName.trim() === '') { setCeoNameError('대표자 성명을 입력해주세요.'); isValid = false; errorMessages.push('대표자 성명이 입력되지 않았습니다.'); } else { setCeoNameError(''); }
        
        const dateError = validateOpeningDate(openingDate);
        if (dateError) { setOpeningDateError(dateError); isValid = false; errorMessages.push(`개업일자: ${dateError}`); } else { setOpeningDateError(''); }
        
        if (!isValid) {
            const uniqueErrors = [...new Set(errorMessages)].filter(msg => msg.includes(':')); 
            setBizVerificationError('필수 항목을 정확히 입력해주세요:\n' + uniqueErrors.join('\n'));
            return;
        }
        
        setBizVerificationError('');
        setIsSubmitting(true);
        
        try {
            const cleanedBizRegNumber = bizRegNumber.replace(/-/g, '').trim();
            const cleanedOpeningDate = openingDate.replace(/-/g, '').trim();
            
            // 💡 Placeholder 함수 호출
            const isSuccess = await checkBizInfoAPI(
                cleanedBizRegNumber, 
                ceoName.trim(), 
                cleanedOpeningDate
            );
            
            if (isSuccess) {
                setBizVerificationError('✅ 사업자 정보가 확인되었습니다. 다음 단계로 이동합니다.');
                setIsBizInfoVerified(true);
                
                // 성공 시 다음 페이지로 이동하며 데이터 전달
                navigate('/partner/signup', { 
                    state: { 
                        bizRegNumber: cleanedBizRegNumber,
                        ceoName: ceoName.trim(),
                        openingDate: cleanedOpeningDate,
                        isBizInfoVerified: true
                    } 
                });
            } 
            
        } catch (error) {
            // Placeholder는 throw를 안 하므로 실행되지 않지만, 실제 API 연동을 위해 구조 유지
            console.error('API 호출 중 예기치 않은 오류 발생:', error); 
            setBizVerificationError('사업자 정보 확인 중 오류가 발생했습니다.');
            setIsBizInfoVerified(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">사업자 등록번호 확인</h2>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">필수 사업자 정보 입력</h3>
                    
                    {/* 사업자등록번호 (bizRegNumber) */}
                    <div>
                        <label htmlFor="bizRegNumber" className="form-label">사업자등록번호 (필수)</label>
                        <input
                            type="text"
                            id="bizRegNumber"
                            name="bizRegNumber"
                            value={bizRegNumber}
                            onChange={(e) => {
                                setBizRegNumber(e.target.value);
                                setBizRegNumberError('');
                                setIsBizInfoVerified(false);
                                setBizVerificationError('');
                            }}
                            onBlur={() => validateBizRegNumber(bizRegNumber) && setBizRegNumberError(validateBizRegNumber(bizRegNumber))}
                            className={`form-input ${bizRegNumberError && 'border-red-500'}`}
                            placeholder="하이픈 제외 10자리 숫자"
                            required
                            maxLength={10} 
                            disabled={isSubmitting || isBizInfoVerified}
                        />
                        {bizRegNumberError && <p className="text-red-500 text-sm mt-1">{bizRegNumberError}</p>}
                    </div>

                    {/* 대표자 성명 (ceoName) */}
                    <div>
                        <label htmlFor="ceoName" className="form-label">대표자 성명 (필수)</label>
                        <input
                            type="text"
                            id="ceoName"
                            name="ceoName"
                            value={ceoName}
                            onChange={(e) => {
                                setCeoName(e.target.value);
                                setCeoNameError('');
                                setIsBizInfoVerified(false);
                                setBizVerificationError('');
                            }}
                            className={`form-input ${ceoNameError && 'border-red-500'}`}
                            placeholder="대표자 한글/영문 성명"
                            required
                            disabled={isSubmitting || isBizInfoVerified}
                        />
                        {ceoNameError && <p className="text-red-500 text-sm mt-1">{ceoNameError}</p>}
                    </div>

                    {/* 개업일자 (openingDate) */}
                    <div>
                        <label htmlFor="openingDate" className="form-label">개업일자 (필수)</label>
                        <input
                            type="text"
                            id="openingDate"
                            name="openingDate"
                            value={openingDate}
                            onChange={(e) => {
                                setOpeningDate(e.target.value);
                                setOpeningDateError('');
                                setIsBizInfoVerified(false);
                                setBizVerificationError('');
                            }}
                            onBlur={() => validateOpeningDate(openingDate) && setOpeningDateError(validateOpeningDate(openingDate))}
                            className={`form-input ${openingDateError && 'border-red-500'}`}
                            placeholder="YYYYMMDD 형식"
                            required
                            maxLength={8}
                            disabled={isSubmitting || isBizInfoVerified}
                        />
                        {openingDateError && <p className="text-red-500 text-sm mt-1">{openingDateError}</p>}
                    </div>
                    
                    {/* 사업자 정보 확인 버튼 */}
                    <button
                        type="button"
                        onClick={checkBizInfo}
                        disabled={isSubmitting || isBizInfoVerified}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow-md 
                            ${isBizInfoVerified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'}
                        `}
                    >
                        {isSubmitting ? '정보 확인 중...' : isBizInfoVerified ? '정보 확인 완료 (다음 단계)' : '사업자등록정보 진위 확인'}
                    </button>
                    
                    {/* 사업자 확인 결과 메시지 */}
                    {bizVerificationError && (
                        <p className={`text-sm mt-1 p-2 rounded-lg ${isBizInfoVerified ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
                            {bizVerificationError}
                        </p>
                    )}
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                    이미 파트너 계정이 있으신가요?{' '}
                    <Link
                        to="/partner/login"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        로그인하기
                    </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}