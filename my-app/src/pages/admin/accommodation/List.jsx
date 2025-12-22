import { useState } from 'react';
import { Search, Save, Filter, AlertCircle, Loader2, SearchX, RotateCcw } from 'lucide-react'; // 🌟 RotateCcw 아이콘 추가
import { searchAccommodations, updateAccommodationStatuses } from '../../../api/accommodationAPI';

const List = () => {
  // === 상태 관리 ===
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 검색 실행 여부 (안내 메시지 분기용)
  const [hasSearched, setHasSearched] = useState(false);

  // 검색 필터 상태
  const [filters, setFilters] = useState({
    partnerName: '',
    authStatus: '', 
    keyword: '',
    startDate: '', 
    endDate: ''    
  });

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modifiedStatuses, setModifiedStatuses] = useState({});

  // === 내부 함수: API 호출 (재사용을 위해 분리) ===
  const fetchAccommodations = async (searchParams) => {
    setLoading(true);
    try {
      const data = await searchAccommodations({
        ...searchParams,
        page: 0,
        size: 50
      });
      
      const list = data.content ? data.content : data;
      setAccommodations(list);
      setHasSearched(true); // 검색 완료 표시

      // 선택 초기화
      setSelectedIds(new Set());
      setModifiedStatuses({});
      
    } catch (error) {
      console.error(error);
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // === 핸들러 함수 ===

  // 1. 검색 버튼 클릭
  const handleSearch = () => {
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
        alert("종료일은 시작일보다 빠를 수 없습니다.");
        return;
    }
    // 현재 상태(filters)로 검색
    fetchAccommodations({
        partnerName: filters.partnerName || null,
        authStatus: filters.authStatus || null,
        keyword: filters.keyword || null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
    });
  };

  // 🌟 [추가] 초기화 버튼 핸들러
  const handleReset = () => {
    // 1. 필터 상태 비우기
    setFilters({
        partnerName: '',
        authStatus: '',
        keyword: '',
        startDate: '',
        endDate: ''
    });

    // 2. 조건 없이 전체 목록 다시 불러오기 (null 전달)
    fetchAccommodations({
        partnerName: null,
        authStatus: null,
        keyword: null,
        startDate: null,
        endDate: null,
    });
  };

  // 2. 체크박스 개별 토글
  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 3. 체크박스 전체 토글
  const toggleSelectAll = () => {
    if (selectedIds.size === accommodations.length && accommodations.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(accommodations.map(acc => acc.accommodationId));
      setSelectedIds(allIds);
    }
  };

  // 4. 상태 변경 (Combo)
  const handleStatusChange = (id, newStatus) => {
    if (selectedIds.has(id)) {
        const newModifiedStatuses = { ...modifiedStatuses };
        selectedIds.forEach((selectedId) => {
            newModifiedStatuses[selectedId] = newStatus;
        });
        
        setModifiedStatuses(newModifiedStatuses);
    } else {
        setModifiedStatuses(prev => ({
            ...prev,
            [id]: newStatus
        }));
        const newSelected = new Set(selectedIds);
        newSelected.add(id);
        setSelectedIds(newSelected);
    }
  };

  // 5. 일괄 수정 저장
  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`선택한 ${selectedIds.size}개 숙소의 상태를 수정하시겠습니까?`)) return;

    const updatePayload = {};
    selectedIds.forEach(id => {
      const changedVal = modifiedStatuses[id];
      const originalVal = accommodations.find(a => a.accommodationId === id)?.auth;
      updatePayload[id] = changedVal || originalVal;
    });

    try {
      await updateAccommodationStatuses(updatePayload);
      alert("수정이 완료되었습니다.");
      
      // 수정 후 현재 필터 상태로 목록 갱신
      handleSearch(); 
    } catch (error) {
      alert("수정 실패: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRM': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DECLINED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Filter size={20} />
                숙소 관리 필터
            </h2>
            <button 
                onClick={handleReset} 
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition text-sm font-medium"
                title="모든 필터 초기화"
            >
                <RotateCcw size={16}/> 필터 초기화
            </button>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end ">
            {/* 1. 파트너 이름 */}
            <div className=" h-[90px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">파트너 이름</label>
                <input 
                    type="text" 
                    placeholder="파트너명 입력"
                    className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters.partnerName}
                    onChange={(e) => setFilters({...filters, partnerName: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* 2. 숙소 이름 */}
            <div className="flex-1 min-w-[200px] h-[90px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">숙소명 검색</label>
                <input 
                    type="text" 
                    placeholder="숙소 이름 입력..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filters.keyword}
                    onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            
            {/* 3. 승인 상태 */}
            <div className="h-[90px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">승인 상태</label>
                <select 
                    className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none"
                    value={filters.authStatus}
                    onChange={(e) => setFilters({...filters, authStatus: e.target.value})}
                >
                    <option value="">전체</option>
                    <option value="PENDING">대기중 (PENDING)</option>
                    <option value="CONFIRM">승인됨 (CONFIRM)</option>
                    <option value="DECLINED">거절됨 (DECLINED)</option>
                </select>
            </div>
           
           {/* 4. 등록 기간 */}
            <div className="h-[90px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">등록 기간</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.startDate}
                        onChange={(e) => {
                            const newStartDate = e.target.value;
                            if (filters.endDate && newStartDate > filters.endDate) {
                                setFilters({ ...filters, startDate: newStartDate, endDate: newStartDate });
                            } else {
                                setFilters({ ...filters, startDate: newStartDate });
                            }
                        }}
                    />
                    <span className="text-gray-500">~</span>
                    <input 
                        type="date" 
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.endDate}
                        min={filters.startDate} 
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    />
                </div>
            </div>

            {/* 5. 하단 버튼 그룹 */}
            <div className="flex gap-2 ml-auto h-[90px] items-center">
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition shadow-sm font-medium disabled:bg-blue-400"
                >
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <Search size={18} />}
                    조회
                </button>
                
                <button 
                    onClick={handleBulkUpdate}
                    disabled={selectedIds.size === 0 || loading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-md transition shadow-sm font-medium ${
                        selectedIds.size > 0 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Save size={18} />
                    선택 항목 수정 ({selectedIds.size})
                </button>
            </div>
        </div>
      </div>

      {/* ================= [테이블 영역] ================= */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
        
        {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                <p className="text-sm font-medium">데이터를 불러오는 중입니다...</p>
            </div>
        ) : accommodations.length === 0 ? (
            <div className="p-12 text-center text-gray-500 h-[300px] flex flex-col items-center justify-center">
                {!hasSearched ? (
                    <>
                        <Search className="mb-3 text-gray-300" size={48} />
                        <p className="font-medium text-lg text-gray-600">조건을 입력하고 조회 버튼을 눌러주세요.</p>
                        <p className="text-sm mt-1">원하는 필터를 선택 후 검색해주세요.</p>
                    </>
                ) : (
                    <>
                        <SearchX className="mb-3 text-gray-300" size={48} />
                        <p className="font-medium text-lg text-gray-600">조건에 맞는 숙소가 없습니다.</p>
                        <p className="text-sm mt-1">검색 조건을 변경하여 다시 시도해주세요.</p>
                    </>
                )}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    onChange={toggleSelectAll}
                                    checked={accommodations.length > 0 && selectedIds.size === accommodations.length}
                                />
                            </th>
                            <th className="p-4">파트너명</th>
                            <th className="p-4">숙소명 / 주소</th>
                            <th className="p-4 text-center">현재 상태</th>
                            <th className="p-4 w-48">상태 변경 (Combo)</th>
                            <th className="p-4 text-right">등록일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {accommodations.map((acc) => {
                            const currentVal = modifiedStatuses[acc.accommodationId] || acc.auth;
                            const isSelected = selectedIds.has(acc.accommodationId);

                            return (
                                <tr key={acc.accommodationId} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                    <td className="p-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(acc.accommodationId)}
                                        />
                                    </td>
                                    
                                    <td className="p-4">
                                        <span className="font-medium text-gray-800">{acc.partnerName}</span>
                                    </td>

                                    <td className="p-4">
                                        <p className="font-bold text-gray-800">{acc.name}</p>
                                        <p className="text-gray-500 text-xs truncate max-w-[250px]">{acc.address}</p>
                                    </td>

                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(acc.auth)}`}>
                                            {acc.auth}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <select
                                            className={`w-full px-2 py-1.5 text-sm border rounded outline-none transition-colors
                                                ${modifiedStatuses[acc.accommodationId] ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-300'}
                                            `}
                                            value={currentVal}
                                            onChange={(e) => handleStatusChange(acc.accommodationId, e.target.value)}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="CONFIRM">CONFIRM</option>
                                            <option value="DECLINED">DECLINED</option>
                                        </select>
                                    </td>

                                    <td className="p-4 text-right text-gray-500">
                                        {new Date(acc.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default List;