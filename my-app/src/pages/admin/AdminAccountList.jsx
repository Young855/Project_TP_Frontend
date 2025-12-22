import { useState } from 'react';
import { Search, Save, Filter, AlertCircle, Loader2, RotateCcw, SearchX, ShieldAlert } from 'lucide-react'; 
import { searchAccounts, updateAccountRoles } from '../../api/adminAccountAPI';

const AdminAccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    email: '',
    name: '',
    role: '',
    startDate: '',
    endDate: ''
  });

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modifiedRoles, setModifiedRoles] = useState({});

  // 🌟 [수정 1] 콤보박스 옵션에서 'ROLE_MASTER' 제거 (선택 불가)
  const roleOptions = [
    { value: 'ROLE_USER', label: 'USER (일반 사용자)' },
    { value: 'ROLE_PARTNER', label: 'PARTNER (파트너)' },
    { value: 'ROLE_PARTNER_PENDING', label: 'PARTNER_PENDING (파트너 승인대기)' },
    { value: 'ROLE_ADMIN', label: 'ADMIN (관리자)' },
    { value: 'ROLE_ADMIN_PENDING', label: 'ADMIN_PENDING (관리자 승인대기)' },
    // { value: 'ROLE_MASTER', label: 'MASTER (최고 관리자)' } // ❌ 제거됨: 선택 불가
  ];

  // ... (검색 함수, 핸들러 등은 기존과 동일하므로 생략) ...
  // fetchAccounts, handleSearch, handleReset 등 기존 코드 유지
  
  const fetchAccounts = async (searchParams) => {
    setLoading(true);
    try {
      const data = await searchAccounts({ ...searchParams, page: 0, size: 50 });
      setAccounts(data.content ? data.content : data);
      setSelectedIds(new Set());
      setModifiedRoles({});
      setHasSearched(true); 
    } catch (error) {
      alert("데이터 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => { /* ... */ 
      if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
          alert("종료일 오류"); return;
      }
      fetchAccounts({
          email: filters.email || null,
          name: filters.name || null,
          role: filters.role || null,
          startDate: filters.startDate || null,
          endDate: filters.endDate || null,
      });
  };

  const handleReset = () => { /* ... */ 
      setFilters({ email: '', name: '', role: '', startDate: '', endDate: '' });
      fetchAccounts({ email: null, name: null, role: null, startDate: null, endDate: null });
  };

  const toggleSelect = (id) => { /* ... */ 
      const newSelected = new Set(selectedIds);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => { /* ... */ 
     // MASTER 계정은 제외하고 전체 선택
     const availableAccounts = accounts.filter(acc => acc.role !== 'ROLE_MASTER');
     if (selectedIds.size === availableAccounts.length && availableAccounts.length > 0) {
        setSelectedIds(new Set());
     } else {
        setSelectedIds(new Set(availableAccounts.map(acc => acc.accountId)));
     }
  };

 const handleRoleChange = (id, newRole) => {
      if (selectedIds.has(id)) {
          const newModifiedRoles = { ...modifiedRoles };
          selectedIds.forEach((selectedId) => {
              const account = accounts.find(a => a.accountId === selectedId);
              if (account && account.role !== 'ROLE_MASTER') {
                  newModifiedRoles[selectedId] = newRole;
              }
          });
          
          setModifiedRoles(newModifiedRoles);
      } else {
          setModifiedRoles(prev => ({ ...prev, [id]: newRole }));
          const newSelected = new Set(selectedIds);
          newSelected.add(id);
          setSelectedIds(newSelected);
      }
  };
  const handleBulkUpdate = async () => { /* ... */ 
      if (selectedIds.size === 0) return;
      if (!confirm(`선택한 ${selectedIds.size}개 계정의 권한을 수정하시겠습니까?`)) return;

      const updatePayload = {};
      selectedIds.forEach(id => {
        const changed = modifiedRoles[id];
        const original = accounts.find(a => a.accountId === id)?.role;
        updatePayload[id] = changed || original;
      });

      try {
        await updateAccountRoles(updatePayload);
        alert("수정완료");
        handleSearch();
      } catch (e) { alert("수정 실패"); }
  };

  return (
    <div className="space-y-6">
      {/* 필터 영역 (기존과 동일) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         {/* ... (필터 UI 생략, 위 코드와 동일) ... */}
         {/* ... 권한 필터에서도 ROLE_MASTER 검색은 가능하게 할지, 뺄지 결정. 보통 검색은 둬도 됩니다. ... */}
         
         {/* 상단 헤더 및 필터 입력 부분은 기존 코드 유지 */}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Filter size={20}/> 계정 관리
            </h2>
            <button onClick={handleReset} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition text-sm font-medium">
                <RotateCcw size={16}/> 필터 초기화
            </button>
         </div>

         <div className="flex flex-wrap gap-4 items-end">
             {/* ... 이메일, 이름 입력창 ... */}
             <div className="h-[70px]">
                <label className="block text-sm mb-1 font-medium text-gray-700">이메일</label>
                <input className="border border-gray-300 p-2 rounded text-sm w-48 outline-none focus:ring-2 focus:ring-blue-500" value={filters.email} onChange={e=>setFilters({...filters, email:e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <div className="h-[70px]">
                <label className="block text-sm mb-1 font-medium text-gray-700">이름</label>
                <input className="border border-gray-300 p-2 rounded text-sm w-40 outline-none focus:ring-2 focus:ring-blue-500" value={filters.name} onChange={e=>setFilters({...filters, name:e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>

            {/* 권한 필터 (여기는 검색용이라 MASTER 있어도 되지만, 헷갈리면 roleOptions 그대로 써서 빼도 됨) */}
            <div className="h-[70px]">
                <label className="block text-sm mb-1 font-medium text-gray-700">권한</label>
                <select className="border border-gray-300 p-2 rounded text-sm w-40 outline-none focus:ring-2 focus:ring-blue-500" value={filters.role} onChange={e=>setFilters({...filters, role:e.target.value})}>
                    <option value="">전체</option>
                    {roleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                    {/* 검색을 위해 MASTER가 필요하다면 여기에만 따로 추가 */}
                    <option value="ROLE_MASTER">MASTER (최고 관리자)</option> 
                </select>
            </div>

            {/* 가입일, 버튼 등 기존 코드 유지 */}
            <div className="h-[70px]">
                 {/* ... 날짜 입력창 ... */}
                 <label className="block text-sm mb-1 font-medium text-gray-700">가입일</label>
                 <div className="flex items-center gap-2">
                    <input type="date" className="border border-gray-300 px-3 py-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={filters.startDate} onChange={(e) => {/*...*/}} />
                    <span className="text-gray-500">~</span>
                    <input type="date" className="border border-gray-300 px-3 py-2 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" value={filters.endDate} min={filters.startDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
                 </div>
            </div>

            <div className="flex gap-2 ml-auto h-[70px] items-end pb-1">
                <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={16}/> : <Search size={16}/>} 조회
                </button>
                <button onClick={handleBulkUpdate} disabled={selectedIds.size === 0} className={`px-4 py-2 rounded transition flex items-center gap-2 text-white ${selectedIds.size > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}>
                    <Save size={16}/> 수정 ({selectedIds.size})
                </button>
            </div>
         </div>
      </div>

      {/* 테이블 영역 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
               <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
               <p>데이터를 불러오는 중입니다...</p>
           </div>
        ) : accounts.length === 0 ? (
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
                       <p className="font-medium text-lg text-gray-600">조건에 맞는 계정이 없습니다.</p>
                   </>
               )}
           </div>
        ) : (
            <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                <th className="p-4 w-12 text-center">
                    <input 
                        type="checkbox" 
                        onChange={toggleSelectAll} 
                        // MASTER를 제외하고 모두 선택되었는지 확인
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
                {accounts.map(acc => {
                    // 🌟 [수정 2] MASTER인지 확인
                    const isMaster = acc.role === 'ROLE_MASTER';

                    return (
                    <tr key={acc.accountId} className={`border-b hover:bg-gray-50 ${isMaster ? 'bg-gray-50' : ''}`}>
                        <td className="p-4 text-center">
                            {/* MASTER는 체크박스 비활성화 (수정 불가) */}
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
                            // 🌟 MASTER인 경우: 콤보박스 대신 텍스트 표시
                            <div className="flex items-center gap-1 text-red-600 font-bold px-2 py-1.5 bg-red-50 border border-red-100 rounded w-fit">
                                <ShieldAlert size={16}/> 최고 관리자 (변경불가)
                            </div>
                        ) : (
                            // 🌟 일반 계정인 경우: MASTER가 빠진 roleOptions 콤보박스 표시
                            <select 
                                className={`border rounded p-1 text-sm outline-none transition-colors 
                                    ${modifiedRoles[acc.accountId] ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-300'}
                                `}
                                value={modifiedRoles[acc.accountId] || acc.role}
                                onChange={(e) => handleRoleChange(acc.accountId, e.target.value)}
                            >
                                {roleOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        </td>
                        <td className="p-4 text-right text-gray-500">{new Date(acc.createdAt).toLocaleDateString()}</td>
                    </tr>
                )})}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
};
export default AdminAccountList;