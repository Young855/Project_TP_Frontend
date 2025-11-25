import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import GuestCounter from '../components/GuestCounter';

/**
 * 메인 페이지 (검색 바 포함)
 * @param {object} props
 * @param {function} props.onSearch - 검색 실행 함수
 */
const MainPage = ({ onSearch }) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const guestPickerRef = useRef(null);

  const totalGuests = adults + children;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();

    // ✅ 유효성 검사: 날짜 입력 확인
    if (!checkIn || !checkOut) {
      alert('체크인/체크아웃 날짜를 선택하세요.');
      return;
    }
    // ✅ 유효성 검사: 체크아웃 >= 체크인
    if (checkOut < checkIn) {
      alert('체크아웃 날짜는 체크인 날짜 이후여야 합니다.');
      return;
    }

    onSearch({ destination, checkIn, checkOut, guests: totalGuests });
  };

          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="checkin" className="form-label">
                <Calendar size={16} className="inline-block mr-1" />
                체크인
              </label>
              <input
                type="date"
                id="checkin"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]} 
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="checkout" className="form-label">
                <Calendar size={16} className="inline-block mr-1" />
                체크아웃
              </label>
              <input
                type="date"
                id="checkout"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="form-input"
              />
            </div>
          </div>

  return (
    <div className="min-h-[calc(100vh-64px)] bg-blue-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          어디로 떠나시나요?
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          맞춤형 여행지 추천과 숙소를 한 번에 검색하세요.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-4 md:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 여행지 */}
          <div className="md:col-span-1">
            <label htmlFor="destination" className="form-label">
              <MapPin size={16} className="inline-block mr-1" />
              여행지
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="여행지나 숙소 이름"
              className="form-input"
            />
          </div>

          {/* 체크인/체크아웃 */}
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="checkin" className="form-label">
                <Calendar size={16} className="inline-block mr-1" />
                체크인
              </label>
              <input
                type="date"
                id="checkin"
                value={checkIn}
                onChange={(e) => {
                  const v = e.target.value;
                  setCheckIn(v);
                  // ✅ 체크인 변경 시 체크아웃 보정
                  if (checkOut && checkOut < v) {
                    setCheckOut(v); // 동일 날짜까지 허용 (원하면 다음날로 강제 가능)
                  }
                }}
                min={todayStr}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="checkout" className="form-label">
                <Calendar size={16} className="inline-block mr-1" />
                체크아웃
              </label>
              <input
                type="date"
                id="checkout"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                // ✅ 체크아웃 최소값을 체크인 또는 오늘로 연동
                min={checkIn || todayStr}
                className="form-input"
              />
            </div>
          </div>

          {/* 인원 */}
          <div className="md:col-span-1 relative" ref={guestPickerRef}>
            <label htmlFor="guests" className="form-label">
              <User size={16} className="inline-block mr-1" />
              인원
            </label>
            <button
              type="button"
              id="guests"
              onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
              className="form-input w-full flex items-center justify-start px-3 py-2"
            >
              {/* ✅ 총 n명' 오른쪽에 화살표 아이콘 */}
              <div className="flex items-center gap-2 text-gray-800">
                <span>총 {totalGuests}명</span>
                {isGuestPickerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {isGuestPickerOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border z-10 p-4 space-y-4">
                <GuestCounter count={adults} setCount={setAdults} label="성인" />
                <GuestCounter count={children} setCount={setChildren} label="아동" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn-primary w-full text-lg">
            <Search size={20} className="inline-block mr-2" />
            검색하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default MainPage;
