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
  // [변경] currentProperty -> currentAccommodation
  const { currentAccommodation } = usePartner();
  const [startDate, setStartDate] = useState(new Date());
  const [roomData, setRoomData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
      roomId: null,
      startDate: formatDate(new Date()),
      endDate: formatDate(new Date()),
      price: null,
      stock: null, 
      isActive: true,
      days: [],
  });
  const dayOptions = [
      { id: 1, name: '월' }, { id: 2, name: '화' }, { id: 3, name: '수' }, 
      { id: 4, name: '목' }, { id: 5, name: '금' }, { id: 6, name: '토' }, { id: 7, name: '일' }
  ];
  
  // 캘린더 날짜 배열 생성 (14일)
  const dates = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return formatDate(date);
  });

  const loadData = async () => {
    // [변경] currentAccommodation 체크
    if (!currentAccommodation) return;
    setLoading(true);
    try {
        const startStr = dates[0];
        const endStr = dates[dates.length - 1];
        
        // [변경] propertyId -> accommodationId (함수 파라미터는 API 정의에 따라 다름)
        const data = await getFullCalendarData(currentAccommodation.accommodationId, startStr, endStr);
        
        console.log("API Response (Room Data):", data);

        setRoomData(data);
        
        if (data.length > 0 && !bulkForm.roomId) {
            setBulkForm(prev => ({ 
                ...prev, 
                roomId: data[0].roomId,
                startDate: startStr,
                endDate: endStr,
            }));
        }
    } catch (error) {
        console.error("API 로드 실패:", error);
    } finally {
        setLoading(false);
    }
  };

  // [변경] 의존성 배열 수정
  useEffect(() => { loadData(); }, [startDate, currentAccommodation]);

  const moveDate = (days) => {
      const newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() + days);
      setStartDate(newDate);
  };

  // ... (handleCellClick, handleSavePolicy 등 핸들러 로직은 변수명 영향이 없어 동일, 생략)
  const handleCellClick = (roomId, policy, dateStr) => {
      console.log(`[CLICK] Room: ${roomId}, Date: ${dateStr}, Policy Status:`, policy);
      
      if (policy) {
          setEditingPolicy({ 
              ...policy, 
              roomId: roomId, 
              targetDate: policy.targetDate ?? dateStr 
          }); 
      } else {
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

      if (editingPolicy.price === null || editingPolicy.price === '' || editingPolicy.stock === null || editingPolicy.stock === '') {
          alert("요금과 재고는 필수 입력 항목입니다.");
          return;
      }
      
      const stockValue = Number(editingPolicy.stock);
      
      if (stockValue < 0) {
          alert("재고는 마이너스 값을 입력할 수 없습니다.");
          return;
      }
      
      const targetRoom = roomData.find(room => room.roomId === editingPolicy.roomId);
      if (targetRoom && stockValue > targetRoom.totalStock) {
          alert(`재고는 객실의 최대 재고(${targetRoom.totalStock}개)를 초과할 수 없습니다.`);
          return; 
      }
      
      try {
          const payload = {
              roomId: editingPolicy.roomId,
              targetDate: editingPolicy.targetDate,
              price: Number(editingPolicy.price),
              stock: Number(editingPolicy.stock), 
              isActive: editingPolicy.isActive,
          };
          
          console.log("Saving Daily Policy Payload:", payload);

          await updateDailyPolicy(payload);
          setEditingPolicy(null);
          loadData();
      } catch (error) {
          alert("정책 저장/수정에 실패했습니다.");
      }
  };

  const openBulkModal = () => {
      setIsBulkModalOpen(true);
  };

  const handleBulkFormChange = (e) => {
      const { name, value, type, checked } = e.target;
      setBulkForm(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
      }));
  };

  const handleDaySelect = (dayId) => {
      setBulkForm(prev => ({
          ...prev,
          days: prev.days.includes(dayId)
              ? prev.days.filter(id => id !== dayId)
              : [...prev.days, dayId]
      }));
  };

  const handleBulkSubmit = async (e) => {
      e.preventDefault();
      
      if (!bulkForm.roomId || !bulkForm.startDate || !bulkForm.endDate || 
          bulkForm.price === null || bulkForm.price === '' || 
          bulkForm.stock === null || bulkForm.stock === '') {
          alert("객실, 기간, 요금, 재고는 필수 입력 항목입니다.");
          return;
      }

      const payload = {
          roomId: Number(bulkForm.roomId),
          startDate: bulkForm.startDate,
          endDate: bulkForm.endDate,
          price: Number(bulkForm.price),
          isActive: bulkForm.isActive,
          days: bulkForm.days.length > 0 ? bulkForm.days : null, 
          stock: Number(bulkForm.stock),
      };
      
      console.log(" bulk Saving Bulk Policy Payload:", payload);

      try {
          await updateBulkPolicy(payload);
          setIsBulkModalOpen(false);
          loadData();
          alert("일괄 정책 수정이 완료되었습니다.");
      } catch (error) {
          console.error("일괄 수정 오류:", error);
          alert("일괄 정책 수정에 실패했습니다.");
      }
  };


  // [변경] currentAccommodation 체크
  if (!currentAccommodation) return <div className="p-8 text-center text-gray-500">상단에서 숙소를 먼저 선택해주세요.</div>;

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
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
            <button 
                onClick={openBulkModal} 
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium text-sm"
            >
                <CalendarRange size={18}/>
                일괄 설정
            </button>

            {/* [변경] 파라미터 propertyId -> accommodationId */}
            <Link 
                to={`/partner/rooms/new?accommodationId=${currentAccommodation.accommodationId}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
                <PlusCircle size={18}/>
                객실 추가
            </Link>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="flex-grow overflow-auto">
        {loading ? (
            <div className="text-center py-20">데이터를 불러오는 중입니다...</div>
        ) : (
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40 border-r border-gray-200">객실 이름</th>
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
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-white sticky left-0 z-5">
                                {room.name}
                                <Link to={`/partner/rooms/${room.roomId}/edit`} className="ml-2 text-blue-500 hover:text-blue-700">
                                    <Edit size={14} className="inline"/>
                                </Link>
                            </td>
                            {dates.map((dateStr) => {
                                const policy = room.dailyPolicies?.find(p => p.targetDate === dateStr);
                                
                                if (policy && !policy.isActive) {
                                    console.log(`Policy Found but Inactive/Null Active: Room ${room.roomId}, Date ${dateStr}, Policy:`, policy);
                                }
                                
                                const isPolicyMissingData = !policy || (policy && (policy.price === null || policy.stock === null || policy.stock === 0));

                                let cellClass = "cursor-pointer transition duration-150";
                                let priceText = ''; 
                                let stockText = ''; 
                                let statusClass = 'text-gray-400';

                                if (policy && !isPolicyMissingData) { 
                                    cellClass += " hover:bg-yellow-100";

                                    if (policy.isActive === true) { 
                                        cellClass += " bg-green-50/50";
                                        priceText = policy.price?.toLocaleString() || '0';
                                        stockText = `재고: ${policy.stock?.toLocaleString() || '-'} / ${room.totalStock}`; 
                                        statusClass = 'text-green-700 font-bold';
                                    } else if (policy.isActive === false) { 
                                        cellClass += " bg-red-50/50";
                                        priceText = '판매중단';
                                        stockText = `재고: ${policy.stock?.toLocaleString() || '-'} / ${room.totalStock}`; 
                                        statusClass = 'text-red-500';
                                    } else { 
                                         cellClass += " bg-yellow-50/50";
                                         priceText = '등록/수정 필요';
                                         stockText = `재고: ${policy.stock?.toLocaleString() || '-'} / ${room.totalStock}`; 
                                         statusClass = 'text-yellow-700';
                                    }
                                } else {
                                    cellClass += " bg-gray-50 hover:bg-blue-100";
                                }

                                return (
                                    <td 
                                        key={dateStr} 
                                        className={`px-2 py-2 text-center text-sm border-r last:border-r-0 ${cellClass}`}
                                        onClick={() => handleCellClick(room.roomId, policy, dateStr)}
                                    >
                                        {!isPolicyMissingData ? (
                                            <>
                                                <div className={statusClass}>{priceText}</div>
                                                <div className="text-xs text-gray-500 mt-1">{stockText}</div>
                                            </>
                                        ) : (
                                            <div className="h-10 flex items-center justify-center">
                                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow font-medium hover:bg-blue-600 transition">
                                                    등록
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {roomData.length === 0 && (
                        <tr>
                            <td colSpan={15} className="py-10 text-center text-gray-500">
                                {/* [변경] 링크 내 파라미터 변경 */}
                                등록된 객실이 없습니다. <Link to={`/partner/rooms/new?accommodationId=${currentAccommodation.accommodationId}`} className="text-blue-500 font-medium hover:underline">객실을 먼저 등록해주세요.</Link>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
      </div>

      {/* --- 단일 수정/생성 모달 (생략된 부분 동일) --- */}
      {editingPolicy && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2">
                    {editingPolicy.targetDate} {editingPolicy.source ? '수정' : '정책 등록'}
                  </h3>
                  <form onSubmit={handleSavePolicy} className="space-y-4">
                      <input type="hidden" value={editingPolicy.roomId} />
                      <div>
                          <label className="form-label">1박 요금 *</label>
                          <input type="number" className="form-input w-full" value={editingPolicy.price ?? ''} onChange={(e) => setEditingPolicy({...editingPolicy, price: e.target.value !== '' ? Number(e.target.value) : null})} />
                      </div>
                      <div>
                          <label className="form-label">재고 *</label>
                          <input type="number" className="form-input w-full" value={editingPolicy.stock ?? ''} onChange={(e) => setEditingPolicy({...editingPolicy, stock: e.target.value !== '' ? Number(e.target.value) : null})} />
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

      {/* --- 🌟 일괄 수정 모달 (생략된 부분 동일) --- */}
      {isBulkModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2">기간 정책 일괄 설정</h3>
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                      
                      <div>
                          <label className="form-label">객실 선택 *</label>
                          <select 
                              name="roomId" 
                              value={bulkForm.roomId ?? ''} 
                              onChange={handleBulkFormChange} 
                              className="form-input w-full"
                              required
                          >
                              <option value="">객실을 선택하세요</option>
                              {roomData.map(room => (
                                  <option key={room.roomId} value={room.roomId}>{room.name} (ID: {room.roomId})</option>
                              ))}
                          </select>
                      </div>

                      <div className="flex gap-4">
                          <div className="flex-1">
                              <label className="form-label">시작일 *</label>
                              <input type="date" name="startDate" value={bulkForm.startDate} onChange={handleBulkFormChange} className="form-input w-full" required />
                          </div>
                          <div className="flex-1">
                              <label className="form-label">종료일 *</label>
                              <input type="date" name="endDate" value={bulkForm.endDate} onChange={handleBulkFormChange} className="form-input w-full" required />
                          </div>
                      </div>

                      <div>
                          <label className="form-label">요일 선택 (선택 안함: 전체 요일 적용)</label>
                          <div className="flex gap-2 mt-1">
                              {dayOptions.map(day => (
                                  <button
                                      key={day.id}
                                      type="button"
                                      onClick={() => handleDaySelect(day.id)}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition
                                          ${bulkForm.days.includes(day.id) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                      `}
                                  >
                                      {day.name}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="form-label">1박 요금 *</label>
                          <input type="number" name="price" placeholder="가격" value={bulkForm.price ?? ''} onChange={handleBulkFormChange} className="form-input w-full mb-3" />
                          
                          <label className="form-label">재고 *</label>
                          <input type="number" name="stock" placeholder="재고" value={bulkForm.stock ?? ''} onChange={handleBulkFormChange} className="form-input w-full" />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                          <input type="checkbox" id="bulkIsActive" name="isActive" checked={bulkForm.isActive} onChange={handleBulkFormChange} />
                          <label htmlFor="bulkIsActive">판매 활성화</label>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                          <button type="button" onClick={() => setIsBulkModalOpen(false)} className="btn-secondary-outline w-full">취소</button>
                          <button type="submit" className="btn-primary w-full">일괄 정책 적용</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default RateCalendarPage;