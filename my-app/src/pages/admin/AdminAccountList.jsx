import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Save, Filter, Loader2, RotateCcw, SearchX, ShieldAlert } from 'lucide-react'; 
import { searchAccounts, updateAccountRoles } from '../../api/adminAccountAPI';
import ScrollToTop from '../../components/ScrollToTop';

const AdminAccountList = () => {
  // 서버에서 받아온 계정 데이터를 저장하는 배열 (무한 스크롤 시 데이터가 계속 누적됨)
  const [accounts, setAccounts] = useState([]);
  // 데이터 로딩 중인지 여부 (로딩바 표시 및 중복 요청 방지용)
  const [loading, setLoading] = useState(false);
  // 사용자가 한 번이라도 검색을 시도했는지 여부 (초기 안내 문구 vs 검색 결과 없음 문구 구분용)
  const [hasSearched, setHasSearched] = useState(false);
  // 다음 데이터를 불러올 기준점 (마지막으로 조회된 계정의 ID). null이면 첫 페이지를 의미.
  const [lastId, setLastId] = useState(null);
  // 서버에 더 불러올 데이터가 남아있는지 여부 (false면 무한 스크롤 중단)
  const [hasNext, setHasNext] = useState(false);
  // 무한 스크롤 감지를 위한 Observer 객체 저장소
  const observer = useRef();
  // 검색 필터 상태 (사용자 입력값)
  const [filters, setFilters] = useState({
    email: '',
    name: '',
    role: '',
    startDate: '', 
    endDate: ''    
  });
  // 체크박스로 선택된 계정들의 ID 집합 (Set을 사용하여 중복 방지 및 빠른 조회)
  const [selectedIds, setSelectedIds] = useState(new Set());
  // 변경할 권한을 임시 저장하는 객체 { accountId: 'ROLE_ADMIN', ... }
  const [modifiedRoles, setModifiedRoles] = useState({});
  // 콤보박스에 표시할 권한 목록 (ROLE_MASTER는 선택할 수 없도록 제외)
  const roleOptions = [
    { value: 'ROLE_USER', label: 'USER (일반 사용자)' },
    { value: 'ROLE_PARTNER', label: 'PARTNER (파트너)' },
    { value: 'ROLE_PARTNER_PENDING', label: 'PARTNER_PENDING (파트너 승인대기)' },
    { value: 'ROLE_ADMIN', label: 'ADMIN (관리자)' },
    { value: 'ROLE_ADMIN_PENDING', label: 'ADMIN_PENDING (관리자 승인대기)' },
  ];

  const fetchAccounts = async (currentFilters, cursorId = null, isLoadMore = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await searchAccounts({ 
          ...currentFilters, 
          lastId: cursorId, 
          size: 50 
      });
      const { values, hasNext: hasNextPage, lastId: nextCursor } = response;
      if (isLoadMore) {
        // [무한 스크롤 모드] 기존 데이터 배열(prev) 뒤에 새로운 데이터(values)를 이어 붙임
        setAccounts(prev => [...prev, ...values]);
      } else {
        // [새 검색 모드] 기존 데이터를 싹 지우고 새로운 데이터로 교체
        setAccounts(values);
        setSelectedIds(new Set()); 
        setModifiedRoles({});      
      }
      // 다음 요청을 위해 커서와 상태 업데이트
      setLastId(nextCursor);
      setHasNext(hasNextPage);
      setHasSearched(true);
      
    } catch (error) {
      console.error("데이터 조회 에러:", error);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNext) {
        console.log("스크롤 하단 감지! 다음 데이터 요청...");
        fetchAccounts(filters, lastId, true); 
      }
    });
    if (node) observer.current.observe(node);

  }, [loading, hasNext, lastId, filters]); 

  const handleSearch = () => {
      // 날짜 유효성 검사
      if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
          alert("종료일은 시작일보다 빠를 수 없습니다."); return;
      }
      // 커서를 null로 초기화하고 새로운 검색 시작
      setLastId(null);
      fetchAccounts(filters, null, false);
  };

  // [초기화 버튼 클릭] - 필터 다 비우고 전체 조회
  const handleReset = () => {
      const emptyFilters = { email: '', name: '', role: '', startDate: '', endDate: '' };
      setFilters(emptyFilters);
      setLastId(null);
      fetchAccounts(emptyFilters, null, false);
  };

  // [개별 체크박스 토글]
  const toggleSelect = (id) => { 
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
          newSelected.delete(id); // 이미 있으면 제거
      } else {
          newSelected.add(id);    // 없으면 추가
      }
      setSelectedIds(newSelected);
  };

  // [전체 선택/해제 토글]
  const toggleSelectAll = () => { 
      // ROLE_MASTER(최고 관리자)는 전체 선택에서 제외해야 함
      const availableAccounts = accounts.filter(acc => acc.role !== 'ROLE_MASTER');
      
      // 현재 화면에 있는 '선택 가능한' 모든 계정이 이미 선택되었는지 확인
      const allSelected = availableAccounts.length > 0 && availableAccounts.every(acc => selectedIds.has(acc.accountId));
      
      const newSelected = new Set(selectedIds);
      
      if (allSelected) {
        // 이미 다 선택되어 있다면 -> 모두 해제
        availableAccounts.forEach(acc => newSelected.delete(acc.accountId));
      } else {
        // 하나라도 선택 안 된 게 있다면 -> 모두 선택
        availableAccounts.forEach(acc => newSelected.add(acc.accountId));
      }
      setSelectedIds(newSelected);
  };

  // [권한 변경 드롭다운 조작]
  const handleRoleChange = (id, newRole) => {
      // 1. 변경된 권한을 상태에 임시 저장 (즉시 API 호출 X, 수정 버튼 눌러야 반영)
      setModifiedRoles(prev => ({ ...prev, [id]: newRole }));
      
      // 2. 권한을 바꾸면 자동으로 해당 행의 체크박스도 체크해줌 (사용자 편의성)
      if (!selectedIds.has(id)) {
          const newSelected = new Set(selectedIds);
          newSelected.add(id);
          setSelectedIds(newSelected);
      }
  };
  const handleBulkUpdate = async () => { 
      if (selectedIds.size === 0) return;
      if (!confirm(`선택한 ${selectedIds.size}개 계정의 권한을 수정하시겠습니까?`)) return;
      const updatePayload = {};
      selectedIds.forEach(id => {
        const changedRole = modifiedRoles[id];          
        const originalRole = accounts.find(a => a.accountId === id)?.role;
        updatePayload[id] = changedRole || originalRole;
      });

      try {
        await updateAccountRoles(updatePayload);
        alert("성공적으로 수정되었습니다.");
        setAccounts(prev => prev.map(acc => {
            if (selectedIds.has(acc.accountId) && modifiedRoles[acc.accountId]) {
                return { ...acc, role: modifiedRoles[acc.accountId] };
            }
            return acc;
        }));
        setModifiedRoles({});
        setSelectedIds(new Set());

      } catch (e) { 
          alert("수정에 실패했습니다."); 
          console.error(e);
      }
  };
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Filter size={20}/> 계정 관리
            </h2>
            <button onClick={handleReset} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition text-sm font-medium">
                <RotateCcw size={16}/> 필터 초기화
            </button>
         </div>
         <div className="flex flex-wrap gap-4 items-end">
            <div className="h-[70px]">
                <label className="block text-sm mb-1 font-medium text-gray-700">이메일</label>
                <input 
                    className="border border-gray-300 p-2 rounded text-sm w-48 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={filters.email} 
                    onChange={e=>setFilters({...filters, email:e.target.value})} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                />
            </div>
            <div className="h-[70px]">
                <label className="block text-sm mb-1 font-medium text-gray-700">이름</label>
                <input 
                    className="border border-gray-300 p-2 rounded text-sm w-40 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={filters.name} 
                    onChange={e=>setFilters({...filters, name:e.target.value})} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                />
            </div>
            <div className="h-[70px]">
                <label className="block text-sm mb-1 font-medium text-gray-700">권한</label>
                <select 
                    className="border border-gray-300 p-2 rounded text-sm w-40 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={filters.role} 
                    onChange={e=>setFilters({...filters, role:e.target.value})}
                >
                    <option value="">전체</option>
                    {roleOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    <option value="ROLE_MASTER">MASTER (최고 관리자)</option> 
                </select>
            </div>
            <div className="h-[70px]">
                 <label className="block text-sm mb-1 font-medium text-gray-700">가입일</label>
                 <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        className="border border-gray-300 px-3 py-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                        value={filters.startDate} 
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})} 
                    />
                    <span className="text-gray-500">~</span>
                    <input 
                        type="date" 
                        className="border border-gray-300 px-3 py-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                        value={filters.endDate} 
                        min={filters.startDate} 
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})} 
                    />
                 </div>
            </div>
            <div className="flex gap-2 ml-auto h-[70px] items-end pb-1">
                <button 
                    onClick={handleSearch} 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                >
                    {loading && accounts.length === 0 ? <Loader2 className="animate-spin" size={16}/> : <Search size={16}/>} 조회
                </button>
                <button 
                    onClick={handleBulkUpdate} 
                    disabled={selectedIds.size === 0} 
                    className={`px-4 py-2 rounded transition flex items-center gap-2 text-white ${selectedIds.size > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    <Save size={16}/> 수정 ({selectedIds.size})
                </button>
            </div>
         </div>
      </div>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {loading && accounts.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
               <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
               <p>데이터를 불러오는 중입니다...</p>
           </div>
        ) 
        : accounts.length === 0 ? (
           <div className="p-12 text-center text-gray-500 h-[300px] flex flex-col items-center justify-center">
               {!hasSearched ? (
                   <>
                       <Search className="mb-3 text-gray-300" size={48} />
                       <p className="font-medium text-lg text-gray-600">조건을 입력하고 조회 버튼을 눌러주세요.</p>
                   </>
               ) : (
                   <>
                       <SearchX className="mb-3 text-gray-300" size={48} />
                       <p className="font-medium text-lg text-gray-600">조건에 맞는 계정이 없습니다.</p>
                   </>
               )}
           </div>
        ) 
        : (
            <>
                <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                    <tr>
                    <th className="p-4 w-12 text-center">
                        <input 
                            type="checkbox" 
                            onChange={toggleSelectAll} 
                            checked={
                                accounts.some(a => a.role !== 'ROLE_MASTER') && 
                                accounts.filter(a => a.role !== 'ROLE_MASTER').every(a => selectedIds.has(a.accountId))
                            } 
                        />
                    </th>
                    <th className="p-4">이름</th>
                    <th className="p-4">이메일</th>
                    <th className="p-4">권한 변경</th>
                    <th className="p-4 text-right">가입일</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((acc, index) => {
                        const isMaster = acc.role === 'ROLE_MASTER';
                        const isLastElement = accounts.length === index + 1;

                        return (
                        <tr 
                            key={acc.accountId} 
                            ref={isLastElement ? lastElementRef : null}
                            className={`border-b hover:bg-gray-50 ${isMaster ? 'bg-gray-50' : ''}`}
                        >
                            <td className="p-4 text-center">
                                <input 
                                    type="checkbox" 
                                    disabled={isMaster} 
                                    checked={selectedIds.has(acc.accountId)} 
                                    onChange={() => toggleSelect(acc.accountId)} 
                                    className={isMaster ? "cursor-not-allowed opacity-50" : ""} 
                                />
                            </td>
                            <td className="p-4 font-bold text-gray-800">{acc.name}</td>
                            <td className="p-4 text-gray-600">{acc.email}</td>
                            <td className="p-4">
                                {isMaster ? (
                                    <div className="flex items-center gap-1 text-red-600 font-bold px-2 py-1.5 bg-red-50 border border-red-100 rounded w-fit">
                                        <ShieldAlert size={16}/> 최고 관리자
                                    </div>
                                ) : (
                                    <select 
                                        className={`border rounded p-1 text-sm outline-none transition-colors ${
                                            modifiedRoles[acc.accountId] ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-gray-300'
                                        }`}
                                        value={modifiedRoles[acc.accountId] || acc.role}
                                        onChange={(e) => handleRoleChange(acc.accountId, e.target.value)}
                                    >
                                        {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                )}
                            </td>
                            <td className="p-4 text-right text-gray-500">{new Date(acc.createdAt).toLocaleDateString()}</td>
                        </tr>
                    )})}
                </tbody>
                </table>
                {loading && (
                    <div className="p-4 flex justify-center bg-gray-50 border-t">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Loader2 className="animate-spin text-blue-600" size={20} />
                            <span>추가 데이터를 불러오는 중...</span>
                        </div>
                    </div>
                )}
            </>
        )}
        
      </div>
    </div>
  );
};
export default AdminAccountList;