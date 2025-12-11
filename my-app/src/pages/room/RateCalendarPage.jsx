import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, CalendarRange, Edit } from 'lucide-react';
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
    const [loading, setLoading] = useState(false);

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

    const handlePageChange = (newPage) => loadData(newPage);

    const moveDate = (days) => {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + days);
        setStartDate(newDate);
    };

    // --- Handlers ---
    const handleCellClick = (roomId, policy, dateStr) => {
        if (policy) {
            setEditingPolicy({ ...policy, roomId, targetDate: policy.targetDate ?? dateStr }); 
        } else {
            setEditingPolicy({ roomId, targetDate: dateStr, price: null, stock: null, isActive: true }); 
        }
    };

    const handleSaveSinglePolicy = async (updatedPolicy) => {
        if (!updatedPolicy.price || !updatedPolicy.stock) {
            alert("요금과 재고는 필수입니다."); return;
        }
        try {
            await updateDailyPolicy({
                roomId: updatedPolicy.roomId,
                targetDate: updatedPolicy.targetDate,
                price: Number(updatedPolicy.price),
                stock: Number(updatedPolicy.stock), 
                isActive: updatedPolicy.isActive,
            });
            setEditingPolicy(null);
            loadData(page);
        } catch (error) {
            alert("저장 실패");
        }
    };

    const handleSaveBulkPolicy = async (bulkData) => {
        if (!bulkData.roomId || !bulkData.startDate || !bulkData.endDate || !bulkData.price || !bulkData.stock) {
            alert("필수 항목을 입력해주세요."); return;
        }
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
            loadData(page);
            alert("일괄 설정 완료");
        } catch (error) {
            alert("일괄 수정 실패");
        }
    };

    const handleImageManage = (target) => {
        const targetId = target.roomId;
        if (target.photos && target.photos.length > 0) {
            navigate(`/partner/rooms/photos/${targetId}`);
        } else {
            navigate(`/partner/rooms/photos/${targetId}/new`);
        }
    };

    if (!currentAccommodation) return <div className="p-8 text-center text-gray-500">상단에서 숙소를 먼저 선택해주세요.</div>;

    return (
        // [변경 1] h-full 제거, min-h-screen 추가 (컨텐츠가 길어지면 브라우저 스크롤 발생)
        <div className="p-4 md:p-8 flex flex-col min-h-screen">
            
            {/* Header */}
            {/* 상단 헤더는 최상단에 고정 (top-0) */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">객실 요금 캘린더</h2>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button onClick={() => moveDate(-7)} className="p-1 hover:bg-white rounded shadow-sm"><ChevronLeft size={20}/></button>
                        <span className="px-4 font-medium text-sm">{dates[0]} ~ {dates[dates.length-1]}</span>
                        <button onClick={() => moveDate(7)} className="p-1 hover:bg-white rounded shadow-sm"><ChevronRight size={20}/></button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium text-sm">
                        <CalendarRange size={18}/> 일괄 설정
                    </button>
                    <Link to={`/partner/rooms/new?accommodationId=${currentAccommodation.accommodationId}`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                        <PlusCircle size={18}/> 객실 추가
                    </Link>
                </div>
            </div>

            {/* Table Area */}
            {/* [변경 2] flex-grow, overflow-auto 제거 -> overflow-x-auto만 유지 (세로는 페이지 스크롤 사용) */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                {loading ? (
                    <div className="text-center py-20">데이터를 불러오는 중입니다...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-[0px] z-40 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64 border-r border-gray-200 bg-gray-50 sticky left-0 z-40">객실 정보</th>
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
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-white sticky left-0 z-30">
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
                                        const isEmpty = !policy || (policy.price === null || policy.stock === null);
                                        return (
                                            <td 
                                                key={dateStr} 
                                                className={`px-2 py-2 text-center text-sm border-r last:border-r-0 cursor-pointer transition duration-150 ${isEmpty ? 'bg-gray-50 hover:bg-blue-100' : (policy.isActive ? 'bg-green-50/50 hover:bg-yellow-100' : 'bg-red-50/50 hover:bg-yellow-100')}`}
                                                onClick={() => handleCellClick(room.roomId, policy, dateStr)}
                                            >
                                                {!isEmpty ? (
                                                    <>
                                                        <div className={policy.isActive ? 'text-green-700 font-bold' : 'text-red-500'}>{policy.isActive ? policy.price?.toLocaleString() : '판매중단'}</div>
                                                        <div className="text-xs text-gray-500 mt-1">재고: {policy.stock} / {room.totalStock}</div>
                                                    </>
                                                ) : (
                                                    <div className="h-10 flex items-center justify-center"><span className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow hover:bg-blue-600">등록</span></div>
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
                <button disabled={page === 0} onClick={() => handlePageChange(page - 1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100">이전</button>
                <span className="text-sm font-medium">{page + 1} / {totalPages || 1}</span>
                <button disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100">다음</button>
            </div>

            {/* --- Modals --- */}
            <SinglePolicyModal 
                isOpen={!!editingPolicy}
                initialData={editingPolicy}
                onClose={() => setEditingPolicy(null)}
                onSave={handleSaveSinglePolicy}
            />

            <BulkPolicyModal
                isOpen={isBulkModalOpen}
                rooms={roomData}
                onClose={() => setIsBulkModalOpen(false)}
                onSave={handleSaveBulkPolicy}
            />
        </div>
    );
};

export default RateCalendarPage;