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

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({ destination, checkIn, checkOut, guests: totalGuests });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target)) {
        setIsGuestPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [guestPickerRef]);

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

          <div className="md:col-span-1 relative" ref={guestPickerRef}>
            <label htmlFor="guests" className="form-label">
              <User size={16} className="inline-block mr-1" />
              인원
            </label>
            <button
              type="button"
              id="guests"
              onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}
              className="form-input text-left w-full flex justify-between items-center"
            >
              <span>총 {totalGuests}명</span>
              {isGuestPickerOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
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