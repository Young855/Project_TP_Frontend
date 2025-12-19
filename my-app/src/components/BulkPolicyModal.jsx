import React, { useState, useEffect, useMemo } from 'react';

// 날짜 포맷 유틸
const formatDate = (date) => date.toISOString().split('T')[0];

const BulkPolicyModal = ({ isOpen, onClose, onSave, rooms }) => {
    // 요일 옵션 (월=1 ~ 일=0 or 7)
    const dayOptions = [
        { id: 1, name: '월' }, { id: 2, name: '화' }, { id: 3, name: '수' }, 
        { id: 4, name: '목' }, { id: 5, name: '금' }, { id: 6, name: '토' }, { id: 0, name: '일' }
    ];

    // [추가] 오늘로부터 6개월 뒤 날짜 계산 (최대 선택 가능 날짜)
    const getMaxDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 6);
        return formatDate(date);
    };

    const [form, setForm] = useState({
        roomId: '',
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        price: 10000, // [수정] 기본 요금 10,000원
        stock: 0,     // [수정] 기본 재고 0
        isActive: true,
        days: [], 
    });

    // 1. 선택된 객실 정보 찾기
    const selectedRoom = useMemo(() => 
        rooms.find(r => String(r.roomId) === String(form.roomId)), 
        [rooms, form.roomId]
    );
    
    // 객실 총 개수
    const roomMaxStock = selectedRoom?.totalStock || 0;

    // 2. [핵심 로직] 선택 기간 내 "최대 예약 수" 계산
    const periodStats = useMemo(() => {
        if (!selectedRoom || !form.startDate || !form.endDate) return null;

        let maxBkStockInRange = 0; // 기간 중 가장 많은 예약 수
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        
        // 날짜 루프
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            const jsDay = d.getDay(); // 0(일) ~ 6(토)
            
            // 요일 필터링 (선택된 요일만 체크)
            if (form.days.length > 0 && !form.days.includes(jsDay)) continue;

            // 해당 날짜의 예약 정보(bkStock) 확인
            const policy = selectedRoom.dailyPolicies?.find(p => p.targetDate === dateStr);
            const currentBkStock = policy ? (policy.bkStock || 0) : 0;

            if (currentBkStock > maxBkStockInRange) {
                maxBkStockInRange = currentBkStock;
            }
        }

        return {
            maxBkStock: maxBkStockInRange,
            // 안전하게 막을 수 있는 최대 개수 = 전체 - 최대예약
            safeBlockLimit: roomMaxStock - maxBkStockInRange 
        };
    }, [selectedRoom, form.startDate, form.endDate, form.days, roomMaxStock]);


    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen && rooms.length > 0) {
            setForm(prev => ({
                ...prev,
                roomId: prev.roomId || rooms[0].roomId,
                startDate: formatDate(new Date()), // 열릴 때 오늘 날짜로 리셋
                endDate: formatDate(new Date()),
                price: 10000, // [수정] 열릴 때마다 10,000원으로 초기화
                stock: 0      // [수정] 열릴 때마다 0으로 초기화
            }));
        }
    }, [isOpen, rooms]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        // [추가] 요금(price)이 음수면 입력 차단
        if (name === 'price' && newValue !== '' && Number(newValue) < 0) {
            return;
        }

        setForm(prev => {
            const updated = { ...prev, [name]: newValue };
            // 날짜 자동 보정
            if (name === 'startDate' && updated.endDate < newValue) updated.endDate = newValue;
            if (name === 'endDate' && newValue < updated.startDate) updated.endDate = updated.startDate;
            return updated;
        });
    };

    const handleDaySelect = (dayId) => {
        setForm(prev => ({
            ...prev,
            days: prev.days.includes(dayId) 
                ? prev.days.filter(id => id !== dayId) 
                : [...prev.days, dayId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // [수정] 값이 비어있으면('') 0으로 처리
        const blockedInput = form.stock === '' ? 0 : Number(form.stock);
        const priceInput = form.price === '' ? 0 : Number(form.price);

        // [안전장치] 기간 내 최대 예약수 때문에 설정 불가한 경우 차단
        if (periodStats && blockedInput > periodStats.safeBlockLimit) {
            alert(`선택 기간 중 예약이 가장 많은 날(${periodStats.maxBkStock}건)이 있어,\n최대 ${periodStats.safeBlockLimit}개까지만 차단 가능합니다.`);
            return;
        }

        // [수정] 전송 데이터 구성
        onSave({ 
            ...form, 
            stock: blockedInput,
            price: priceInput
        }); 
    };

    if (!isOpen) return null;

    // 현재 입력값에 따른 계산
    const currentBlocked = Number(form.stock || 0);
    const minRemaining = periodStats 
        ? (roomMaxStock - currentBlocked - periodStats.maxBkStock) 
        : 0;
    
    // 상태 컬러 (잔여가 마이너스면 빨간색)
    const statusColor = minRemaining < 0 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : 'bg-blue-50 border-blue-100 text-blue-800';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            {/* 컴팩트 사이즈: p-4, max-w-sm */}
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold mb-3 border-b pb-2">일괄 설정</h3>
                
                {/* [정보 패널] 예약 데이터가 있을 때만 상세하게 보여줌 */}
                {periodStats && (
                    <div className={`mb-3 p-2.5 rounded-lg text-xs border ${statusColor}`}>
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-500">객실 총 개수:</span>
                            <span className="font-medium">{roomMaxStock}</span>
                        </div>
                        {periodStats.maxBkStock > 0 && (
                            <div className="flex justify-between mb-1 text-red-600">
                                <span>예약된 제고:</span>
                                <span className="font-bold">-{periodStats.maxBkStock}</span>
                            </div>
                        )}
                        <div className="flex justify-between mb-1">
                            <span>차단할 객실:</span>
                            <span>-{currentBlocked}</span>
                        </div>
                        <div className="border-t border-black/10 mt-1 pt-1 flex justify-between font-bold text-sm">
                            <span>최소 잔여 재고:</span>
                            <span>{minRemaining}개</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* 객실 선택 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">대상 객실</label>
                        <select 
                            name="roomId" 
                            value={form.roomId} 
                            onChange={handleChange} 
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                            {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.name}</option>)}
                        </select>
                    </div>
                    
                    {/* 날짜 선택 */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">시작일</label>
                            <input 
                                type="date" 
                                name="startDate" 
                                value={form.startDate} 
                                onChange={handleChange} 
                                min={formatDate(new Date())} // [추가] 오늘 이전 선택 불가
                                max={getMaxDate()}           // [추가] 6개월 제한
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">종료일</label>
                            <input 
                                type="date" 
                                name="endDate" 
                                value={form.endDate} 
                                onChange={handleChange} 
                                min={form.startDate} 
                                max={getMaxDate()}           // [추가] 6개월 제한
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                    </div>

                    {/* 요일 선택 */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">적용 요일 
                            <span className="ml-2 text-[13px] font-normal text-gray-500">
                                * 미선택 시 전체 요일 적용
                            </span>
                        </label>
                        <div className="flex gap-1 flex-wrap">
                            {dayOptions.map(d => (
                                <button 
                                    type="button" 
                                    key={d.id} 
                                    onClick={() => handleDaySelect(d.id)} 
                                    className={`px-2 py-1 rounded text-xs transition-colors ${
                                        form.days.includes(d.id) 
                                        ? 'bg-blue-600 text-red' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {d.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 요금 및 차단 설정 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">요금</label>
                            <input 
                                type="number" name="price" placeholder="변경 안함" 
                                value={form.price} onChange={handleChange} min="0" // [추가] 음수 입력 방지
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">판매 막기</label>
                            <input 
                                type="number" name="stock" placeholder="0" 
                                value={form.stock} onChange={handleChange} min="0"
                                className={`w-full px-2 py-1.5 border rounded text-sm ${minRemaining < 0 ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300'}`}
                            />
                        </div>
                    </div>

                    {/* 하단 버튼부 */}
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <div className="flex items-center gap-1.5">
                            <input 
                                type="checkbox" id="bulkIsActive" name="isActive" 
                                className="w-3.5 h-3.5" 
                                checked={form.isActive} onChange={handleChange}
                            />
                            <label htmlFor="bulkIsActive" className="text-xs text-gray-700 cursor-pointer">판매 활성화</label>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                type="submit" 
                                className="px-3 py-1.5 text-xs text-black bg-blue-600 rounded hover:bg-blue-700"
                            >
                                적용
                            </button>
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                취소
                            </button>
                           
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkPolicyModal;