import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createRoom } from '../../api/roomAPI';

const RoomCreate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // URL 쿼리스트링에서 propertyId 가져오기 (예: /partner/rooms/new?propertyId=1)
    const propertyId = searchParams.get('propertyId');

    const [formData, setFormData] = useState({
        name: '',
        capacity: 2,
        stock: 10,       // 1년치 데이터 생성 기준값
        pricePerNight: 100000, // 1년치 데이터 생성 기준값
        refundable: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!propertyId) {
            alert("숙소 정보가 없습니다.");
            return;
        }

        try {
            // API 호출 (백엔드에서 1년치 DailyRoomPolicy 자동 생성 로직 수행)
            await createRoom({ ...formData, propertyId: Number(propertyId) });
            
            alert("객실이 성공적으로 생성되었습니다.");
            // 생성 후 요금 관리 캘린더로 이동
            navigate('/partner/rates');
        } catch (error) {
            console.error(error);
            alert("객실 생성에 실패했습니다.");
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">새 객실 타입 추가</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-5">
                
                <div>
                    <label className="form-label">객실 이름 (Type)</label>
                    <input 
                        type="text" name="name" 
                        className="form-input w-full" 
                        placeholder="예: 스탠다드 더블, 디럭스 오션뷰" 
                        required
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">기본 수용 인원</label>
                        <input 
                            type="number" name="capacity" 
                            className="form-input w-full" 
                            required min={1}
                            value={formData.capacity} onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="form-label">기본 재고 (개)</label>
                        <input 
                            type="number" name="stock" 
                            className="form-input w-full" 
                            required min={1}
                            value={formData.stock} onChange={handleChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">설정된 재고로 향후 1년치 데이터가 생성됩니다.</p>
                    </div>
                </div>

                <div>
                    <label className="form-label">기본 1박 요금 (원)</label>
                    <input 
                        type="number" name="pricePerNight" 
                        className="form-input w-full" 
                        required step={1000}
                        value={formData.pricePerNight} onChange={handleChange}
                    />
                </div>

                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border">
                    <input 
                        type="checkbox" name="refundable" id="refundable"
                        className="w-5 h-5 text-blue-600 rounded"
                        checked={formData.refundable} onChange={handleChange}
                    />
                    <label htmlFor="refundable" className="text-gray-700 font-medium cursor-pointer">환불 가능 여부</label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <button type="submit" className="btn-primary">
                        객실 생성하기
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="btn-secondary-outline"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomCreate;