import React, { useState } from "react";
import { useNavigate, Form, Link } from "react-router-dom"; 

const PROPERTY_TYPES = ["HOTEL", "HOUSE", "RESORT"]; 

const PropertyCreatePage = () => { 
  const navigate = useNavigate();
  const [addressFull, setAddressFull] = useState(""); // 도로명 주소 API 결과 전체 주소
  const [city, setCity] = useState(""); // 시/구/동 (도로명 API에서 추출하거나 별도 입력)
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const handleAddressSearch = () => {
    alert("도로명 주소 검색 API를 호출합니다.");
    setAddressFull("서울 강남구 테헤란로 123");
    setCity("강남구");
    setLatitude(37.50123);
    setLongitude(127.03789);
  };
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">새 숙소 등록</h1>
      <Form 
          method="post" 
          action="/properties/new" 
          className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        <input type="hidden" name="partnerId" defaultValue={1} /> 
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
                onClick={handleAddressSearch} // 도로명 주소 API 호출
                className="btn-secondary w-32"
              >
                주소 검색
              </button>
          </div>
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
          />
        </div>
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />
        <div className="flex justify-end space-x-2 pt-4">
          <Link to="/property/properties" className="btn-secondary">취소</Link> 
          <button type="submit" className="btn-primary">저장</button>
        </div>
      </Form>
    </div>
  );
};

export default PropertyCreatePage;