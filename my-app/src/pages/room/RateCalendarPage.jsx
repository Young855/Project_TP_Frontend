import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, CalendarRange, Edit, Loader2, BedDouble } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getFullCalendarData, updateDailyPolicy, updateBulkPolicy } from '../../api/roomAPI';
import { usePartner } from '../../context/PartnerContext';

import SinglePolicyModal from '../../components/SinglePolicyModal';
import BulkPolicyModal from '../../components/BulkPolicyModal';

const formatDate = (date) => date.toISOString().split('T')[0];

const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
};

const RateCalendarPage = () => {
    const { currentAccommodation } = usePartner();
    const navigate = useNavigate();

    // --- State ---
    const [startDate, setStartDate] = useState(new Date());
    const [roomData, setRoomData] = useState([]);
    const [page, setPage] = useState(0);        
    const [totalPages, setTotalPages] = useState(0); 
    const pageSize = 5; 
    
    // 로딩 및 처리 상태
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 모달 제어 State
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const dates = Array.from({ length: 14 }).map((_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return formatDate(date);
    });

    // --- Data Loading ---
    const loadData = async (pageNumber = 0) => {
        if (!currentAccommodation) return;
        setLoading(true);
        try {
            const startStr = dates[0];
            const endStr = dates[dates.length - 1];
            
            const response = await getFullCalendarData(
                currentAccommodation.accommodationId, 
                startStr, endStr, pageNumber, pageSize
            );
            
            if (response.content) {
                setRoomData(response.content);
                setTotalPages(response.totalPages);
                setPage(response.number); 
            } else {
                setRoomData(response);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("API 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        loadData(0); 
    }, [startDate, currentAccommodation]);

    const handlePageChange = (newPage) => {
        if (isProcessing || loading) return; 
        loadData(newPage);
    };

    const moveDate = (days) => {
        if (isProcessing || loading) return; 
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + days);
        setStartDate(newDate);
    };

    // --- Handlers ---
    const handleCellClick = (roomId, policy, dateStr) => {
        if (loading || isProcessing) return;

        if (policy) {
            setEditingPolicy({ ...policy, roomId, targetDate: policy.targetDate ?? dateStr }); 
        } else {
            setEditingPolicy({ roomId, targetDate: dateStr, price: null, stock: null, isActive: true }); 
        }
    };

    const handleSaveSinglePolicy = async (updatedPolicy) => {
        if (!updatedPolicy.price || updatedPolicy.stock === null || updatedPolicy.stock === '') {
            alert("요금입력은  필수입니다."); return;
        }
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            await updateDailyPolicy({
                roomId: updatedPolicy.roomId,
                targetDate: updatedPolicy.targetDate,
                price: Number(updatedPolicy.price),
                stock: Number(updatedPolicy.stock), 
                isActive: updatedPolicy.isActive,
            });
            setEditingPolicy(null);
            await loadData(page); 
        } catch (error) {
            alert("저장 실패");
        } finally {
            setIsProcessing(false); 
        }
    };

    const handleSaveBulkPolicy = async (bulkData) => {
        if (
            !bulkData.roomId || 
            !bulkData.startDate || 
            !bulkData.endDate || 
            !bulkData.price || 
            bulkData.stock === null || bulkData.stock === '' // 0은 허용, null/빈값만 차단
        ) {
            alert("필수 항목을 입력해주세요."); return;
        }
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            await updateBulkPolicy({
                roomId: Number(bulkData.roomId),
                startDate: bulkData.startDate,
                endDate: bulkData.endDate,
                price: Number(bulkData.price),
                stock: Number(bulkData.stock),
                isActive: bulkData.isActive,
                days: bulkData.days.length > 0 ? bulkData.days : null, 
            });
            setIsBulkModalOpen(false);
            await loadData(page); 
            alert("일괄 설정 완료");
        } catch (error) {
            alert("일괄 수정 실패");
        } finally {
            setIsProcessing(false); 
        }
    };

    const handleImageManage = (target) => {
        if (isProcessing) return;
        const targetId = target.roomId;
        if (target.photos && target.photos.length > 0) {
            navigate(`/partner/rooms/photos/${targetId}`);
        } else {
            navigate(`/partner/rooms/photos/${targetId}/new`);
        }
    };
    
    const isBusy = loading || isProcessing; 

    if (!currentAccommodation) return <div className="p-8 text-center text-gray-500">상단에서 숙소를 먼저 선택해주세요.</div>;

    return (
        <div className="p-4 md:p-8 flex flex-col min-h-screen relative z-0">
            
            {/* Header Toolbar: z-index를 50 -> 10으로 낮춤 (Layout Header가 보통 20~30임) */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">객실 요금 캘린더</h2>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button 
                            onClick={() => moveDate(-7)} 
                            disabled={isBusy}
                            className={`p-1 hover:bg-white rounded shadow-sm ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronLeft size={20}/>
                        </button>
                        <span className="px-4 font-medium text-sm">{dates[0]} ~ {dates[dates.length-1]}</span>
                        <button 
                            onClick={() => moveDate(7)} 
                            disabled={isBusy}
                            className={`p-1 hover:bg-white rounded shadow-sm ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => !isBusy && setIsBulkModalOpen(true)} 
                        disabled={isBusy}
                        className={`flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium text-sm ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <CalendarRange size={18}/> {isProcessing ? "처리 중..." : "일괄 설정"}
                    </button>
                    <Link 
                        to={`/partner/rooms/new?accommodationId=${currentAccommodation.accommodationId}`} 
                        onClick={(e) => isBusy && e.preventDefault()} 
                        className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <PlusCircle size={18}/> 객실 추가
                    </Link>
                </div>
            </div>

            {/* Table Area */}
            <div className={`overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}>
                
                {/* 1. 로딩 중일 때 */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                        <Loader2 className="animate-spin mb-3 text-blue-500" size={40} />
                        <span className="text-lg font-medium">객실 정보를 불러오는 중입니다...</span>
                    </div>
                ) : roomData.length === 0 ? (
                    
                    /* 2. 로딩 끝났는데 데이터가 없을 때 (추가된 부분) */
                    <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                        <div className="text-5xl mb-4">
                            <BedDouble size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">등록된 객실이 없습니다.</h3>
                        <p className="mt-2 text-sm text-gray-400">
                            우측 상단의 <span className="text-blue-600 font-bold">'객실 추가'</span> 버튼을 눌러 첫 객실을 등록해보세요!
                        </p>
                    </div>

                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-[0px] z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64 border-r border-gray-200 bg-gray-50 sticky left-0 z-20">객실 정보</th>
                                {dates.map((dateStr) => (
                                    <th key={dateStr} className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider w-24 border-r last:border-r-0 ${getDayName(dateStr) === '토' ? 'text-blue-600' : getDayName(dateStr) === '일' ? 'text-red-600' : 'text-gray-500'}`}>
                                        <div>{dateStr.substring(5)}</div>
                                        <div className="font-bold text-sm mt-1">{getDayName(dateStr)}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {roomData.map((room) => (
                                <tr key={room.roomId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-white sticky left-0 z-10">
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer border hover:border-blue-500 transition-colors"
                                                onClick={() => handleImageManage(room)}
                                            >
                                                {room.photos?.[0]?.imageData ? (
                                                    <img src={`data:image/jpeg;base64,${room.photos[0].imageData}`} alt="Room" className="w-full h-full object-cover"/>
                                                ) : (
                                                    <div className="text-gray-500 flex flex-col items-center text-sm font-medium"><span className="text-2xl mb-1">➕</span><span>사진</span></div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    <span className="text-base">{room.name}</span>
                                                    <Link to={`/partner/rooms/${room.roomId}/edit`} className="ml-2 text-blue-500 hover:text-blue-700"><Edit size={16} className="inline"/></Link>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    {dates.map((dateStr) => {
                                        const policy = room.dailyPolicies?.find(p => p.targetDate === dateStr);
                                        const max = policy?.roomMaxStock ?? room.totalStock ?? 0;
                                        const blocked = policy?.stock ?? 0;
                                        const booked = policy?.bkStock ?? 0;
                                        const dMax = max - blocked;
                                        const dRemaining = dMax - booked; 
                                        const isRegistered = policy && policy.price !== null;
                                        const isSoldOut = isRegistered && dRemaining <= 0;
                                        const cellColorClass = !isRegistered 
                                            ? 'bg-gray-50 hover:bg-blue-100' 
                                            : (!policy.isActive || isSoldOut 
                                                ? 'bg-red-100 hover:bg-red-200'  
                                                : 'bg-green-50/50 hover:bg-green-100');

                                        return (
                                            <td 
                                                key={dateStr} 
                                                className={`px-2 py-2 text-center text-sm border-r last:border-r-0 cursor-pointer transition duration-150 ${cellColorClass}`}
                                                onClick={() => handleCellClick(room.roomId, {
                                                    ...policy, 
                                                    roomMaxStock: max,
                                                    bkStock: booked,
                                                    stock: blocked
                                                }, dateStr)}
                                            >
                                                {isRegistered ? (
                                                    <>
                                                        {/* 가격 표시 */}
                                                        <div className={(!policy.isActive || isSoldOut) ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}>
                                                            {!policy.isActive ? '판매중지' : (isSoldOut ? '매진' : policy.price?.toLocaleString())}
                                                        </div>
                                                        
                                                        {/* 재고 표시 */}
                                                        <div className={`text-xs mt-1 ${isSoldOut ? 'text-red-700 font-extrabold' : 'text-gray-500'}`}>
                                                            {dRemaining} / {dMax}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="h-10 flex items-center justify-center">
                                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow hover:bg-blue-600">등록</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t bg-gray-50 flex justify-center items-center gap-4 mt-auto">
                <button 
                    disabled={page === 0 || isBusy} 
                    onClick={() => handlePageChange(page - 1)} 
                    className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    이전
                </button>
                <span className="text-sm font-medium">{page + 1} / {totalPages || 1}</span>
                <button 
                    disabled={page >= totalPages - 1 || isBusy} 
                    onClick={() => handlePageChange(page + 1)} 
                    className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    다음
                </button>
            </div>

            {/* --- Modals --- */}
            {/* 모달은 z-index 수정 안함 (기본적으로 높게 설정되어 있음) */}
            <SinglePolicyModal 
                isOpen={!!editingPolicy}
                initialData={editingPolicy}
                onClose={() => !isProcessing && setEditingPolicy(null)} 
                onSave={handleSaveSinglePolicy}
                isProcessing={isProcessing} 
            />

            <BulkPolicyModal
                isOpen={isBulkModalOpen}
                rooms={roomData}
                onClose={() => !isProcessing && setIsBulkModalOpen(false)} 
                onSave={handleSaveBulkPolicy}
                isProcessing={isProcessing} 
            />
        </div>
    );
};

export default RateCalendarPage;