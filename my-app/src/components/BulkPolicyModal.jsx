import React, { useState, useEffect, useMemo } from 'react';
// 1. [추가] 로딩 아이콘 임포트
import { Loader2 } from 'lucide-react';

// 날짜 포맷 유틸
const formatDate = (date) => date.toISOString().split('T')[0];

const BulkPolicyModal = ({ isOpen, onClose, onSave, rooms }) => {
    // 2. [추가] 저장 중 상태 관리
    const [isSaving, setIsSaving] = useState(false);

    // 요일 옵션 (월=1 ~ 일=0 or 7)
    const dayOptions = [
        { id: 1, name: '월' }, { id: 2, name: '화' }, { id: 3, name: '수' }, 
        { id: 4, name: '목' }, { id: 5, name: '금' }, { id: 6, name: '토' }, { id: 0, name: '일' }
    ];

    // 오늘로부터 6개월 뒤 날짜 계산 (최대 선택 가능 날짜)
    const getMaxDate = () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 6);
        return formatDate(date);
    };

    const [form, setForm] = useState({
        roomId: '',
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        price: 10000, 
        stock: 0,    
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

        let maxBkStockInRange = 0; 
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            const jsDay = d.getDay(); 
            
            if (form.days.length > 0 && !form.days.includes(jsDay)) continue;

            const policy = selectedRoom.dailyPolicies?.find(p => p.targetDate === dateStr);
            const currentBkStock = policy ? (policy.bkStock || 0) : 0;

            if (currentBkStock > maxBkStockInRange) {
                maxBkStockInRange = currentBkStock;
            }
        }

        return {
            maxBkStock: maxBkStockInRange,
            safeBlockLimit: roomMaxStock - maxBkStockInRange 
        };
    }, [selectedRoom, form.startDate, form.endDate, form.days, roomMaxStock]);


    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen && rooms.length > 0) {
            setForm(prev => ({
                ...prev,
                roomId: prev.roomId || rooms[0].roomId,
                startDate: formatDate(new Date()),
                endDate: formatDate(new Date()),
                price: 10000,
                stock: 0 
            }));
            setIsSaving(false); // [추가] 모달 열릴 때 로딩 상태 초기화
        }
    }, [isOpen, rooms]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        if (name === 'price' && newValue !== '' && Number(newValue) < 0) {
            return;
        }

        setForm(prev => {
            const updated = { ...prev, [name]: newValue };
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

    // 3. [수정] async/await 적용 및 로딩 상태 제어
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 로딩 중이면 중복 제출 방지
        if (isSaving) return;

        const blockedInput = form.stock === '' ? 0 : Number(form.stock);
        const priceInput = form.price === '' ? 0 : Number(form.price);

        if (periodStats && blockedInput > periodStats.safeBlockLimit) {
            alert(`선택 기간 중 예약이 가장 많은 날(${periodStats.maxBkStock}건)이 있어,\n최대 ${periodStats.safeBlockLimit}개까지만 차단 가능합니다.`);
            return;
        }

        try {
            setIsSaving(true); // 로딩 시작
            
            // onSave가 Promise를 반환해야 await가 정상 작동합니다.
            await onSave({ 
                ...form, 
                stock: blockedInput,
                price: priceInput
            });
            
            // 성공 시 보통 모달이 닫히므로 setIsSaving(false)는 생략 가능하나,
            // 에러 상황을 대비해 finally에 넣거나 여기서 처리
        } catch (error) {
            console.error("저장 실패", error);
            setIsSaving(false); // 실패 시 로딩 해제
        }
    };

    if (!isOpen) return null;

    const currentBlocked = Number(form.stock || 0);
    const minRemaining = periodStats 
        ? (roomMaxStock - currentBlocked - periodStats.maxBkStock) 
        : 0;
    
    const statusColor = minRemaining < 0 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : 'bg-blue-50 border-blue-100 text-blue-800';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold mb-3 border-b pb-2">일괄 설정</h3>
                
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
                    {/* ... (객실 선택, 날짜 선택, 요일 선택 등 기존 폼 내용 동일) ... */}
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
                    
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">시작일</label>
                            <input 
                                type="date" 
                                name="startDate" 
                                value={form.startDate} 
                                onChange={handleChange} 
                                min={formatDate(new Date())}
                                max={getMaxDate()}
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
                                max={getMaxDate()}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            />
                        </div>
                    </div>

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
                                        ? 'bg-blue-600 text-white'  // [수정] text-red는 이상해서 white로 변경
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {d.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">요금</label>
                            <input 
                                type="number" name="price" placeholder="변경 안함" 
                                value={form.price} onChange={handleChange} min="0"
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

                    {/* 4. [수정] 하단 버튼부: 로딩 스피너 적용 */}
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
                                disabled={isSaving} // 로딩 중 비활성화
                                className={`px-3 py-1.5 text-xs text-black bg-blue-600 rounded flex items-center gap-2 ${
                                    isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                                }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={12} />
                                        <span>처리 중...</span>
                                    </>
                                ) : (
                                    "적용"
                                )}
                            </button>
                            <button 
                                type="button" 
                                onClick={onClose} 
                                disabled={isSaving} // 로딩 중 취소 방지 (선택 사항)
                                className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
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