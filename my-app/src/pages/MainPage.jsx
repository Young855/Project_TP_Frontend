import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import GuestCounter from '../components/GuestCounter';

const MainPage = () => {
  const navigate = useNavigate();

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const guestPickerRef = useRef(null);

  const totalGuests = adults + children;
  const todayStr = new Date().toISOString().split('T')[0];

  const getNextDay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const isSearchable = checkIn && checkOut;

  const handleSearchClick = (e) => {
    e.preventDefault();

    if (!destination.trim()) {
      alert("여행지나 숙소 이름을 입력해주세요.");
      document.getElementById("destination").focus();
      return;
    }

    if (!isSearchable) {
      alert("체크인과 체크아웃 날짜를 선택해주세요.");
      return;
    }

    if (checkOut <= checkIn) {
      alert("체크아웃 날짜는 체크인 날짜보다 하루 이상 뒤여야 합니다.");
      return;
    }

    const params = new URLSearchParams();
    params.set("keyword", destination);
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("guests", totalGuests);

    navigate(`/search?${params.toString()}`);
  };

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
        onSubmit={handleSearchClick}
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
                  const newCheckIn = e.target.value;
                  setCheckIn(newCheckIn);
                  if (checkOut && checkOut <= newCheckIn) {
                    setCheckOut(getNextDay(newCheckIn));
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
                min={checkIn ? getNextDay(checkIn) : todayStr}
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
              <div className="flex items-center gap-2 text-gray-800">
                <span>총 {totalGuests}명</span>
                {isGuestPickerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {isGuestPickerOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border z-10 p-4 space-y-4">
                <GuestCounter 
                  count={adults} 
                  setCount={(val) => {
                    if (val < 1) return; // 1 미만이면 무시
                    setAdults(val);
                  }} 
                  label="성인" 
                />
                <GuestCounter 
                  count={children} 
                  setCount={(val) => {
                    if (val < 0) return; // 0 미만이면 무시
                    setChildren(val);
                  }} 
                  label="아동" 
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button 
            type="submit" 
            disabled={!isSearchable} 
            className={`w-full text-lg font-bold py-3 rounded-md transition-colors flex items-center justify-center
              ${isSearchable 
                ? 'bg-blue-600 hover:bg-blue-700 text-gray-700 cursor-pointer' // 활성 상태
                : 'bg-gray-300 text-gray-500 cursor-not-allowed' // 비활성 상태
              }`}
          >
            <Search size={20} className="inline-block mr-2" />
            검색하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default MainPage;