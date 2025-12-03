// 파일명 변경: AccommodationEdit.jsx
import React, { useState } from "react";
import { useNavigate, useParams, useLoaderData, Form } from "react-router-dom"; 
import AmenitySelector from "../../components/AmenitySelector"; 
import axios from "axios"; 

// 상수명 변경
const ACCOMMODATION_TYPES = ["HOTEL", "PENSION", "GUESTHOUSE", "RESORT"];

// 컴포넌트명 변경
const AccommodationEditPage = () => {
  // [수정] Loader 데이터 키 변경 (property -> accommodation)
  const { accommodation } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 주소 및 좌표 상태 관리 (기존 accommodation 데이터로 초기화)
  const [addressFull, setAddressFull] = useState(accommodation.address || "");
  const [city, setCity] = useState(accommodation.city || "");
  const [latitude, setLatitude] = useState(accommodation.latitude || "");
  const [longitude, setLongitude] = useState(accommodation.longitude || "");
  const [errMsg, setErrMsg] = useState("");

  // [수정] 편의시설 선택 상태
  // 기존 accommodation.amenities에서 name을 추출하여 Set으로 초기화
  const initialAmenityNames = new Set(accommodation.amenities?.map(a => a.name) || []); 
  const [selectedAmenityNames, setSelectedAmenityNames] = useState(initialAmenityNames);

  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

  // 주소 검색 로직
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">숙소 수정: {accommodation.name}</h1>
      
      <Form 
          method="post" 
          // Action 경로 변경: properties -> accommodations
          action={`/partner/accommodations/${id}/edit`} 
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* 기존 데이터 기본값 설정 */}
        <input type="hidden" name="partnerId" defaultValue={accommodation.partner?.partnerId || accommodation.partnerId} />
        
        <div>
          <label className="form-label" htmlFor="name">숙소명</label>
          <input name="name" id="name" defaultValue={accommodation.name} className="form-input w-full" maxLength={255} required />
        </div>
        
        <div>
          {/* 필드명 변경: propertyType -> accommodationType */}
          <label className="form-label" htmlFor="accommodationType">숙소 유형</label>
          <select 
            name="accommodationType" 
            id="accommodationType"
            className="form-input w-full"
            defaultValue={accommodation.accommodationType}
            required
          >
             <option value="">-- 숙소 유형 선택 --</option>
            {ACCOMMODATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* 주소 입력 필드 */}
        <div>
          <label className="form-label">주소</label>
          <div className="flex space-x-2">
            <input 
                type="text"
                name="address"
                value={addressFull} 
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
              value={city} 
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
          <textarea name="description" id="description" defaultValue={accommodation.description} className="form-input w-full" rows={4} /> 
        </div>

        {/* --- AmenitySelector --- */}
        <AmenitySelector 
            selectedNames={selectedAmenityNames}
            onChange={handleAmenityChange}
        />
        
        <input 
            type="hidden" 
            name="amenityNames" 
            value={Array.from(selectedAmenityNames).join(',')} 
        />
        {/* ----------------------------- */}

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="form-label" htmlFor="checkinTime">체크인 시간</label>
            <input type="time" name="checkinTime" id="checkinTime" defaultValue={accommodation.checkinTime} className="form-input w-full" required /> 
          </div>
          <div className="flex-1">
            <label className="form-label" htmlFor="checkoutTime">체크아웃 시간</label>
            <input type="time" name="checkoutTime" id="checkoutTime" defaultValue={accommodation.checkoutTime} className="form-input w-full" required /> 
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
            defaultValue={accommodation.ratingAvg} 
            className="form-input w-full bg-gray-100 cursor-not-allowed" 
            readOnly 
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button type="submit" className="btn-primary">수정 저장</button> 
          <button 
            type="button"
            // 취소 버튼 경로 변경
            onClick={() => navigate(`/partner/accommodations/${id}`)}
            className="btn-secondary-outline"
          >
            취소
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AccommodationEditPage;