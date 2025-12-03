import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// [수정] 파일명 및 함수명 변경 가정: propertyAPI -> accommodationAPI
import { getAccommodationsByPartnerIdWithMainPhoto, deleteAccommodation } from '../../api/accommodationAPI';
import { usePartner } from '../../context/PartnerContext'; 

// 컴포넌트 이름 변경: PartnerPropertiesPage -> PartnerAccommodationsPage
export default function PartnerAccommodationsPage({ showModal }) {
  const navigate = useNavigate();
  // Context 함수명 변경 가정: switchProperty -> switchAccommodation
  const { partnerInfo, switchAccommodation, refreshPartnerData } = usePartner(); 
  
  // 상태 변수명 변경: properties -> accommodations
  const [accommodations, setAccommodations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 페이징 관련 상태
  const [page, setPage] = useState(0);       
  const [totalPages, setTotalPages] = useState(0);
  
  const partnerId = partnerInfo?.partnerId || 1; 
  const pageSize = 10; 

  // 데이터 로드 함수명 변경
  const loadAccommodations = async (pageNumber) => {
    setIsLoading(true);
    try {
      // API 호출 함수명 변경
      const response = await getAccommodationsByPartnerIdWithMainPhoto(partnerId, pageNumber, pageSize);
      
      // Page<AccommodationDTO> 응답 처리
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

  // 핸들러 함수명 및 파라미터 변경
  const handleEditAccommodation = (accommodation) => {
    switchAccommodation(accommodation); 
    // URL 경로 변경: properties -> accommodations
    navigate(`/partner/accommodations/${accommodation.accommodationId}/edit`);
  };
  
  const handleManageAccommodation = (accommodation) => {
      switchAccommodation(accommodation);
      navigate(`/partner/accommodations/${accommodation.accommodationId}`);
  };

  const handleDeleteAccommodation = async (accommodationId) => {
    if (window.confirm('정말 이 숙소를 삭제하시겠습니까?')) {
        try {
            await deleteAccommodation(accommodationId);
            await refreshPartnerData(); 
            // 삭제 후 리스트 새로고침
            loadAccommodations(page);
        } catch (e) {
            console.error("삭제 오류:", e);
            alert("삭제에 실패했습니다.");
        }
    }
  };

  // 이미지 관리 핸들러
  const handleImageManage = (accommodationId) => {
    // URL 경로 변경
    navigate(`/partner/accommodations/photos/${accommodationId}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">내 숙박 시설 관리</h1>
        <button
          // URL 경로 변경
          onClick={() => navigate(`/partner/accommodations/new?partnerId=${partnerId}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + 숙박 시설 추가
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-32">이미지</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">숙박 시설명</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">타입</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">주소</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accommodations.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    등록된 숙박 시설이 없습니다.
                  </td>
                </tr>
              ) : (
                accommodations.map((acc) => (
                  <tr 
                      key={acc.accommodationId} 
                      className="hover:bg-blue-50 transition-colors"
                  >
                    {/* 이미지 표시 영역 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border hover:border-blue-500 transition-colors"
                        onClick={() => handleImageManage(acc.accommodationId)}
                      >
                        {acc.photos && acc.photos.length > 0 && acc.photos[0].imageData ? (
                          <img 
                            src={`data:image/jpeg;base64,${acc.photos[0].imageData}`} 
                            alt="숙소 대표사진" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-500 flex flex-col items-center text-sm font-medium">
                            <span className="text-2xl mb-1">➕</span>
                            <span>이미지 등록</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 숙소 정보 및 관리 버튼 */}
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleManageAccommodation(acc)}>
                      <div className="text-sm font-semibold text-gray-900">{acc.name}</div>
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
                        className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => handleEditAccommodation(acc)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteAccommodation(acc.accommodationId)}
                        className="px-3 py-1 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* 페이징 버튼 */}
        <div className="p-4 border-t bg-gray-50 flex justify-center items-center gap-4">
          <button 
              disabled={page === 0}
              onClick={() => loadAccommodations(page - 1)}
              className="px-3 py-1 border rounded bg-white disabled:opacity-50"
          >
              이전
          </button>
          <span className="text-sm font-medium">{page + 1} / {totalPages || 1}</span>
          <button 
              disabled={page >= totalPages - 1}
              onClick={() => loadAccommodations(page + 1)}
              className="px-3 py-1 border rounded bg-white disabled:opacity-50"
          >
              다음
          </button>
        </div>
      </div>
    </div>
  );
}