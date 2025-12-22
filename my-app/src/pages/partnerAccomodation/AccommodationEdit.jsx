import React, { useState } from "react";
import { useNavigate, useParams, useLoaderData, useNavigation } from "react-router-dom"; 
import AmenitySelector from "../../components/AmenitySelector"; 
import { updateAccommodation } from "../../api/accommodationAPI"; 

// [추가] 로딩 스피너 컴포넌트
const Spinner = ({ color = "text-white" }) => (
  <svg className={`animate-spin -ml-1 mr-2 h-4 w-4 ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ACCOMMODATION_TYPES = ["HOTEL", "PENSION", "GUESTHOUSE", "RESORT"];

const AccommodationEdit = () => {
  const { accommodation } = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // React Router의 네비게이션 상태 감지
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  const [addressFull, setAddressFull] = useState(accommodation.address || "");
  const [city, setCity] = useState(accommodation.city || "");
  const [latitude, setLatitude] = useState(accommodation.latitude || "");
  const [longitude, setLongitude] = useState(accommodation.longitude || "");
  const [errMsg, setErrMsg] = useState("");

  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const initialAmenityNames = new Set(accommodation.amenities?.map(a => a.name) || []); 
  const [selectedAmenityNames, setSelectedAmenityNames] = useState(initialAmenityNames);

  const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

  // [상태 통합] API 제출 중, 라우터 이동 중, 주소 검색 중 하나라도 있으면 busy 상태
  const isBusy = submitting || isNavigating || isAddressSearching;

  const handleAddressSearch = async () => {
    if (!KAKAO_API_KEY) {
        setErrMsg("Kakao API 키가 설정되지 않았습니다.");
        return;
    }
    if (addressFull.trim() === '') {
        setErrMsg('주소를 입력한 후 검색 버튼을 눌러주세요.');
        return;
    }

    setIsAddressSearching(true);
    setErrMsg(""); 

    try {
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(addressFull)}`,
            {
                headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
            }
        );
        const data = await response.json();

        if (data.documents && data.documents.length > 0) {
            const firstResult = data.documents[0];
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
        console.error(error);
        setErrMsg('API 호출 중 오류가 발생했습니다.');
    } finally {
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

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (isBusy) return;

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // API Payload 구성
    const payload = {
        ...data,
        partnerId: Number(data.partnerId), 
        latitude: Number(latitude),        
        longitude: Number(longitude),
        // 편의시설 배열 처리
        amenityNames: Array.from(selectedAmenityNames),
        amenities: Array.from(selectedAmenityNames).map(name => ({ name }))
    };

    try {
        setSubmitting(true); // 로딩 시작
        
        // 1. 서버 수정 요청
        await updateAccommodation(id, payload);

        // 2. 알림 표시
        alert("수정이 완료되었습니다.");
        
        // 3. 페이지 이동
        navigate(`/partner/accommodations/${id}`);

        // [핵심] 성공 시에는 setSubmitting(false)를 호출하지 않습니다.
        // 페이지가 완전히 이동할 때까지 버튼을 '저장 중...' 상태(스피너)로 유지합니다.
        
    } catch (error) {
        console.error("수정 실패:", error);
        const msg = error.response?.data?.message || "수정 중 오류가 발생했습니다.";
        alert(msg);
        
        // 에러가 났을 때만 로딩을 풀어줍니다.
        setSubmitting(false); 
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">숙소 수정: {accommodation.name}</h1>
      
      <form 
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        <input type="hidden" name="partnerId" defaultValue={accommodation.partner?.partnerId || accommodation.partnerId} />
        
        <div>
          <label className="form-label" htmlFor="name">숙소명</label>
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
             <button
                type="button"
                onClick={handleAddressSearch}
                disabled={isBusy} 
                className={`flex items-center justify-center btn-secondary-outline ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ minWidth: '100px' }}
              >
                {isAddressSearching ? <><Spinner color="text-blue-600" /> 검색 중</> : "주소 검색"}
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
        
        {/* hidden input은 payload에서 배열로 덮어쓰므로 무시됨 */}
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
          <button 
            type="submit" 
            disabled={isBusy} 
            className={`flex items-center btn-primary ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {/* [변경] isBusy일 때 스피너와 '저장 중...' 표시 */}
            {isBusy ? <><Spinner /> 저장 중...</> : "수정 저장"}
          </button> 
          <button 
            type="button" 
            onClick={() => navigate(`/partner/accommodations/${id}`)} 
            disabled={isBusy} 
            className={`flex items-center btn-secondary-outline ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccommodationEdit;