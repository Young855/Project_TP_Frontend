import React from 'react';
import {
  FaUtensils, FaCoffee, FaGlassMartiniAlt, FaCouch, FaSwimmer, FaDumbbell,
  FaSpa, FaGolfBall, FaBriefcase, FaLaptop, FaShoppingBag, FaChild,
  FaParking, FaBath, FaWifi, FaSmokingBan, FaTv, FaShower,
  FaCreditCard, FaPlayCircle, FaQuestionCircle,
  FaHotTub,
  FaThermometerHalf,
  FaToilet
} from 'react-icons/fa';
import {
  MdSportsTennis, MdMeetingRoom, MdNightlife, MdAcUnit, MdKitchen,
  MdDry, MdLock, MdCoffeeMaker, MdElevator, MdSoupKitchen,
  MdLocalLaundryService,
  MdBalcony,
  MdAir,
  MdIron,
  MdCheckroom
} from 'react-icons/md';

// 1. 숙소(Accommodation) 전용 편의시설
const ACCOMMODATION_AMENITIES = [
  { name: "레스토랑", icon: <FaUtensils /> },
  { name: "카페&베이커리", icon: <FaCoffee /> },
  { name: "피트니스", icon: <FaDumbbell /> },
  { name: "주차장", icon: <FaParking /> }, // 무료 주차 포함
  { name: "엘리베이터", icon: <MdElevator /> },
  { name: "카드결제", icon: <FaCreditCard /> },
  { name: "바", icon: <FaGlassMartiniAlt /> },
  { name: "라운지", icon: <FaCouch /> },
  { name: "수영장", icon: <FaSwimmer /> }, // 야외 수영장 포함
  { name: "스파&사우나", icon: <FaSpa /> }, // 사우나 포함
  { name: "골프시설", icon: <FaGolfBall /> },
  { name: "테니스/스포츠", icon: <MdSportsTennis /> },
  { name: "컨퍼런스룸", icon: <MdMeetingRoom /> },
  { name: "연회장", icon: <MdNightlife /> },
  { name: "비즈니스 센터", icon: <FaBriefcase /> },
  { name: "공용 워크스페이스", icon: <FaLaptop /> },
  { name: "쇼핑 아케이드", icon: <FaShoppingBag /> },
  { name: "키즈 클럽", icon: <FaChild /> },
];

// 2. 객실(Room) 전용 편의시설
const ROOM_AMENITIES = [
  { name: "무선인터넷", icon: <FaWifi /> },
  { name: "금연", icon: <FaSmokingBan /> },
  { name: "TV", icon: <FaTv /> },
  { name: "에어컨", icon: <MdAcUnit /> },
  { name: "냉장고", icon: <MdKitchen /> },
  { name: "샤워실", icon: <FaShower /> },
  { name: "드라이기", icon: <MdDry /> },
  { name: "금고", icon: <MdLock /> },
  { name: "전기주전자", icon: <MdCoffeeMaker /> },
  { name: "OTT", icon: <FaPlayCircle /> },
  { name: "세탁기", icon: <MdLocalLaundryService /> },
  { name: "객실내취사", icon: <MdSoupKitchen /> },
  { name: "욕실용품", icon: <FaBath /> },
  { name: "욕조/월풀", icon: <FaHotTub /> },        // 욕조 및 스파
  { name: "난방", icon: <FaThermometerHalf /> },    // 난방/온돌
  { name: "테라스/발코니", icon: <MdBalcony /> },   // 테라스
  { name: "공기청정기", icon: <MdAir /> },          // 공기청정기
  { name: "다림질 도구", icon: <MdIron /> },        // 다리미
  { name: "업무용 책상", icon: <FaLaptop /> },      // 비즈니스/노트북 공간
  { name: "소파", icon: <FaCouch /> },              // 휴식 공간
  { name: "비데", icon: <FaToilet /> },             // 비데 (혹은 MdWc)
  { name: "스타일러", icon: <MdCheckroom /> },      // 의류관리기 (최근 인기 옵션)
];

/**
 * @param {Set} selectedNames - 선택된 편의시설 이름들의 Set
 * @param {Function} onChange - 변경 핸들러
 * @param {String} type - 'ACCOMMODATION' 또는 'ROOM' (기본값: ACCOMMODATION)
 */
const AmenitySelector = ({ selectedNames, onChange, type = 'ACCOMMODATION' }) => {
  
  // type prop에 따라 보여줄 리스트 결정
  // 대소문자 구분 없이 처리하기 위해 toUpperCase() 사용
  const targetAmenities = (type.toUpperCase() === 'ROOM') 
    ? ROOM_AMENITIES 
    : ACCOMMODATION_AMENITIES;

  return (
    <div>
      <label className="form-label">
        {type.toUpperCase() === 'ROOM' ? '객실 편의시설' : '숙소 편의시설'}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg bg-white">
        {targetAmenities.map((amenity) => {
          const IconComponent = amenity.icon || <FaQuestionCircle />;
          const isChecked = selectedNames.has(amenity.name);

          return (
            <label 
              key={amenity.name} 
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors ${isChecked ? 'bg-blue-50 border-blue-200 border' : ''}`}
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                checked={isChecked}
                onChange={() => onChange(amenity.name)}
              />
              <span className={`text-xl ${isChecked ? 'text-blue-600' : 'text-gray-500'}`} style={{ verticalAlign: 'middle' }}>
                {IconComponent}
              </span>
              <span className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                {amenity.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AmenitySelector;