// 파일: src/pages/property/PropertyEdit.jsx (수정)

import React, { useState } from "react";
// 💡 [수정] useLoaderData와 Form 임포트
import { useNavigate, useParams, useLoaderData, Form, Link } from "react-router-dom"; 
// import { getProperty, updateProperty } from "../../api/propertyAPI"; // 이제 loader에서 처리

const PROPERTY_TYPES = ["HOTEL", "HOUSE", "RESORT"]; // Property.java의 PropertyType Enum 값으로 통일

const PropertyEditPage = () => { // 컴포넌트 이름을 페이지 형태로 변경
  // 💡 [수정] loader에서 불러온 데이터 사용
  const { property } = useLoaderData(); 
  const { id } = useParams();
  
  // NOTE: 로딩, 에러, 제출 상태는 이제 라우터가 관리합니다.
  
  // 💡 [추가] 초기값 설정 및 주소 상태 관리
  // (PropertyCreate와 일관성을 위해 주소 관련 필드를 상태로 관리)
  // 폼의 defaultValue로 값을 설정합니다.
  
  const initialCity = property.city || '';
  const initialAddress = property.address || '';
  const initialLat = property.latitude || '';
  const initialLng = property.longitude || '';

  const [addressFull, setAddressFull] = useState(initialAddress); 
  const [city, setCity] = useState(initialCity); 
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);


  // --- Mock/Demo 함수 (주소 검색) ---
  const handleAddressSearch = () => {
    alert("도로명 주소 검색 API를 호출합니다.");
    setAddressFull("서울 강남구 테헤란로 123"); // Mock 주소
    setCity("강남구"); // Mock 도시
    setLatitude(37.50123); // Mock 위도
    setLongitude(127.03789); // Mock 경도
  };
  // ------------------------------------

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">숙소 수정: {property.name}</h1>
      
      {/* 💡 [수정] react-router-dom의 Form 사용: action으로 editAction으로 보냄 */}
      <Form 
          method="post" 
          action={`/properties/${id}/edit`} // PropertyRouter.jsx의 editAction 경로
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* 파트너 ID (수정 시에도 필요) */}
        <input type="hidden" name="partnerId" defaultValue={property.partner?.partnerId || property.partnerId} />
        
        {/* 숙소명 */}
        <div>
          <label className="form-label" htmlFor="name">숙소명</label>
          <input name="name" id="name" defaultValue={property.name} className="form-input w-full" maxLength={255} required />
        </div>
        
        {/* 숙소 유형 */}
        <div>
          <label className="form-label" htmlFor="propertyType">숙소 유형</label>
          <select 
            name="propertyType" 
            id="propertyType"
            className="form-select w-full" 
            defaultValue={property.propertyType}
          >
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* 💡 [수정] 주소 입력: 도로명 주소 API를 염두에 둔 레이아웃 */}
        <div>
          <label className="form-label">주소</label>
          <div className="flex space-x-2">
            <input 
                type="text"
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
                onClick={handleAddressSearch}
                className="btn-secondary w-32"
              >
                주소 검색
              </button>
          </div>
        </div>
        
        {/* 도시 (City) */}
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
        
        {/* 설명 */}
        <div>
          <label className="form-label" htmlFor="description">숙소 설명</label>
          <textarea name="description" id="description" defaultValue={property.description} className="form-input w-full" rows={3} />
        </div>

        {/* 체크인/체크아웃 시간 */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="form-label" htmlFor="checkinTime">체크인 시간</label>
            <input type="time" name="checkinTime" id="checkinTime" defaultValue={property.checkinTime} className="form-input w-full" />
          </div>
          <div className="flex-1">
            <label className="form-label" htmlFor="checkoutTime">체크아웃 시간</label>
            <input type="time" name="checkoutTime" id="checkoutTime" defaultValue={property.checkoutTime} className="form-input w-full" />
          </div>
        </div>
        
        {/* 평점 */}
        <div>
          <label className="form-label" htmlFor="ratingAvg">평균 평점 (0~5)</label>
          <input type="number" step="0.01" min={0} max={5} name="ratingAvg" id="ratingAvg" defaultValue={property.ratingAvg} className="form-input w-full" />
        </div>
        
        {/* 💡 [수정] 버튼 위치 변경 */}
        <div className="flex justify-end space-x-2 pt-4">
          <Link to={`/properties/${id}`} className="btn-secondary">취소</Link> 
          <button type="submit" className="btn-primary bg-amber-600 hover:bg-amber-700">수정 저장</button>
        </div>
      </Form>
    </div>
  );
};

export default PropertyEditPage;