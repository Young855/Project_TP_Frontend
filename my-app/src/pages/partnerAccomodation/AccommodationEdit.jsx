import React, { useState } from "react";
// 1. useNavigation 추가
import { useNavigate, useParams, useLoaderData, Form, useNavigation } from "react-router-dom"; 
import AmenitySelector from "../../components/AmenitySelector"; 
import axios from "axios"; 

const ACCOMMODATION_TYPES = ["HOTEL", "PENSION", "GUESTHOUSE", "RESORT"];

const AccommodationEdit = () => {
  const { accommodation } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 2. Form 제출 상태 감지를 위한 hook 사용
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 주소 및 좌표 상태 관리
  const [addressFull, setAddressFull] = useState(accommodation.address || "");
  const [city, setCity] = useState(accommodation.city || "");
  const [latitude, setLatitude] = useState(accommodation.latitude || "");
  const [longitude, setLongitude] = useState(accommodation.longitude || "");
  const [errMsg, setErrMsg] = useState("");

  // 3. 주소 검색 로딩 상태 관리
  const [isAddressSearching, setIsAddressSearching] = useState(false);

  const initialAmenityNames = new Set(accommodation.amenities?.map(a => a.name) || []); 
  const [selectedAmenityNames, setSelectedAmenityNames] = useState(initialAmenityNames);

  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

  // 모든 로딩 상태 통합 (Form 제출 중이거나 주소 검색 중일 때 true)
  const isBusy = isSubmitting || isAddressSearching;

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

    // 검색 시작 시 로딩 상태 true
    setIsAddressSearching(true);
    setErrMsg(""); // 기존 에러 초기화

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
        } else {
            setErrMsg('검색 결과가 없습니다. 주소를 확인해주세요.');
            setLatitude(""); setLongitude(""); setCity("");
        }
    } catch (error) {
        setErrMsg('API 호출 중 오류가 발생했습니다.');
    } finally {
        // 성공하든 실패하든 검색 종료 시 로딩 상태 false
        setIsAddressSearching(false);
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
          action={`/partner/accommodations/${id}/edit`} 
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* 기존 input 필드들 (생략 없이 유지) */}
        <input type="hidden" name="partnerId" defaultValue={accommodation.partner?.partnerId || accommodation.partnerId} />
        
        <div>
          <label className="form-label" htmlFor="name">숙소명</label>
          {/* 작업 중일 때 입력도 막고 싶다면 readOnly={isBusy} 추가 가능 */}
          <input name="name" id="name" defaultValue={accommodation.name} className="form-input w-full" maxLength={255} required />
        </div>
        
        <div>
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
             {/* 4. 주소 검색 버튼 비활성화 처리 */}
             <button
                type="button"
                onClick={handleAddressSearch}
                disabled={isBusy} // 로딩 중이면 비활성화
                className={`btn-secondary-outline ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isAddressSearching ? "검색 중..." : "주소 검색"}
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

        <AmenitySelector 
            selectedNames={selectedAmenityNames}
            onChange={handleAmenityChange}
            type="ACCOMMODATION"
        />
        
        <input 
            type="hidden" 
            name="amenityNames" 
            value={Array.from(selectedAmenityNames).join(',')} 
        />

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
          {/* 5. 저장 및 취소 버튼 비활성화 처리 */}
          <button 
            type="submit" 
            disabled={isBusy} 
            className={`btn-primary ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "저장 중..." : "수정 저장"}
          </button> 
          <button 
            type="button"
            onClick={() => navigate(`/partner/accommodations/${id}`)}
            disabled={isBusy}
            className={`btn-secondary-outline ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            취소
          </button>
        </div>
      </Form>
    </div>
  );
};

export default AccommodationEdit;