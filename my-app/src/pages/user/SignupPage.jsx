import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { createUser, createSocialUser, checkNicknameDuplication } from '../../api/userAPI'; // checkEmailDuplication 제거(이미 했음)
import BirthDatePicker from '../../components/BirthDataPicker'; 

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { showModal } = useOutletContext();

  const state = location.state || {};
  const { 
      signupType = 'NORMAL', 
      verifiedEmail, 
      isEmailVerified, 
      nickname: socialNickname // 소셜에서 넘어온 닉네임
  } = state;

  const isSocial = signupType === 'SOCIAL';

  // State 초기화
  const [email] = useState(verifiedEmail || ''); // 수정 불가능하므로 set 함수 미사용
  const [nickname, setNickname] = useState(socialNickname || '');
  
  // 비밀번호 관련
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // 기타 정보
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  
  // 에러 및 검증 상태
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 이메일이 없거나 인증 안됐으면 비정상 접근 (Partner 제외)
  useEffect(() => {
      if (!verifiedEmail || !isEmailVerified) {
          alert('잘못된 접근입니다. 이메일 인증을 먼저 진행해주세요.');
          navigate('/user/verify-email');
      }
  }, [verifiedEmail, isEmailVerified, navigate]);

  // 유효성 검사 함수들
  const validatePassword = (currentPassword) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!regex.test(currentPassword)) {
      setPasswordError('영문 대/소문자, 숫자, 특수기호(@$!%*?&) 포함 8~20자');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validatePasswordConfirm = (val) => {
    if (val !== password) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setPasswordConfirmError('');
    return true;
  };

  const validateNickname = (val) => {
    if (!val || !val.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      setIsNicknameVerified(false);
      return false;
    }
    setNicknameError('');
    return true;
  };

  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const phoneNumber = value.replace(/[^\d]/g, "");

    // 4자리 미만: 그대로
    if (phoneNumber.length < 4) return phoneNumber;
    // 7자리 미만: 000-000
    if (phoneNumber.length < 8) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    // 11자리 이하: 000-0000-0000
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const onlyNumbers = rawValue.replace(/[^\d]/g, ""); // 숫자 이외 제거

    if (onlyNumbers.length <= 11) {
      setPhone(onlyNumbers); // state에는 하이픈 없는 순수 숫자만 저장
    }
  };
  const handleNicknameCheck = async () => {
    if (!validateNickname(nickname)) return;

    try {
      const isDuplicated = await checkNicknameDuplication(nickname);
      if (isDuplicated) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        setIsNicknameVerified(false);
      } else {
        setNicknameError(''); 
        setIsNicknameVerified(true);
        showModal('확인', '사용 가능한 닉네임입니다.', () => {});
      }
    } catch (error) {
      showModal('오류', '중복 확인 중 오류가 발생했습니다.', () => {});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // 1. 유효성 검사
    let isValid = true;
    let errors = [];

    // 닉네임
    if (!isNicknameVerified) {
        isValid = false;
        errors.push('닉네임 중복 확인이 필요합니다.');
    }

    // 비밀번호 (일반 회원가입만)
    if (!isSocial) {
        if (!validatePassword(password) || !validatePasswordConfirm(passwordConfirm)) {
            isValid = false;
            errors.push('비밀번호를 확인해주세요.');
        }
    }

    // 생년월일 (필수라고 가정 시)
    if (!birthYear || !birthMonth || !birthDay) {
        // 선택 사항이라면 이 부분 제거
        // isValid = false; 
        // errors.push('생년월일을 입력해주세요.');
    }

    if (!isValid) {
        showModal('입력 확인', errors.join('\n'), () => {});
        return;
    }

    // 2. 데이터 전송
    const commonData = {
      email,
      nickname,
      phone: phone.trim() || null,
      birthDate: (birthYear && birthMonth && birthDay) 
          ? `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}` : null,
      role: 'ROLE_USER',
      isDeleted: false,
    };

    try {
      setIsLoading(true);
      let createdUser;

      if (isSocial) {
        createdUser = await createSocialUser(commonData);
      } else {
        createdUser = await createUser({
            ...commonData,
            passwordHash: password
        });
      }

      // 가입 성공 시 토큰 저장 및 이동
      if (createdUser?.accessToken) {
          localStorage.setItem('accessToken', createdUser.accessToken);
      }

      showModal('가입 성공', '회원가입이 완료되었습니다.', () => {
        navigate(isSocial ? '/' : '/user/login');
      });

    } catch (err) {
      const msg = err.response?.data?.message || '오류가 발생했습니다.';
      showModal('가입 실패', msg, () => {});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
            {isSocial ? '추가 정보 입력' : '회원가입'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. 이메일 (항상 읽기 전용) */}
          <div>
            <label className="form-label">이메일 (아이디)</label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                readOnly
                className="form-input flex-1 bg-gray-100 text-gray-500 cursor-not-allowed border-green-500"
              />
              <span className="w-28 flex items-center justify-center bg-green-100 text-green-700 font-bold rounded-lg text-sm border border-green-200">
                인증됨
              </span>
            </div>
          </div>

          {/* 2. 비밀번호 (일반 가입일 때만 표시) */}
          {!isSocial && (
            <>
              <div>
                <label className="form-label">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                      setPassword(e.target.value);
                      if(passwordError) setPasswordError('');
                  }}
                  onBlur={() => validatePassword(password)}
                  className={`form-input ${passwordError ? 'border-red-500' : ''}`}
                  placeholder="영문, 숫자, 특수기호 포함 8~20자"
                />
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              </div>
              <div>
                <label className="form-label">비밀번호 확인</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      if(passwordConfirmError) setPasswordConfirmError('');
                  }}
                  onBlur={() => validatePasswordConfirm(passwordConfirm)}
                  className={`form-input ${passwordConfirmError ? 'border-red-500' : ''}`}
                  placeholder="비밀번호 재입력"
                />
                {passwordConfirmError && <p className="text-red-500 text-sm mt-1">{passwordConfirmError}</p>}
              </div>
            </>
          )}

          {/* 3. 닉네임 (소셜은 Pre-fill, 수정 가능) */}
          <div>
            <label className="form-label">닉네임</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                    setNickname(e.target.value);
                    setIsNicknameVerified(false); // 변경 시 다시 인증 필요
                    setNicknameError('');
                }}
                className={`form-input flex-1 ${nicknameError ? 'border-red-500' : ''} ${isNicknameVerified ? 'border-green-500' : ''}`}
                placeholder="별명 입력"
              />
              <button 
                type="button" 
                onClick={handleNicknameCheck} 
                className="w-28 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-black text-sm transition"
                disabled={!nickname.trim()}
              >
                {isNicknameVerified ? "사용 가능" : "중복 확인"}
              </button>
            </div>
            {nicknameError && <p className="text-red-500 text-sm mt-1">{nicknameError}</p>}
            {isNicknameVerified && !nicknameError && <p className="text-green-500 text-sm mt-1">사용 가능한 닉네임입니다.</p>}
          </div>
          
          {/* 4. 기타 정보 */}
          <div>
            <label className="form-label">전화번호 (선택)</label>
            <input
              type="tel"
              value={formatPhoneNumber(phone)}
              onChange={handlePhoneChange}
              className="form-input"
              placeholder="010-1234-5678"
            />
          </div>
          
          <div>
            <label className="form-label">생년월일 (선택)</label>
            <BirthDatePicker
              year={birthYear} setYear={setBirthYear}
              month={birthMonth} setMonth={setBirthMonth}
              day={birthDay} setDay={setBirthDay}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full py-3 px-4 rounded-lg text-black font-bold bg-blue-600 hover:bg-blue-700 transition shadow-md disabled:bg-gray-400"
          >
            {isLoading ? '처리 중...' : '가입 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}