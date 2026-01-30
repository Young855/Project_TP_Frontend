export default function SellerInfoModal({ isOpen, onClose, partner }) {
    if (!isOpen || !partner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                {/* 닫기 버튼 */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-6 text-gray-800">판매자 정보</h2>

                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">상호명</span>
                        <span className="text-gray-900 font-bold">{partner.bizName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">대표자명</span>
                        <span className="text-gray-900">{partner.ceoName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">사업자등록번호</span>
                        <span className="text-gray-900">{partner.bizRegNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">연락처</span>
                        <span className="text-gray-900">{partner.contactPhone}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-500 font-medium">이메일</span>
                        <span className="text-gray-900">{partner.contactEmail}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                         <span className="text-gray-500 font-medium">사업장 주소</span>
                         <span className="text-gray-900 text-sm">{partner.businessAddress}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button 
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}