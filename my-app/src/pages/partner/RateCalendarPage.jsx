import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRoomCalendarData, updateDailyPolicy } from '../../api/roomAPI';
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
  const { currentProperty } = usePartner(); // 현재 선택된 호텔 Context
  const [startDate, setStartDate] = useState(new Date()); // 기준 시작일
  const [roomData, setRoomData] = useState([]); // API 데이터
  const [loading, setLoading] = useState(false);

  // 수정 모달 상태
  const [editingPolicy, setEditingPolicy] = useState(null);

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
        
        // API 호출
        const data = await getRoomCalendarData(currentProperty.propertyId, startStr, endStr);
        setRoomData(data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      loadData();
  }, [startDate, currentProperty]);

  const moveDate = (days) => {
      const newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() + days);
      setStartDate(newDate);
  };

  const handleCellClick = (policy) => {
      if(!policy) return;
      setEditingPolicy({ ...policy }); // 수정용 객체 복사
  };

  const handleSavePolicy = async (e) => {
      e.preventDefault();
      try {
          await updateDailyPolicy(editingPolicy);
          setEditingPolicy(null);
          loadData(); // 데이터 갱신
      } catch (error) {
          alert("수정에 실패했습니다.");
      }
  };

  if (!currentProperty) {
      return <div className="p-8 text-center text-gray-500">상단에서 숙소를 먼저 선택해주세요.</div>;
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      {/* 상단 컨트롤러 */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">요금 및 재고 관리</h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => moveDate(-7)} className="p-1 hover:bg-white rounded shadow-sm"><ChevronLeft size={20}/></button>
                <span className="px-4 font-medium text-sm">{dates[0]} ~ {dates[dates.length-1]}</span>
                <button onClick={() => moveDate(7)} className="p-1 hover:bg-white rounded shadow-sm"><ChevronRight size={20}/></button>
            </div>
        </div>
        <Link 
            to={`/partner/rooms/new?propertyId=${currentProperty.propertyId}`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
            <PlusCircle size={18}/>
            객실 추가
        </Link>
      </div>

      {/* 캘린더 그리드 */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
            {loading ? (
                <div className="p-10 text-center text-gray-500">데이터를 불러오는 중입니다...</div>
            ) : roomData.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                    등록된 객실이 없습니다. 우측 상단 '객실 추가' 버튼을 눌러 시작하세요.
                </div>
            ) : (
                <table className="w-full border-collapse min-w-max">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="border-b border-r border-gray-200 p-3 min-w-[180px] sticky left-0 bg-gray-50 z-20 text-left text-sm font-bold text-gray-700">
                                객실 타입
                            </th>
                            {dates.map(dateStr => {
                                const dayName = getDayName(dateStr);
                                const isWeekend = dayName === '토' || dayName === '일';
                                return (
                                    <th key={dateStr} className={`border-b border-gray-200 p-2 min-w-[100px] text-center ${isWeekend ? 'bg-red-50 text-red-600' : ''}`}>
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
                                    <div className="font-bold text-gray-800">{room.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">ID: {room.roomId}</div>
                                </td>

                                {dates.map(dateStr => {
                                    // 백엔드 DTO 구조에 따라 policy 매핑 (RoomDTO 안에 dailyPolicies 리스트 가정)
                                    const policy = room.dailyPolicies?.find(p => p.targetDate === dateStr);
                                    const isSoldOut = policy && policy.stock <= 0;
                                    const isClosed = policy && !policy.isActive;

                                    return (
                                        <td 
                                            key={`${room.roomId}-${dateStr}`} 
                                            onClick={() => handleCellClick(policy)}
                                            className={`border-b border-gray-200 p-0 cursor-pointer transition-colors border-r border-dashed relative group
                                                ${!policy ? 'bg-gray-100' : ''}
                                                ${isClosed ? 'bg-gray-200' : ''}
                                            `}
                                        >
                                            {policy ? (
                                                <div className="h-16 flex flex-col justify-center items-center text-sm p-1">
                                                    {isClosed ? (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-white px-1 rounded mb-1 border">OFF</span>
                                                    ) : isSoldOut ? (
                                                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 rounded mb-1">매진</span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1 rounded mb-1">ON</span>
                                                    )}
                                                    
                                                    <div className="font-bold text-gray-800">₩ {policy.price.toLocaleString()}</div>
                                                    <div className={`text-xs ${policy.stock === 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                                        재고: {policy.stock}
                                                    </div>
                                                    
                                                    <div className="absolute inset-0 bg-blue-600/10 hidden group-hover:flex items-center justify-center border-2 border-blue-600">
                                                        <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded shadow font-bold">수정</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-400 text-center">-</div>
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

      {/* 수정 모달 */}
      {editingPolicy && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold mb-4 border-b pb-2">
                      {editingPolicy.targetDate} 요금/재고 수정
                  </h3>
                  <form onSubmit={handleSavePolicy} className="space-y-4">
                      <div>
                          <label className="form-label">1박 요금 (원)</label>
                          <input 
                              type="number" 
                              className="form-input w-full"
                              value={editingPolicy.price}
                              onChange={(e) => setEditingPolicy({...editingPolicy, price: Number(e.target.value)})}
                          />
                      </div>
                      <div>
                          <label className="form-label">재고 수량 (개)</label>
                          <input 
                              type="number" 
                              className="form-input w-full"
                              value={editingPolicy.stock}
                              onChange={(e) => setEditingPolicy({...editingPolicy, stock: Number(e.target.value)})}
                          />
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                          <input 
                              type="checkbox" 
                              id="isActive"
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                              checked={editingPolicy.isActive}
                              onChange={(e) => setEditingPolicy({...editingPolicy, isActive: e.target.checked})}
                          />
                          <label htmlFor="isActive" className="font-medium text-gray-700 cursor-pointer select-none flex-1">
                              판매 활성화 (ON/OFF)
                          </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setEditingPolicy(null)} className="btn-secondary-outline w-full">취소</button>
                          <button type="submit" className="btn-primary w-full">저장</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default RateCalendarPage;