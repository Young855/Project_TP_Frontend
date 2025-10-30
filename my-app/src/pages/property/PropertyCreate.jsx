import React, { useState } from "react";
import { useNavigate, Form, Link } from "react-router-dom"; 

const PROPERTY_TYPES = ["HOTEL", "HOUSE", "RESORT"]; // Property.java의 PropertyType Enum 값

const PropertyCreatePage = () => { // 컴포넌트 이름을 페이지 형태로 변경 (라우터에 맞춤)
  const navigate = useNavigate();

  // 상태 관리는 폼 전송 방식에서는 필요 없지만, 입력값 상태나 에러 메시지를 위해 유지

  // Mock 상태 (도로명 주소 API 사용을 가정하고 필드명 변경)
  const [addressFull, setAddressFull] = useState(""); // 도로명 주소 API 결과 전체 주소
  const [city, setCity] = useState(""); // 시/구/동 (도로명 API에서 추출하거나 별도 입력)
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [errMsg, setErrMsg] = useState("");
  
  // NOTE: partnerId는 현재 로그인된 파트너 정보에서 가져와야 하지만, 폼에서는 숨김 처리

  // --- Mock/Demo 함수 (실제 API 통합 시 삭제) ---
  const handleAddressSearch = () => {
    // 💡 [개선] 실제 도로명 주소 API (예: Postcode, Daum 주소 API) 호출 로직이 여기에 들어갑니다.
    // 여기서는 Mock 데이터로 대체
    alert("도로명 주소 검색 API를 호출합니다.");
    setAddressFull("서울 강남구 테헤란로 123");
    setCity("강남구");
    setLatitude(37.50123);
    setLongitude(127.03789);
    // Lat/Lng 값은 주소 API 또는 지도 API를 통해 얻는 것을 가정합니다.
  };
  // --------------------------------------------------

  // HTML <Form> 태그 대신 react-router-dom의 <Form> 컴포넌트 사용
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">새 숙소 등록</h1>
      
      {/* 💡 [수정] react-router-dom의 Form 사용: action으로 데이터를 createAction으로 보냅니다 */}
      <Form 
          method="post" 
          action="/properties/new" // PropertyRouter.jsx의 createAction 경로
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* 파트너 ID (현재 로그인 사용자 ID로 대체 필요) */}
        <input type="hidden" name="partnerId" defaultValue={1} /> {/* Mock Partner ID */}
        
        {/* ... (숙소명, 숙소 유형, 설명, 체크인/아웃, 평점 필드 유지) ... */}

        {/* 💡 [수정] 주소 입력: 도로명 주소 API를 염두에 둔 레이아웃 */}
        <div>
          <label className="form-label">주소</label>
          <div className="flex space-x-2">
            <input 
                type="text"
                // 💡 [수정] name="address"를 유지하고 value={addressFull}로 연결
                name="address"
                value={addressFull} 
                onChange={(e) => setAddressFull(e.target.value)}
                className="form-input flex-1" 
                placeholder="도로명 주소 검색 버튼을 눌러주세요" 
                maxLength={255}
                required
                readOnly 
            />
             <button
                type="button"
                onClick={handleAddressSearch} // 도로명 주소 API 호출
                className="btn-secondary w-32"
              >
                주소 검색
              </button>
          </div>
        </div>
        
        {/* 도시 (City) - 주소 API 결과로 채워지거나 선택적으로 입력 */}
        <div>
          <label className="form-label" htmlFor="city">도시 (시/군/구)</label>
          <input 
              name="city" 
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="form-input w-full"
              maxLength={100}
              placeholder="예: 서울, 강남구"
          />
        </div>
        
        {/* 💡 [필수] 위도/경도 Hidden Field: 상태를 폼 데이터로 보내기 위해 name과 value 연결 */}
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />

        {/* ... (나머지 필드 유지) ... */}
        
        {/* 💡 [수정] 버튼 위치 변경 */}
        <div className="flex justify-end space-x-2 pt-4">
          <Link to="/property/properties" className="btn-secondary">취소</Link> 
          <button type="submit" className="btn-primary">저장</button>
        </div>
      </Form>
    </div>
  );
};

export default PropertyCreatePage;