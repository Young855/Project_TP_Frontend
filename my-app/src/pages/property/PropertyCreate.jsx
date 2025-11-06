import React, { useState } from "react";
import { useNavigate, Form, Link, useSearchParams } from "react-router-dom"; 
import DaumPostcode from 'react-daum-postcode';

// 💡 PropertyType.java Enum 값에 맞춥니다.
const PROPERTY_TYPES = ["HOTEL", "PENSION", "GUESTHOUSE", "RESORT"]; 

const PropertyCreatePage = () => { 
    const navigate = useNavigate();
    // URL에서 partnerId를 추출합니다.
    const [searchParams] = useSearchParams();
    // 쿼리 파라미터가 없을 경우 임시 기본값 1을 사용합니다.
    const partnerId = searchParams.get('partnerId') || 1; 

    // 주소 및 위치 상태
    const [addressFull, setAddressFull] = useState(""); 
    const [city, setCity] = useState(""); 
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    
    const [errMsg, setErrMsg] = useState("");
    

    
    // 💡 도로명 주소 API 연동을 위한 구조만 유지하고, 현재는 텍스트 입력 가능하도록 수정
    const handleAddressSearch = () => {
        // [수정] alert 대신 console.log 사용
        console.log("도로명 주소 검색 API를 호출합니다. (실제 구현 예정)");
        
        // Mock/Demo 주소 설정
        setAddressFull("서울 강남구 테헤란로 123");
        setCity("강남구");
        setLatitude(37.50123);
        setLongitude(127.03789);
    };

    const handleCancel = () => {
        // 취소 버튼 클릭 시 숙소 목록 페이지로 이동
        navigate("/partner/properties");
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">새 숙소 등록</h1>
            <Form 
                method="post" 
                action="/partner/properties/new" 
                className="bg-white shadow-md rounded-lg p-6 space-y-4"
            >
                {/* 1. 파트너 ID (FK) - Hidden Field (URL에서 가져온 값을 사용) */}
                <input type="hidden" name="partnerId" defaultValue={partnerId} />
                
                {/* 2. 숙소명 (name) - 필수 */}
                <div>
                    <label className="form-label" htmlFor="name">숙소명</label>
                    <input 
                        type="text"
                        name="name"
                        id="name"
                        className="form-input w-full" 
                        placeholder="예: TravelHub 부티크 호텔" 
                        maxLength={255}
                        required
                    />
                </div>

                {/* 3. 숙소 유형 (propertyType) - 필수 */}
                <div>
                    <label className="form-label" htmlFor="propertyType">숙소 유형</label>
                    <select 
                        name="propertyType" 
                        id="propertyType"
                        className="form-select w-full" 
                        required
                    >
                        <option value="">-- 숙소 유형 선택 --</option>
                        {PROPERTY_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* 4. 주소 (address) 및 도시 (city) - 필수 */}
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
                            type="button" // 폼 전송 방지
                            onClick={handleAddressSearch}
                            // [수정] 버튼 폭을 w-28로 지정하여 글자 깨짐 방지 및 가로 크기 확보
                            className="btn-secondary whitespace-nowrap w-30 text-gray-700" 
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
                        required
                    />
                </div>
                
                {/* 5. 위도/경도 (latitude/longitude) - Hidden Fields (주소 검색 시 채워짐) */}
                <input type="hidden" name="latitude" value={latitude} />
                <input type="hidden" name="longitude" value={longitude} />

                {/* 6. 숙소 설명 (description) */}
                <div>
                    <label className="form-label" htmlFor="description">숙소 설명</label>
                    <textarea 
                        name="description" 
                        id="description"
                        className="form-input w-full"
                        rows={4}
                        placeholder="숙소의 특징, 서비스, 유의사항 등을 자세히 설명해주세요."
                    />
                </div>

                {/* 7. 체크인/체크아웃 시간 (checkinTime/checkoutTime) - 필수 */}
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="form-label" htmlFor="checkinTime">체크인 시간</label>
                        <input type="time" name="checkinTime" id="checkinTime" className="form-input w-full" required />
                    </div>
                    <div className="flex-1">
                        <label className="form-label" htmlFor="checkoutTime">체크아웃 시간</label>
                        <input type="time" name="checkoutTime" id="checkoutTime" className="form-input w-full" required />
                    </div>
                </div>
                
                <input type="hidden" name="ratingAvg" defaultValue={5.0} />

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="submit" className="btn-primary">저장</button>
                    <button 
                        type="button" 
                        onClick={handleCancel} 
                        className="btn-secondary w-30 text-gray-700"
                    >
                        취소
                    </button>
                </div>
            </Form>
        </div>
    );
};

export default PropertyCreatePage;