import React, { useState, useEffect } from 'react';

// 날짜 포맷 유틸
const formatDate = (date) => date.toISOString().split('T')[0];

const BulkPolicyModal = ({ isOpen, onClose, onSave, rooms }) => {
    const dayOptions = [
        { id: 1, name: '월' }, { id: 2, name: '화' }, { id: 3, name: '수' }, 
        { id: 4, name: '목' }, { id: 5, name: '금' }, { id: 6, name: '토' }, { id: 7, name: '일' }
    ];

    const [form, setForm] = useState({
        roomId: '',
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        price: '',
        stock: '',
        isActive: true,
        days: [],
    });

    useEffect(() => {
        if (isOpen && rooms.length > 0) {
            setForm(prev => ({
                ...prev,
                roomId: prev.roomId || rooms[0].roomId 
            }));
        }
    }, [isOpen, rooms]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setForm(prev => {
            const updated = { ...prev, [name]: newValue };

            // [추가된 로직 1] 시작일이 변경될 때: 종료일이 시작일보다 이전이 되면, 종료일을 시작일로 자동 보정
            if (name === 'startDate') {
                if (updated.endDate < newValue) {
                    updated.endDate = newValue;
                }
            }
            
            // [추가된 로직 2] 종료일이 변경될 때: 시작일보다 이전 날짜 입력을 시도하면 시작일로 강제 보정 (입력 방지)
            if (name === 'endDate') {
                if (newValue < updated.startDate) {
                    updated.endDate = updated.startDate;
                }
            }

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
        
        // [안전장치] 제출 전 한 번 더 검사
        if (form.startDate > form.endDate) {
            alert("종료일은 시작일보다 빠를 수 없습니다.");
            return;
        }

        onSave(form); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">일괄 설정</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">대상 객실</label>
                        <select 
                            name="roomId" 
                            value={form.roomId} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {rooms.map(r => (
                                <option key={r.roomId} value={r.roomId}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                            <input 
                                type="date" 
                                name="startDate" 
                                value={form.startDate} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                            <input 
                                type="date" 
                                name="endDate" 
                                value={form.endDate} 
                                onChange={handleChange}
                                // [추가된 속성] 종료일 선택 시 시작일 이전은 선택 불가능하게 설정
                                min={form.startDate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">적용 요일 (선택 안 함 = 매일)</label>
                        <div className="flex gap-2 flex-wrap">
                            {dayOptions.map(d => (
                                <button 
                                    type="button" 
                                    key={d.id} 
                                    onClick={() => handleDaySelect(d.id)} 
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                        form.days.includes(d.id) 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {d.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">요금</label>
                            <input type="number" name="price" placeholder="요금" value={form.price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
                            <input type="number" name="stock" placeholder="재고" value={form.stock} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                    </div>

                    {/* 판매 활성화 체크박스 */}
                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="bulkIsActive"
                            name="isActive"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={form.isActive} 
                            onChange={handleChange}
                        />
                        <label htmlFor="bulkIsActive" className="text-sm text-gray-700 cursor-pointer select-none">판매 활성화</label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-black bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            적용하기
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkPolicyModal;