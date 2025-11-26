// 파일: PropertyEdit.jsx
import React, { useState } from "react";
import { useNavigate, useParams, useLoaderData, Form, Link } from "react-router-dom"; 
import AmenitySelector from "../../components/AmenitySelector"; 
import axios from "axios"; // 카카오 API 사용

const PROPERTY_TYPES = ["HOTEL", "PENSION", "GUESTHOUSE", "RESORT"];

const PropertyEditPage = () => {
  const { property } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 주소 및 좌표 상태 관리 (기존 property 데이터로 초기화)
  const [addressFull, setAddressFull] = useState(property.address || "");
  const [city, setCity] = useState(property.city || "");
  const [latitude, setLatitude] = useState(property.latitude || "");
  const [longitude, setLongitude] = useState(property.longitude || "");
  const [errMsg, setErrMsg] = useState("");

  // [수정] 편의시설 선택 상태 (ID -> Name 기반으로 변경)
  // 기존 property.amenities에서 amenityId 대신 name을 추출하여 Set으로 초기화합니다.
  const initialAmenityNames = new Set(property.amenities?.map(a => a.name) || []); 
  const [selectedAmenityNames, setSelectedAmenityNames] = useState(initialAmenityNames);

  // [추가] 카카오 API 키
  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

  // [수정] 주소 검색 로직 (Create와 동일하게)
  const handleAddressSearch = async () => {
    if (!KAKAO_API_KEY) {
        setErrMsg("Kakao API 키가 설정되지 않았습니다.");
        return;
    }
    if (addressFull.trim() === '') {
        setErrMsg('주소를 입력한 후 검색 버튼을 눌러주세요.');
        return;
    }
    try {
        const response = await axios.get(
            'https://dapi.kakao.com/v2/local/search/address.json',
            {
                params: { query: addressFull },
                headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
            }
        );
        if (response.data.documents.length > 0) {
            const firstResult = response.data.documents[0];
            const fullAddr = firstResult.road_address ? firstResult.road_address.address_name : firstResult.address.address_name;
            const cityAddr = firstResult.road_address ? firstResult.road_address.region_2depth_name : firstResult.address.region_2depth_name;
            setAddressFull(fullAddr);
            setCity(cityAddr || "");
            setLatitude(firstResult.y);
            setLongitude(firstResult.x);
            setErrMsg("");
        } else {
            setErrMsg('검색 결과가 없습니다. 주소를 확인해주세요.');
            setLatitude(""); setLongitude(""); setCity("");
        }
    } catch (error) {
        setErrMsg('API 호출 중 오류가 발생했습니다.');
    }
  };

  // [수정] 편의시설 체크박스 핸들러 (ID -> Name 기반으로 변경)
  const handleAmenityChange = (amenityName) => {
      setSelectedAmenityNames((prevSet) => {
          const newSet = new Set(prevSet);
          if (newSet.has(amenityName)) {
              newSet.delete(amenityName);
          } else {
              newSet.add(amenityName);
          }
          return newSet;
      });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">숙소 수정: {property.name}</h1>
      
      <Form 
          method="post" 
          action={`/partner/properties/${id}/edit`} // action 경로
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* 기존 데이터 기본값 설정 */}
        <input type="hidden" name="partnerId" defaultValue={property.partner?.partnerId || property.partnerId} />
        
        <div>
          <label className="form-label" htmlFor="name">숙소명</label>
          {/* property.name으로 기본값 설정 */}
          <input name="name" id="name" defaultValue={property.name} className="form-input w-full" maxLength={255} required />
        </div>
        
        <div>
          <label className="form-label" htmlFor="propertyType">숙소 유형</label>
          {/* property.propertyType으로 기본값 설정 */}
          <select 
            name="propertyType" 
            id="propertyType"
            className="form-input w-full"
            defaultValue={property.propertyType}
            required
          >
             <option value="">-- 숙소 유형 선택 --</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* 주소 입력 필드 (상태 기반으로 값 제어) */}
        <div>
          <label className="form-label">주소</label>
          <div className="flex space-x-2">
            <input 
                type="text"
                name="address"
                value={addressFull} // 상태값 사용
                onChange={(e) => setAddressFull(e.target.value)}
                className="form-input flex-1"
                placeholder="도로명 주소를 입력하거나 '주소 검색'을 이용하세요" 
                maxLength={255}
                required
            />
             <button
                type="button"
                onClick={handleAddressSearch}
                className="btn-secondary-outline"
              >
                주소 검색
              </button>
          </div>
          {errMsg && (<p className="text-sm text-red-500 mt-1">{errMsg}</p>)}
        </div>
        
        <div>
          <label className="form-label" htmlFor="city">도시 (시/군/구)</label>
          <input 
              name="city" 
              id="city"
              value={city} // 상태값 사용
              onChange={(e) => setCity(e.target.value)}
              className="form-input w-full"
              maxLength={100}
              placeholder="예: 서울, 강남구"
              required
          />
        </div>
        
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />
        
        <div>
          <label className="form-label" htmlFor="description">숙소 설명</label>
          {/* property.description으로 기본값 설정 */}
          <textarea name="description" id="description" defaultValue={property.description} className="form-input w-full" rows={4} /> 
        </div>

        {/* --- AmenitySelector (Name 기반으로 prop 전달) --- */}
        <AmenitySelector 
            selectedNames={selectedAmenityNames} // [수정] Name 기반 Set 전달
            onChange={handleAmenityChange}
        />
        
        {/* [수정] 선택된 Name을 콤마(,)로 구분된 문자열로 폼에 포함 */}
        <input 
            type="hidden" 
            name="amenityNames" 
            value={Array.from(selectedAmenityNames).join(',')} 
        />
        {/* ----------------------------- */}

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="form-label" htmlFor="checkinTime">체크인 시간</label>
            {/* property.checkinTime으로 기본값 설정 */}
            <input type="time" name="checkinTime" id="checkinTime" defaultValue={property.checkinTime} className="form-input w-full" required /> 
          </div>
          <div className="flex-1">
            <label className="form-label" htmlFor="checkoutTime">체크아웃 시간</label>
            {/* property.checkoutTime으로 기본값 설정 */}
            <input type="time" name="checkoutTime" id="checkoutTime" defaultValue={property.checkoutTime} className="form-input w-full" required /> 
          </div>
        </div>
        
        <div>
          <label className="form-label" htmlFor="ratingAvg">평균 평점 (0~5)</label>
          <input 
            type="number" 
            step="0.01" 
            min={0} 
            max={5} 
            name="ratingAvg" 
            id="ratingAvg" 
            defaultValue={property.ratingAvg} 
            className="form-input w-full bg-gray-100 cursor-not-allowed" // [수정] 배경색 변경으로 비활성화 느낌 강조
            readOnly // [핵심 수정] 읽기 전용으로 설정하여 수정 불가
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button type="submit" className="btn-primary">수정 저장</button> 
          <button 
            type="button"
            onClick={() => navigate(`/partner/properties/${id}`)}
            className="btn-secondary-outline"
          >
            취소
          </button>
        </div>
      </Form>
    </div>
  );
};

export default PropertyEditPage;