import React, { useState, useEffect } from 'react';

const SinglePolicyModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [form, setForm] = useState({
        price: '',
        stock: '', // Blocked Stock (차단할 개수)
        isActive: true
    });

    // 데이터 안전하게 가져오기
    const maxStock = initialData?.roomMaxStock || 0;
    const bkStock = initialData?.bkStock || 0;

    useEffect(() => {
        if (isOpen && initialData) {
            setForm({
                price: initialData.price ?? '',
                stock: initialData.stock ?? 0, // DB의 stock은 'blocked' 의미
                isActive: initialData.isActive ?? true
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const blockedInput = Number(form.stock || 0);
        const remaining = maxStock - bkStock - blockedInput;

        // [검증] 잔여 재고가 마이너스면 저장 불가
        if (remaining < 0) {
            alert(`예약된 객실(${bkStock}건)이 있어 최대 ${maxStock - bkStock}개까지만 차단할 수 있습니다.`);
            return;
        }

        onSave({
            ...initialData,
            price: form.price,
            stock: blockedInput,
            isActive: form.isActive
        });
    };

    if (!isOpen || !initialData) return null;

    // 실시간 계산
    const currentBlocked = Number(form.stock || 0);
    const remaining = maxStock - bkStock - currentBlocked;
    
    // 상태에 따른 색상 (마이너스면 빨강, 아니면 파랑/회색)
    const statusColor = remaining < 0 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : 'bg-blue-50 border-blue-100 text-blue-800';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-4 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold mb-3 border-b pb-2">
                    {initialData.targetDate} 설정
                </h3>
                
                {/* [추가] 실시간 재고 계산 패널 (BulkModal과 통일된 스타일) */}
                <div className={`mb-3 p-2.5 rounded-lg text-xs border ${statusColor}`}>
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-500">객실 총 개수:</span>
                        <span className="font-medium">{maxStock}</span>
                    </div>
                    {/* 예약 현황: 0건이라도 흐리게 표시하여 정보 제공 */}
                    <div className={`flex justify-between mb-1 ${bkStock > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        <span>현재 예약(bkStock):</span>
                        <span className="font-bold">-{bkStock}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>차단할 객실(Blocked):</span>
                        <span>-{currentBlocked}</span>
                    </div>
                    <div className="border-t border-black/10 mt-1 pt-1 flex justify-between font-bold text-sm">
                        <span>최종 잔여 재고:</span>
                        <span>{remaining}개</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">1박 요금</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm" 
                            value={form.price} 
                            onChange={e => setForm({...form, price: e.target.value})}
                            placeholder="요금 입력"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            판매 막기 (Blocked)
                        </label>
                        <input 
                            type="number" 
                            className={`w-full px-3 py-1.5 border rounded text-sm ${remaining < 0 ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-300'}`}
                            value={form.stock} 
                            onChange={e => setForm({...form, stock: e.target.value})}
                            min="0"
                            placeholder="0"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                        <input 
                            type="checkbox" 
                            id="singleIsActive"
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                            checked={form.isActive} 
                            onChange={e => setForm({...form, isActive: e.target.checked})}
                        />
                        <label htmlFor="singleIsActive" className="text-xs text-gray-700 cursor-pointer select-none">판매 활성화</label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                        <button 
                            type="submit" 
                            className="px-3 py-1.5 text-xs text-black bg-blue-600 rounded hover:bg-blue-700 transition"
                        >
                            저장
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition"
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