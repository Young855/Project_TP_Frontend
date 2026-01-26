import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Settings, Edit3, Save, Check, Quote } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '../../api/userPrefAPI';
import { getUserByAccount } from '../../api/userAPI'; 

const KEYWORD_CATEGORIES = {
  "분위기 & 감성": [
    '힐링', '조용한', '활기찬', '럭셔리', '모던한', 
    '아늑한', '감성숙소', '레트로', '이국적인', '낭만적인',
    '프라이빗', '한적한', '유니크한', '전통적인', '인스타감성'
  ],
  "뷰 (View)": [
    '오션뷰', '마운틴뷰', '리버뷰', '시티뷰', '야경맛집', 
    '별보기좋은', '숲캉스', '해변가', '탁트인', '정원뷰'
  ],
  "시설 & 옵션": [
    '수영장', '스파&사우나', '피트니스', '레스토랑', '카페&베이커리', 
    '주차장', '엘리베이터', '바', '라운지', '골프시설', 
    '테니스/스포츠', '키즈 클럽', '쇼핑 아케이드', '비즈니스 센터',
    '무선인터넷', 'OTT', '욕조/월풀', '테라스/발코니', '객실내취사',
    '세탁기', '스타일러', '공기청정기', '금연', '업무용 책상'
  ],
  "동반자 & 편의": [
    '가성비', '혼자여행', '커플여행', '우정여행', '가족여행', 
    '아이와함께', '부모님효도', '반려동물동반', '주차편한', '역세권/뚜벅이'
  ]
};

/** * [컴포넌트] 여행 취향 입력/수정 폼 
 */
const PreferenceForm = ({ userId, initialData, onCancel, onSaveSuccess }) => {
  const [selectedKeywords, setSelectedKeywords] = useState(() => {
    if (initialData?.preferenceText) {
      return initialData.preferenceText.split(',').map(k => k.trim()).filter(Boolean);
    }
    return [];
  });

  const [formData, setFormData] = useState({
    accommodationType: initialData?.accommodationType || 'HOTEL',
    minBudget: initialData?.minBudget || 0,
    maxBudget: initialData?.maxBudget || 0,
    preferredStayNights: initialData?.preferredStayNights || 1,
  });

  const toggleKeyword = (keyword) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword); 
      } else {
        return [...prev, keyword]; 
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        preferenceText: selectedKeywords.join(', '), 
        userId: Number(userId), 
        minBudget: Number(formData.minBudget),
        maxBudget: Number(formData.maxBudget),
        preferredStayNights: Number(formData.preferredStayNights),
      };
      console.log("취향 데이터 ",payload);
      await saveUserPreference(userId, payload);
      alert('취향 정보가 저장되었습니다.');
      onSaveSuccess(); 
    } catch (error) {
      console.error(error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 border p-6 rounded-lg bg-white shadow-sm">
      <h4 className="text-xl font-bold border-b pb-4 text-gray-800">
        {initialData ? '취향 정보 수정' : '취향 정보 등록'}
      </h4>

      {/* 1. 카테고리별 키워드 선택 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-bold text-gray-700">
            선호하는 여행 스타일 (중복 선택 가능)
          </label>
          <span className="text-sm text-blue-600 font-medium">
            {selectedKeywords.length}개 선택됨
          </span>
        </div>
        
        {/* 키워드 목록 영역 */}
        <div className="space-y-6 mb-6">
          {Object.entries(KEYWORD_CATEGORIES).map(([category, keywords]) => (
            <div key={category} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h5 className="text-sm font-bold text-gray-600 mb-3 border-b border-gray-200 pb-2">
                {category}
              </h5>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => {
                  const isSelected = selectedKeywords.includes(keyword);
                  return (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => toggleKeyword(keyword)}
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 border
                        ${isSelected 
                          ? 'bg-blue-600 text-purple border-blue-600 shadow-sm font-semibold' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                    >
                      {isSelected && <Check size={12} className="inline mr-1 stroke-2" />}
                      {keyword}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* [수정] 실시간 문장 미리보기 섹션: 문맥이 자연스럽도록 수정 */}
        <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3 shadow-sm">
           <Quote className="text-indigo-500 flex-shrink-0 mt-1" size={24} fill="currentColor" fillOpacity={0.2} />
           <div className="flex-1">
             <p className="text-xs text-indigo-800 font-bold mb-1 uppercase tracking-wide">My Travel Style</p>
             <p className="text-gray-800 text-lg leading-relaxed font-medium">
               {selectedKeywords.length > 0 ? (
                 <>
                   " 저는 <span className="font-bold text-indigo-700 bg-indigo-100 px-1 rounded mx-1 decoration-clone">
                     {selectedKeywords.join(', ')}
                   </span> 
                   {/* '분위기의' 대신 더 포괄적인 표현 사용 */}
                   숙소를 가장 선호해요! "
                 </>
               ) : (
                 <span className="text-gray-400 italic">
                   " 위에서 키워드를 선택하면 나만의 여행 문장이 만들어져요. "
                 </span>
               )}
             </p>
           </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. 숙소 형태 & 일정 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">선호 숙소 형태</label>
            <select
            name="accommodationType"
            value={formData.accommodationType}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <option value="HOTEL">호텔 (HOTEL)</option>
            <option value="PENSION">펜션 (PENSION)</option>
            <option value="GUESTHOUSE">게스트하우스 (GUESTHOUSE)</option>
            <option value="RESORT">리조트 (RESORT)</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">선호 숙박 일수</label>
            <div className="relative">
            <input
                type="number"
                name="preferredStayNights"
                value={formData.preferredStayNights}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">박</span>
            </div>
        </div>
      </div>

      {/* 3. 예산 범위 */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">최소 예산 (1박)</label>
          <div className="relative">
            <input
              type="number"
              name="minBudget"
              value={formData.minBudget}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="1000"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">원</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">최대 예산 (1박)</label>
          <div className="relative">
            <input
              type="number"
              name="maxBudget"
              value={formData.maxBudget}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="1000"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">원</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-6 border-t mt-4">
        {initialData && (
          <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            취소
          </button>
        )}
        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-black rounded-lg hover:bg-blue-700 font-bold shadow-sm flex items-center gap-2">
          <Save size={18} /> 저장하기
        </button>
      </div>
    </form>
  );
};

/** * [컴포넌트] 여행 취향 상세 보기 
 */
const PreferenceDetail = ({ data, onEdit }) => {
  if (!data) return null;

  const keywords = data.preferenceText ? data.preferenceText.split(',').map(k => k.trim()) : [];

  return (
    <div className="border p-8 rounded-xl shadow-sm bg-white">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h4 className="text-2xl font-bold text-gray-800">나의 여행 취향</h4>
        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
          <Edit3 size={18} /> 수정하기
        </button>
      </div>
      
      {/* 상세 보기 상단에도 생성된 문장 보여주기 */}
      <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
         <Quote className="text-indigo-500 flex-shrink-0 mt-1" size={24} fill="currentColor" fillOpacity={0.2} />
         <div>
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
               {/* '분위기' 단어 제거하고 자연스러운 문장으로 수정 */}
               " 저는 <span className="font-bold text-indigo-700">{data.preferenceText}</span> 숙소를 가장 선호해요! "
            </p>
         </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="block text-sm font-bold text-gray-500 mb-1">숙소 형태</span>
            <p className="font-bold text-lg text-gray-800">{data.accommodationType}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="block text-sm font-bold text-gray-500 mb-1">선호 일정</span>
            <p className="font-bold text-lg text-gray-800">{data.preferredStayNights}박</p>
          </div>
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <span className="block text-sm font-bold text-gray-500 mb-1">1박당 예산 범위</span>
            <p className="font-bold text-xl text-green-700">
              {Number(data.minBudget).toLocaleString()}원 ~ {Number(data.maxBudget).toLocaleString()}원
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/** * [컴포넌트] 내 정보 보기 
 */
const MyInfo = ({ user }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">내 정보</h3>
      <div className="space-y-3">
        <p><strong>닉네임:</strong> {user.nickname ?? '-'}</p>
        <p><strong>이메일:</strong> {user.email ?? '-'}</p>
        <p><strong>생년월일:</strong> {user.birthDate ?? '-'}</p>
        <p><strong>전화번호:</strong> {user.phone ?? '-'}</p>
        <button className="btn-secondary-outline mt-4">정보 수정</button>
      </div>
    </div>
  );
};

/**
 * [메인] 마이페이지
 */
const MyPage = ({ subPage, setPage }) => {
  const navigate = useNavigate();
  const [currentSubPage, setCurrentSubPage] = useState(subPage || 'info');

  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // 취향 관련 State
  const [preferenceData, setPreferenceData] = useState(null);
  const [isEditingPreference, setIsEditingPreference] = useState(false);
  const [loadingPref, setLoadingPref] = useState(false);

  // 1. 유저 정보 조회
  useEffect(() => {
    const fetchUser = async () => {
      const storedAccountId = localStorage.getItem('accountId');

      if (!storedAccountId) {
        alert("로그인이 필요한 서비스입니다.");
        navigate('/user/login');
        return;
      }

      try {
        setIsLoadingUser(true);
        const userData = await getUserByAccount(storedAccountId);
        setUser(userData);
      } catch (error) {
        console.error("유저 정보 조회 실패:", error);
        alert("회원 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
        navigate('/user/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // 2. 취향 데이터 조회
  const fetchPreference = async () => {
    if (!user?.userId) return; 
    
    setLoadingPref(true);
    try {
      const data = await getUserPreference(user.userId);
      setPreferenceData(data);
      setIsEditingPreference(false); 
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setPreferenceData(null); 
        setIsEditingPreference(true);
      } else {
        console.error("취향 정보 로드 실패:", error);
      }
    } finally {
      setLoadingPref(false);
    }
  };

  useEffect(() => {
    if (currentSubPage === 'preferences' && user) {
      fetchPreference();
    }
  }, [currentSubPage, user]);

  // 렌더링
  if (isLoadingUser) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">사용자 정보를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (!user) return null; 

  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'info':
        return <MyInfo user={user} />;

    
      case 'preferences':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-6">여행 취향 설정</h3>
            {loadingPref ? (
              <p>로딩 중...</p>
            ) : (
              (!preferenceData || isEditingPreference) ? (
                <PreferenceForm 
                  userId={user.userId} 
                  initialData={preferenceData}
                  onCancel={() => setIsEditingPreference(false)}
                  onSaveSuccess={fetchPreference} 
                />
              ) : (
                <PreferenceDetail 
                  data={preferenceData} 
                  onEdit={() => setIsEditingPreference(true)} 
                />
              )
            )}
          </div>
        );

      default:
        return <MyInfo user={user} />;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* 네비게이션 */}
        <nav className="w-full md:w-[220px]">
          <ul className="flex flex-col gap-[1px]">
            <li>
              <button
                onClick={() => setCurrentSubPage('info')}
                className={`mypage-nav-link ${currentSubPage === 'info' && 'mypage-nav-link-active'} block w-full text-left flex items-center gap-2 justify-start py-2`}
              >
                <UserCheck size={20} className="mr-2" /> 내 정보
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentSubPage('preferences')}
                className={`mypage-nav-link ${currentSubPage === 'preferences' && 'mypage-nav-link-active'} block w-full text-left flex items-center gap-2 justify-start py-2`}
              >
                <Settings size={20} className="mr-2" /> 여행 취향 설정
              </button>
            </li>
          </ul>
        </nav>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 bg-white p-6 rounded-lg shadow-md">
          {renderSubPage()}
        </main>
      </div>
    </div>
  );
};

export default MyPage;