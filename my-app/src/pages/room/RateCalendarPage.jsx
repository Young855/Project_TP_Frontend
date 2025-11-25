// com/example/tp/view/RateCalendarPage.jsx

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, CalendarRange, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFullCalendarData, updateDailyPolicy, updateBulkPolicy } from '../../api/roomAPI';
import { usePartner } from '../../context/PartnerContext';

// 날짜 포맷 (YYYY-MM-DD)
const formatDate = (date) => date.toISOString().split('T')[0];

// 요일 구하기
const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
};

const RateCalendarPage = () => {
  const { currentProperty } = usePartner();
  const [startDate, setStartDate] = useState(new Date());
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(false);

  // [상태 1] 단일 수정 모달
  const [editingPolicy, setEditingPolicy] = useState(null);
  
  // [상태 2] 일괄 수정 모달 (NEW)
  // 🌟 일괄 수정 관련 상태 및 폼 제거 (Daily Insert에 초점)
  /*
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
      // ... (일괄 수정 폼 필드 제거됨)
  });
  */

  // 캘린더 날짜 배열 생성 (14일)
  const dates = [];
  for (let i = 0; i < 14; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(formatDate(d));
  }

  const loadData = async () => {
    if (!currentProperty) return;
    setLoading(true);
    try {
        const startStr = dates[0];
        const endStr = dates[dates.length - 1];
        
        // 🌟 roomAPI에서 DailyRoomPolicyDTO에 stock 필드가 있으므로, 
        // 캘린더 데이터는 DailyRoomPolicyDTO 구조를 사용합니다.
        const data = await getFullCalendarData(currentProperty.propertyId, startStr, endStr);
        setRoomData(data);
        
        // 🌟 일괄 수정 관련 초기 설정 제거
        /*
        if (data.length > 0 && !bulkForm.roomId) {
            setBulkForm(prev => ({ ...prev, roomId: data[0].roomId }));
        }
        */
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [startDate, currentProperty]);

  const moveDate = (days) => {
      const newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() + days);
      setStartDate(newDate);
  };

  // --- 단일 수정/생성 핸들러 ---
  const handleCellClick = (roomId, policy, dateStr) => {
      if (policy) {
          // 정책이 있는 경우: 수정 모드로 정책 데이터 로드
          setEditingPolicy({ 
              ...policy, 
              roomId: roomId, 
              targetDate: policy.targetDate ?? dateStr 
          }); 
      } else {
          // 정책이 없는 경우: 신규 생성 모드로 초기화 (재고와 가격은 null 또는 0으로 시작)
          setEditingPolicy({ 
              roomId: roomId, 
              targetDate: dateStr, 
              price: null, 
              stock: null, 
              isActive: true 
          }); 
      }
  };

  const handleSavePolicy = async (e) => {
      e.preventDefault();
      try {
          // 🌟 백엔드 DTO에 맞게 targetDate, price, stock, isActive 필드를 사용합니다.
          // 백엔드 Service는 정책이 없으면 생성(Create)합니다.
          const payload = {
              roomId: editingPolicy.roomId,
              targetDate: editingPolicy.targetDate,
              price: editingPolicy.price !== null ? Number(editingPolicy.price) : null,
              stock: editingPolicy.stock !== null ? Number(editingPolicy.stock) : null,
              isActive: editingPolicy.isActive,
              // source 필드는 백엔드에서 결정합니다.
          };

          await updateDailyPolicy(payload); // PUT/POST 통합 API 호출
          setEditingPolicy(null);
          loadData();
      } catch (error) {
          alert("정책 저장/수정에 실패했습니다.");
      }
  };

  // --- 일괄 수정 핸들러 (제거됨) ---
  /*
  const openBulkModal = () => {
      // ... (제거됨)
  };
  const handleBulkSubmit = async (e) => {
      // ... (제거됨)
  };
  */

  if (!currentProperty) return <div className="p-8 text-center text-gray-500">상단에서 숙소를 먼저 선택해주세요.</div>;

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      {/* 상단 컨트롤러 */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">객실 요금 캘린더</h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => moveDate(-7)} className="p-1 hover:bg-white rounded shadow-sm"><ChevronLeft size={20}/></button>
                <span className="px-4 font-medium text-sm">{dates[0]} ~ {dates[dates.length-1]}</span>
                <button onClick={() => moveDate(7)} className="p-1 hover:bg-white rounded shadow-sm"><ChevronRight size={20}/></button>
            </div>
        </div>
        <div className="flex gap-2">
            {/* 🌟 일괄 설정 버튼 제거됨 */}
            {/* <button onClick={openBulkModal} ... /> */}

            <Link 
                to={`/partner/rooms/new?propertyId=${currentProperty.propertyId}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
                <PlusCircle size={18}/>
                객실 추가
            </Link>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
            {loading ? (
                <div className="p-10 text-center text-gray-500">데이터 로딩 중...</div>
            ) : roomData.length === 0 ? (
                <div className="p-10 text-center text-gray-500">등록된 객실이 없습니다.</div>
            ) : (
                <table className="w-full border-collapse min-w-max">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="border-b border-r border-gray-200 p-3 min-w-[220px] sticky left-0 bg-gray-50 z-20 text-left text-sm font-bold text-gray-700">
                                객실 타입
                            </th>
                            {dates.map(dateStr => {
                                const dayName = getDayName(dateStr);
                                const isWeekend = dayName === '토' || dayName === '일';
                                return (
                                    <th key={dateStr} className={`border-b border-gray-200 p-2 min-w-[100px] text-center ${isWeekend ? 'bg-red-50/70 text-red-600' : ''}`}>
                                        <div className="text-xs text-gray-500">{dateStr.substring(5)}</div>
                                        <div className="text-sm font-bold">{dayName}</div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {roomData.map(room => (
                            <tr key={room.roomId} className="hover:bg-gray-50">
                                <td className="border-b border-r border-gray-200 p-4 bg-white sticky left-0 z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-gray-800">{room.name}</div>
                                        {/* 🌟 수정 버튼 추가 */}
                                        <Link to={`/partner/rooms/${room.roomId}/edit`} className="text-gray-500 hover:text-blue-600 transition">
                                            <Edit size={16} />
                                        </Link>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">ID: {room.roomId}</div>
                                </td>
                                {dates.map(dateStr => {
                                    // 백엔드는 targetDate 필드를 사용하므로 이를 기준으로 검색해야 함
                                    const policy = room.dailyPolicies?.find(p => p.targetDate === dateStr);
                                    
                                    const isSoldOut = policy && policy.stock <= 0;
                                    const isClosed = policy && !policy.isActive;
                                    const isManual = policy && policy.source === 'MANUAL';
                                    
                                    // 정책이 존재하지만 가격이 null/0인 경우 (미설정 상태)
                                    const isPriceNotSet = policy && (policy.price === null || policy.price === 0);

                                    return (
                                        <td 
                                            key={`${room.roomId}-${dateStr}`} 
                                            onClick={() => handleCellClick(room.roomId, policy, dateStr)}
                                            className={`border-b border-gray-200 p-0 cursor-pointer transition-colors border-r border-dashed relative group
                                                ${!policy || isPriceNotSet ? 'bg-red-50/50' : ''} /* 정책이 없거나 가격이 없으면 눈에 띄게 표시 */
                                                ${isClosed ? 'bg-gray-200' : ''}
                                            `}
                                        >
                                            {policy ? (
                                                <div className="h-16 flex flex-col justify-center items-center text-sm p-1">
                                                    {isClosed ? <span className="text-[10px] font-bold text-gray-500 bg-white px-1 rounded mb-1 border">OFF</span> 
                                                    : isSoldOut ? <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 rounded mb-1">매진</span>
                                                    : <span className={`text-[10px] font-bold px-1 rounded mb-1 ${isManual ? 'text-purple-600 bg-purple-100' : 'text-green-600 bg-green-100'}`}>{isManual ? '설정' : '기본'}</span>}
                                                    
                                                    {/* 가격 필드가 null 또는 0 일 때 처리 */}
                                                    <div className="font-bold text-gray-800">
                                                        {isPriceNotSet ? <span className="text-xs text-red-600">미설정</span> : `₩ ${policy.price.toLocaleString()}`}
                                                    </div>
                                                    
                                                    <div className={`text-xs ${policy.stock === 0 ? 'text-red-500' : 'text-blue-600'}`}>재고: {policy.stock ?? '-'}</div>
                                                    <div className="absolute inset-0 bg-blue-600/10 hidden group-hover:flex items-center justify-center border-2 border-blue-600">
                                                        <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded shadow font-bold">수정/등록</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-16 text-xs text-gray-400 text-center flex items-center justify-center">
                                                    <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded shadow font-bold hidden group-hover:block">등록</span>
                                                    <span className="block group-hover:hidden">-</span>
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
      </div>

      {/* --- 단일 수정/생성 모달 --- */}
      {editingPolicy && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2">
                    {editingPolicy.targetDate} {editingPolicy.source ? '수정' : '정책 등록'}
                  </h3>
                  <form onSubmit={handleSavePolicy} className="space-y-4">
                      <input type="hidden" value={editingPolicy.roomId} />
                      <div>
                          <label className="form-label">1박 요금</label>
                          {/* null일 때 0으로 표시하여 입력 편의성 제공 */}
                          <input type="number" className="form-input w-full" value={editingPolicy.price ?? ''} onChange={(e) => setEditingPolicy({...editingPolicy, price: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className="form-label">재고</label>
                          <input type="number" className="form-input w-full" value={editingPolicy.stock ?? ''} onChange={(e) => setEditingPolicy({...editingPolicy, stock: Number(e.target.value)})} />
                      </div>
                      <div className="flex items-center gap-2">
                          <input type="checkbox" checked={editingPolicy.isActive} onChange={(e) => setEditingPolicy({...editingPolicy, isActive: e.target.checked})} />
                          <label>판매 활성화</label>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setEditingPolicy(null)} className="btn-secondary-outline w-full">취소</button>
                          <button type="submit" className="btn-primary w-full">
                            {editingPolicy.source ? '정책 수정' : '정책 등록'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- 일괄 수정 모달 제거됨 --- */}
    </div>
  );
};

export default RateCalendarPage;