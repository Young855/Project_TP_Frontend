import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { getRoomsByProperty, deleteRoom } from '../../api/roomAPI'; // [수정] 올바른 API 함수 import
import { usePartner } from '../../context/PartnerContext'; // [중요] 현재 선택된 숙소 정보 가져오기

const RoomList = () => {
    const navigate = useNavigate();
    const { currentProperty } = usePartner(); // 전역 상태에서 현재 숙소 가져오기

    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 객실 목록 불러오기
    const fetchRooms = async () => {
        // 선택된 숙소가 없으면 로딩하지 않음
        if (!currentProperty) return;

        try {
            setIsLoading(true);
            // [수정] API 호출 시 propertyId 전달
            const data = await getRoomsByProperty(currentProperty.propertyId);
            setRooms(data);
        } catch (error) {
            console.error("객실 목록 로딩 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 숙소가 변경될 때마다 목록 새로고침
    useEffect(() => {
        fetchRooms();
    }, [currentProperty]);

    // 객실 삭제 핸들러
    const handleDelete = async (roomId) => {
        if (window.confirm("정말 이 객실을 삭제하시겠습니까? 관련된 예약 및 요금 데이터가 모두 삭제됩니다.")) {
            try {
                await deleteRoom(roomId);
                alert("객실이 삭제되었습니다.");
                fetchRooms(); // 목록 갱신
            } catch (error) {
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    // 1. 숙소가 선택되지 않았을 때 안내 화면
    if (!currentProperty) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                <h2 className="text-xl font-bold mb-2">숙소가 선택되지 않았습니다.</h2>
                <p>상단 헤더에서 관리할 숙소를 먼저 선택해주세요.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">객실 목록</h1>
                    <p className="text-sm text-gray-500 mt-1">{currentProperty.name}의 객실을 관리합니다.</p>
                </div>
                <Link 
                    to={`/partner/rooms/new?propertyId=${currentProperty.propertyId}`}
                    className="btn-primary flex items-center gap-2"
                >
                    <PlusCircle size={18} />
                    객실 추가
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">로딩 중...</div>
            ) : rooms.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-10 text-center border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">등록된 객실이 없습니다.</p>
                    <Link 
                        to={`/partner/rooms/new?propertyId=${currentProperty.propertyId}`}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        + 첫 번째 객실 등록하기
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {rooms.map((room) => (
                        <div key={room.roomId} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                                    {!room.refundable && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">환불 불가</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-600 space-x-4">
                                    <span>기본 인원: {room.capacity}명</span>
                                    <span>기본 재고: {room.stock}개</span>
                                    <span className="font-medium text-blue-600">₩ {room.pricePerNight.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                {/* 수정 버튼 */}
                                <Link 
                                    to={`/partner/rooms/${room.roomId}/edit`}
                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                                    title="수정"
                                >
                                    <Edit size={18} />
                                </Link>
                                
                                {/* 삭제 버튼 */}
                                <button 
                                    onClick={() => handleDelete(room.roomId)}
                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                    title="삭제"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomList;