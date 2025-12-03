import axios from "axios"; 
import React, { useState } from "react";
import { useNavigate, Form, useSearchParams } from "react-router-dom"; 
import AmenitySelector from "../../components/AmenitySelector"; 

const ACCOMMODATION_TYPES = ["HOTEL", "PENSION", "GUESTHOUSE", "RESORT"]; 
const AccommodationCreatePage = () => { 
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 
    const partnerId = searchParams.get('partnerId') || 1;
    const [addressFull, setAddressFull] = useState("");
    const [city, setCity] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    
    const [errMsg, setErrMsg] = useState("");

    const [selectedAmenityNames, setSelectedAmenityNames] = useState(new Set());
    
    const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;
    
    const handleAddressSearch = async () => {
        if (!KAKAO_API_KEY) {
            setErrMsg("Kakao API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
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
                    params: { 
                        query: addressFull 
                    },
                    headers: { 
                        Authorization: `KakaoAK ${KAKAO_API_KEY}` 
                    },
                }
            );

            if (response.data.documents.length > 0) {
                const firstResult = response.data.documents[0];
                
                const fullAddr = firstResult.road_address
                               ? firstResult.road_address.address_name 
                               : firstResult.address.address_name;
                
                const cityAddr = firstResult.road_address
                               ? firstResult.road_address.region_2depth_name 
                               : firstResult.address.region_2depth_name;

                setAddressFull(fullAddr); 
                setCity(cityAddr || "");  
                setLatitude(firstResult.y);   
                setLongitude(firstResult.x);  
                
                setErrMsg(""); 

            } else {
                setErrMsg('검색 결과가 없습니다. 주소를 확인해주세요.');
                setLatitude(""); 
                setLongitude("");
                setCity("");
            }

        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            setErrMsg('API 호출 중 오류가 발생했습니다.');
        }
    };

    const handleCancel = () => {
        // 경로 변경: properties -> accommodations
        navigate("/partner/accommodations");
    }

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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">새 숙박 시설 등록</h1>
            <Form 
                method="post" 
                // Action 경로 변경: properties -> accommodations
                action="/partner/accommodations/new"
                className="bg-white shadow-md rounded-lg p-6 space-y-4"
            >
                <input type="hidden" name="partnerId" defaultValue={partnerId} />
                
                <div>
                    <label className="form-label" htmlFor="name">숙박 시설명</label>
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

                <div>
                    {/* 필드명 및 ID 변경: propertyType -> accommodationType */}
                    <label className="form-label" htmlFor="accommodationType">숙박 시설 유형</label>
                    <select 
                        name="accommodationType" 
                        id="accommodationType"
                        className="form-input w-full" 
                        required
                    >
                        <option value="">-- 숙박 시설 유형 선택 --</option>
                        {ACCOMMODATION_TYPES.map((t) => (
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
                        onChange={(e) => setCity(e.target.value)}
                        className="form-input w-full"
                        maxLength={100}
                        placeholder="예: 서울, 강남구 (주소 검색 시 자동 입력)"
                        required
                    />
                </div>
                
                <input type="hidden" name="latitude" value={latitude} />
                <input type="hidden" name="longitude" value={longitude} />

                <div>
                    <label className="form-label" htmlFor="description">숙박 시설 설명</label>
                    <textarea 
                        name="description" 
                        id="description"
                        className="form-input w-full"
                        rows={4}
                        placeholder="숙소의 특징, 서비스, 유의사항 등을 자세히 설명해주세요."
                    />
                </div>

                <AmenitySelector 
                    selectedNames={selectedAmenityNames}
                    onChange={handleAmenityChange}
                />
                
                <input 
                    type="hidden" 
                    name="amenityNames" 
                    value={Array.from(selectedAmenityNames).join(',')} 
                />

                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="form-label" htmlFor="checkinTime">체크인 시간</label>
                        <input 
                            type="time" 
                            name="checkinTime" 
                            id="checkinTime" 
                            className="form-input w-full" 
                            required 
                            defaultValue="15:00"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="form-label" htmlFor="checkoutTime">체크아웃 시간</label>
                        <input 
                            type="time" 
                            name="checkoutTime" 
                            id="checkoutTime" 
                            className="form-input w-full" 
                            required 
                            defaultValue="11:00"
                        />
                    </div>
                </div>
                
                <input type="hidden" name="ratingAvg" defaultValue={5.0} />

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="submit" className="btn-primary">저장</button>
                    <button 
                        type="button" 
                        onClick={handleCancel} 
                        className="btn-secondary-outline" 
                    >
                        취소
                    </button>
                </div>
            </Form>
        </div>
    );
};

export default AccommodationCreatePage;