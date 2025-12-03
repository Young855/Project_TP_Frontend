
import {
  FaUtensils, FaCoffee, FaGlassMartiniAlt, FaCouch, FaSwimmer, FaDumbbell,
  FaSpa, FaGolfBall, FaBriefcase, FaLaptop, FaShoppingBag, FaChild,
  FaParking, FaBath, FaWifi, FaSmokingBan, FaTv, FaLuggageCart, FaShower,
  FaCreditCard, FaPlayCircle, FaQuestionCircle
} from 'react-icons/fa';
import {
  MdSportsTennis, MdMeetingRoom, MdNightlife, MdAcUnit, MdKitchen,
  MdDry, MdLock, MdCoffeeMaker, MdElevator, MdSoupKitchen,
  MdLocalLaundryService
} from 'react-icons/md';

const MASTER_AMENITIES = [
  { name: "레스토랑", icon: <FaUtensils /> },
  { name: "카페&베이커리", icon: <FaCoffee /> },
  { name: "피트니스", icon: <FaDumbbell /> },
  { name: "욕실 용품", icon: <FaBath /> },
  { name: "무선인터넷", icon: <FaWifi /> },
  { name: "금연", icon: <FaSmokingBan /> },
  { name: "TV", icon: <FaTv /> },
  { name: "에어컨", icon: <MdAcUnit /> },
  { name: "냉장고", icon: <MdKitchen /> },
  { name: "샤워실", icon: <FaShower /> },
  { name: "드라이기", icon: <MdDry /> },
  { name: "금고", icon: <MdLock /> },
  { name: "전기주전자", icon: <MdCoffeeMaker /> },
  { name: "주차장", icon: <FaParking /> },
  { name: "엘리베이터", icon: <MdElevator /> },
  { name: "카드결제", icon: <FaCreditCard /> },
  { name: "OTT", icon: <FaPlayCircle /> },
  { name: "세탁기", icon: <MdLocalLaundryService /> },
  { name: "바", icon: <FaGlassMartiniAlt /> },
  { name: "라운지", icon: <FaCouch /> },
  { name: "수영장", icon: <FaSwimmer /> },
  { name: "스파&사우나", icon: <FaSpa /> },
  { name: "골프시설", icon: <FaGolfBall /> },
  { name: "테니스/스포츠", icon: <MdSportsTennis /> },
  { name: "컨퍼런스룸", icon: <MdMeetingRoom /> },
  { name: "연회장", icon: <MdNightlife /> },
  { name: "비즈니스 센터", icon: <FaBriefcase /> },
  { name: "공용 워크스페이스", icon: <FaLaptop /> },
  { name: "쇼핑 아케이드", icon: <FaShoppingBag /> },
  { name: "키즈 클럽", icon: <FaChild /> },
  { name: "무료 주차", icon: <FaParking /> }, 
  { name: "짐보관가능", icon: <FaLuggageCart /> },
  { name: "객실내취사", icon: <MdSoupKitchen /> },
  { name: "사우나", icon: <FaSpa /> },
  { name: "욕실용품", icon: <FaBath /> },
  { name: "야외수영장", icon: <FaSwimmer /> },
];

// 3. props를 selectedIds (숫자) -> selectedNames (문자열)로 변경
const AmenitySelector = ({ selectedNames, onChange }) => {
  // 4. API 호출 로직 (useEffect, useState) 모두 삭제

  return (
    <div>
      <label className="form-label">편의시설</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg">
        {MASTER_AMENITIES.map((amenity) => {
          const IconComponent = amenity.icon || <FaQuestionCircle />;

          return (
            <label 
              key={amenity.name} // key가 ID가 아닌 name
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                // 5. checked 여부도 name으로 확인
                checked={selectedNames.has(amenity.name)}
                // 6. 부모에게 ID가 아닌 name을 전달
                onChange={() => onChange(amenity.name)}
              />
              <span className="text-gray-600" style={{ verticalAlign: 'middle' }}>
                {IconComponent}
              </span>
              <span className="text-gray-700">{amenity.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AmenitySelector;