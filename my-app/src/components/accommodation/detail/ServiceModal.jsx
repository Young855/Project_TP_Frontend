import { FaQuestionCircle } from 'react-icons/fa'; // 기본 아이콘
// [중요] AmenitySelector에서 정의한 아이콘 리스트 import (경로는 실제 파일 구조에 맞게 수정)
import { ACCOMMODATION_AMENITIES, ROOM_AMENITIES } from '../../AmenitySelector';

export default function ServiceModal({ amenities, onClose }) {
    if (!amenities) return null;

    // 1. 숙소용과 객실용 리스트를 하나로 합쳐서 검색하기 쉽게 만듦
    // (이름이 중복될 경우 뒤에 있는 것이 덮어씌워지지만, 보통 아이콘이 비슷하므로 무관)
    const ALL_AMENITIES = [...ACCOMMODATION_AMENITIES, ...ROOM_AMENITIES];

    // 2. 아이콘 찾기 헬퍼 함수
    const getIconForAmenity = (name) => {
        const found = ALL_AMENITIES.find(item => item.name === name);
        return found ? found.icon : <FaQuestionCircle className="text-gray-300" />;
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">서비스 및 부대시설</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="p-6 overflow-y-auto">
                    {amenities.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            등록된 편의시설 정보가 없습니다.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {amenities.map((amenity, index) => {
                                // amenities가 객체 배열인지 문자열 배열인지에 따라 처리
                                const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl shrink-0">
                                            {getIconForAmenity(amenityName)}
                                        </div>
                                        <span className="text-gray-700 font-medium">
                                            {amenityName}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}