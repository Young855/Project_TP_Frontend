import React, { useState, useEffect } from 'react';

const SinglePolicyModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [form, setForm] = useState({
        price: '',
        stock: '',
        isActive: true
    });

    // 모달이 열리거나 데이터가 바뀔 때 폼 초기화
    useEffect(() => {
        if (isOpen && initialData) {
            setForm({
                price: initialData.price ?? '',
                stock: initialData.stock ?? '',
                isActive: initialData.isActive ?? true
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // 부모 컴포넌트에게 변경된 데이터 전달
        onSave({
            ...initialData, // roomId, targetDate 등 유지
            price: form.price,
            stock: form.stock,
            isActive: form.isActive
        });
    };

    if (!isOpen || !initialData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">
                    {initialData.targetDate} 설정
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">요금</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={form.price} 
                            onChange={e => setForm({...form, price: e.target.value})} 
                            placeholder="요금을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            value={form.stock} 
                            onChange={e => setForm({...form, stock: e.target.value})} 
                            placeholder="재고를 입력하세요"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="isActive"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={form.isActive} 
                            onChange={e => setForm({...form, isActive: e.target.checked})}
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">판매 활성화</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-black bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                            저장
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

export default SinglePolicyModal;