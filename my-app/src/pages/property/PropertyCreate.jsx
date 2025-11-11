import axios from "axios"; 
import React, { useState } from "react";
import { useNavigate, Form, Link, useSearchParams } from "react-router-dom"; 
const PROPERTY_TYPES = ["HOTEL", "PENSION", "GUESTHOUSE", "RESORT"]; 

const PropertyCreatePage = () => { 
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();  
    const partnerId = searchParams.get('partnerId') || 1; 
    const [addressFull, setAddressFull] = useState(""); 
    const [city, setCity] = useState(""); 
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    
    const [errMsg, setErrMsg] = useState("");
    const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;
    const handleAddressSearch = async () => {
        
        if (!KAKAO_API_KEY) {
            setErrMsg("Kakao API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
            return;
        }
        
        // 입력값이 비어있는지 확인
        if (addressFull.trim() === '') {
            setErrMsg('주소를 입력한 후 검색 버튼을 눌러주세요.');
            return;
        }

        try {
            const response = await axios.get(
                'https://dapi.kakao.com/v2/local/search/address.json',
                {
                    params: { 
                        query: addressFull // state에 저장된 addressFull 값을 query로 사용
                    },
                    headers: { 
                        Authorization: `KakaoAK ${KAKAO_API_KEY}` 
                    },
                }
            );

            // API 결과가 1개 이상 있을 경우
            if (response.data.documents.length > 0) {
                const firstResult = response.data.documents[0];
                
                // 도로명 주소가 있으면 도로명 주소를, 없으면 지번 주소를 사용
                const fullAddr = firstResult.road_address 
                               ? firstResult.road_address.address_name 
                               : firstResult.address.address_name;
                
                // 시/군/구 (API 응답의 region_2depth_name 사용)
                const cityAddr = firstResult.road_address 
                               ? firstResult.road_address.region_2depth_name 
                               : firstResult.address.region_2depth_name;

                // [수정] 검색된 결과로 state를 업데이트합니다.
                setAddressFull(fullAddr); // 표준화된 전체 주소로 업데이트
                setCity(cityAddr || "");  // 시/군/구 정보로 업데이트
                setLatitude(firstResult.y);   // 위도
                setLongitude(firstResult.x);  // 경도
                
                setErrMsg(""); // 성공 시 에러 메시지 초기화

            } else {
                // 검색 결과가 없을 경우
                setErrMsg('검색 결과가 없습니다. 주소를 확인해주세요.');
                setLatitude(""); // 기존 좌표 초기화
                setLongitude("");
                setCity("");
            }

        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            setErrMsg('API 호출 중 오류가 발생했습니다.');
        }
    };

    const handleCancel = () => {
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
                <input type="hidden" name="partnerId" defaultValue={partnerId} />
                
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

                <div>
                    <label className="form-label">주소</label>
                    <div className="flex space-x-2">
                        <input 
                            type="text"
                            name="address"
                            value={addressFull} 
                            // [수정] 사용자가 직접 입력할 수 있도록 onChange 핸들러 유지
                            onChange={(e) => setAddressFull(e.target.value)}
                            className="form-input flex-1" 
                            placeholder="도로명 주소를 입력하거나 '주소 검색'을 이용하세요" 
                            maxLength={255}
                            required
                        />
                        <button
                            type="button" // 폼 전송 방지
                            onClick={handleAddressSearch}
                            className="btn-secondary whitespace-nowrap w-30 text-gray-700" 
                        >
                            주소 검색
                        </button>
                    </div>
                    
                    {/* [추가] 에러 메시지를 사용자에게 보여줍니다. */}
                    {errMsg && (
                        <p className="text-sm text-red-500 mt-1">{errMsg}</p>
                    )}
                </div>
                
                <div>
                    <label className="form-label" htmlFor="city">도시 (시/군/구)</label>
                    <input 
                        name="city" 
                        id="city"
                        value={city}
                        // [수정] '주소 검색' 결과로 자동 채워지므로 읽기 전용 또는 disabled 처리 권장
                        // 여기서는 수동 입력도 가능하도록 onChange를 유지합니다.
                        onChange={(e) => setCity(e.target.value)}
                        className="form-input w-full"
                        maxLength={100}
                        placeholder="예: 서울, 강남구 (주소 검색 시 자동 입력)"
                        required
                    />
                </div>
                
                {/* 위도/경도는 state 값에 의해 자동으로 채워집니다. */}
                <input type="hidden" name="latitude" value={latitude} />
                <input type="hidden" name="longitude" value={longitude} />

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