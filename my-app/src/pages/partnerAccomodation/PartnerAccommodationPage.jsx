import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccommodationsByPartnerIdWithMainPhoto, deleteAccommodation } from '../../api/accommodationAPI';
import { usePartner } from '../../context/PartnerContext'; 
import { ACCOMMODATION_PHOTO_ENDPOINTS } from '../../config';
import { Loader2, Building } from 'lucide-react'; // 🌟 로딩 아이콘 추가

export default function PartnerAccommodationsPage({ showModal }) {
  const navigate = useNavigate();
  const {switchAccommodation, refreshPartnerData } = usePartner(); 
  
  const [accommodations, setAccommodations] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 목록 로딩용
  
  // 🌟 [추가] 액션(상세, 수정, 삭제) 처리 중 상태 (중복 클릭 방지용)
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  const [page, setPage] = useState(0);       
  const [totalPages, setTotalPages] = useState(0);
  
  const partnerId = localStorage.getItem('partnerId');
  const pageSize = 10; 

  // ... (loadAccommodations 및 useEffect는 기존과 동일) ...
  const loadAccommodations = async (pageNumber) => {
    setIsLoading(true);
    try {
      const response = await getAccommodationsByPartnerIdWithMainPhoto(partnerId, pageNumber, pageSize);
      setAccommodations(response.content); 
      setTotalPages(response.totalPages);
      setPage(response.number);
    } catch (e) {
      console.error("목록 불러오기 오류:", e);
      if (showModal) showModal('데이터 오류', '목록을 불러오는데 실패했습니다.', null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!partnerId) return;
    loadAccommodations(0);
  }, [partnerId]);

  // 🌟 [수정] 수정 페이지 이동 핸들러
  const handleEditAccommodation = async (accommodation) => {
    if (isActionProcessing) return; // 이미 처리 중이면 무시
    setIsActionProcessing(true);    // 로딩 시작 (화면 잠금)
    
    try {
        await switchAccommodation(accommodation); 
        navigate(`/partner/accommodations/${accommodation.accommodationId}/edit`);
        // 페이지 이동 시에는 finally에서 false로 돌리지 않아도 됨 (컴포넌트 언마운트됨)
    } catch (error) {
        console.error("이동 실패:", error);
        setIsActionProcessing(false); // 실패 시에만 잠금 해제
    }
  };
  
  // 🌟 [수정] 상세 페이지 이동 핸들러
  const handleManageAccommodation = async (accommodation) => {
      if (isActionProcessing) return;
      setIsActionProcessing(true);

      try {
        await switchAccommodation(accommodation);
        navigate(`/partner/accommodations/${accommodation.accommodationId}`);
      } catch (error) {
        console.error("이동 실패:", error);
        setIsActionProcessing(false);
      }
  };

  // 🌟 [수정] 삭제 핸들러 (API 호출 포함)
  const handleDeleteAccommodation = async (accommodationId) => {
    if (isActionProcessing) return;

    if (window.confirm('정말 이 숙소를 삭제하시겠습니까?')) {
        setIsActionProcessing(true); // 로딩 시작
        try {
            await deleteAccommodation(accommodationId);
            await refreshPartnerData(); 
            // 삭제 후 목록 새로고침 시 페이지 유지 또는 0페이지로 이동
            await loadAccommodations(page); 
        } catch (e) {
            console.error("삭제 오류:", e);
            alert("삭제에 실패했습니다.");
        } finally {
            setIsActionProcessing(false); // 로딩 종료 (화면 잠금 해제)
        }
    }
  };

  const handleImageManage = (target, type = 'ACCOMMODATION') => {
    // 이미지 관리 페이지 이동도 중복 방지하고 싶다면 동일하게 isActionProcessing 적용 가능
    const isRoom = type === 'ROOM';
    const basePath = isRoom ? 'rooms' : 'accommodations';
    const targetId = isRoom ? target.roomId : target.accommodationId;

    if (target.photos && target.photos.length > 0) {
        navigate(`/partner/${basePath}/photos/${targetId}`);
    } else {
        navigate(`/partner/${basePath}/photos/${targetId}/new`);
    }
  };

  const getAuthBadgeColor = (authStatus) => {
      switch(authStatus) {
          case 'CONFIRM': return 'bg-green-100 text-green-800';
          case 'DECLINED': return 'bg-red-100 text-red-800';
          default: return 'bg-yellow-100 text-yellow-800'; 
      }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 relative"> 
      {/* 🌟 [추가] 전체 화면 로딩 오버레이 (처리 중일 때 클릭 방지) */}
      {isActionProcessing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center animate-in fade-in zoom-in duration-200">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                <p className="text-gray-700 font-medium">처리 중입니다...</p>
            </div>
        </div>
      )}

      {/* ... 상단 헤더 (기존 동일) ... */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">내 숙박 시설 관리</h1>
        <button
          onClick={() => navigate(`/partner/accommodations/new?partnerId=${partnerId}`)}
          // 처리 중일 때 추가 버튼도 비활성화
          disabled={isActionProcessing} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          + 숙박 시설 추가
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full table-auto divide-y divide-gray-200">
            {/* ... 테이블 헤더 (기존 동일) ... */}
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-32">이미지</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">숙박 시설명</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">상태</th> 
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">타입</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">주소</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-32 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                      <span className="text-lg font-medium text-gray-600">숙소 목록을 불러오는 중입니다...</span>
                    </div>
                  </td>
                </tr>
              ) : accommodations.length === 0 ? (
                
                /* 2. 데이터가 없을 때 (예쁜 아이콘과 안내 문구) */
                <tr>
                  <td colSpan="6" className="px-6 py-32 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <Building size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">등록된 숙박 시설이 없습니다.</h3>
                        <p className="mt-2 text-sm text-gray-400">
                            우측 상단의 <span className="text-blue-600 font-bold">'+ 숙박 시설 추가'</span> 버튼을 눌러<br/>
                            파트너님의 첫 숙소를 등록해보세요!
                        </p>
                    </div>
                  </td>
                </tr>

              ) : (
                
                /* 3. 데이터가 있을 때 (기존 리스트 렌더링) */
                accommodations.map((acc) => (
                  <tr key={acc.accommodationId} className="hover:bg-blue-50 transition-colors">
                    {/* ... (기존 td 내용들 그대로 유지) ... */}
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border hover:border-blue-500 transition-colors"
                        onClick={() => !isActionProcessing && handleImageManage(acc, 'ACCOMMODATION')}
                      >
                        {acc.photos && acc.photos.length > 0 ? (
                          <img 
                            src={ACCOMMODATION_PHOTO_ENDPOINTS.PHOTOS.GET_BLOB_DATA(acc.photos[0].photoId)} 
                            alt="숙소 대표사진" 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-gray-500 flex flex-col items-center text-sm font-medium">
                            <span className="text-2xl mb-1">➕</span>
                            <span>이미지 등록</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => !isActionProcessing && handleManageAccommodation(acc)}>
                      <div className="text-sm font-semibold text-gray-900">{acc.name}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getAuthBadgeColor(acc.auth)}`}>
                            {acc.auth || 'PENDING'}
                        </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          {acc.accommodationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[150px]">{acc.address}</td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleManageAccommodation(acc)} 
                        disabled={isActionProcessing}
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        상세
                      </button>
                      <button 
                        onClick={() => handleEditAccommodation(acc)} 
                        disabled={isActionProcessing}
                        className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        수정
                      </button>
                      {acc.auth !== 'CONFIRM' && (
                        <button 
                          onClick={() => handleDeleteAccommodation(acc.accommodationId)} 
                          disabled={isActionProcessing}
                          className="px-3 py-1 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          삭제
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* 페이징 영역 (기존 동일) */}
        <div className="p-4 border-t bg-gray-50 flex justify-center items-center gap-4">
          <button disabled={page === 0 || isActionProcessing} onClick={() => loadAccommodations(page - 1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50">이전</button>
          <span className="text-sm font-medium">{page + 1} / {totalPages || 1}</span>
          <button disabled={page >= totalPages - 1 || isActionProcessing} onClick={() => loadAccommodations(page + 1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50">다음</button>
        </div>
      </div>
    </div>
  );
}