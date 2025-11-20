import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPropertiesByPartnerId, deleteProperty } from '../../api/propertyAPI';
import { usePartner } from '../../context/PartnerContext'; 

export default function PartnerPropertiesPage({ showModal }) {
  const navigate = useNavigate();
  
  // [수정] Context에서 refreshPartnerData 가져오기
  const { partnerInfo, switchProperty, refreshPartnerData } = usePartner(); 
  
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);       
  const [hasMore, setHasMore] = useState(true); 
  
  const observerTarget = useRef(null); 
  
  const partnerId = partnerInfo?.partnerId || 1; 
  const pageSize = 10; 

  const loadProperties = async (pageNumber) => {
    if (pageNumber > 0 && (!hasMore || isLoading)) return;

    setIsLoading(true);
    try {
      const response = await getPropertiesByPartnerId(partnerId, pageNumber, pageSize);
      
      const newProperties = response?.content || response || [];
      const isLast = response?.last ?? (newProperties.length < pageSize);

      setProperties(prev => {
        return pageNumber === 0 ? newProperties : [...prev, ...newProperties];
      });
      
      setHasMore(!isLast); 

    } catch (e) {
      console.error("숙박 시설 목록 불러오기 오류:", e);
      if (showModal) showModal('데이터 오류', '목록을 불러오는데 실패했습니다.', null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!partnerId) return;
    setPage(0);
    setHasMore(true);
    setProperties([]); 
    loadProperties(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  useEffect(() => {
    if (page > 0) {
      loadProperties(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prevPage) => prevPage + 1); 
        }
      },
      { threshold: 1.0 } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading]);

  const handleEditProperty = (property) => {
    switchProperty(property); 
    navigate(`/partner/properties/${property.propertyId}/edit`);
  };
  
  const handleManageProperty = (property) => {
      switchProperty(property);
      navigate(`/partner/properties/${property.propertyId}`);
  };

  // [핵심 수정] 삭제 로직
  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('정말 이 숙소를 삭제하시겠습니까?')) {
        try {
            await deleteProperty(propertyId);
            
            // 1. 전역 컨텍스트(헤더, 사이드바) 갱신
            // 숙소가 0개가 되면 currentProperty가 null로 변합니다.
            await refreshPartnerData(); 

            // 2. 현재 보고 있는 로컬 리스트에서도 제거
            setProperties(prev => prev.filter(p => p.propertyId !== propertyId));
            
        } catch (e) {
            console.error("삭제 오류:", e);
            alert("삭제에 실패했습니다.");
        }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">내 숙박 시설 관리</h1>
        <button
          onClick={() => navigate(`/partner/properties/new?partnerId=${partnerId}`)}
          className="btn-primary"
        >
          + 숙박 시설 추가
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">숙박 시설명</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">타입</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">주소</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  등록된 숙박 시설이 없습니다.
                </td>
              </tr>
            ) : (
              properties.map((prop) => (
                <tr key={prop.propertyId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleManageProperty(prop)}>
                    <div className="text-sm font-semibold text-gray-900">{prop.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {prop.propertyType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{prop.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleManageProperty(prop)}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      상세
                    </button>

                    <button
                      onClick={() => handleEditProperty(prop)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(prop.propertyId)}
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
            
        <div ref={observerTarget} className="h-10 flex justify-center items-center w-full">
           {isLoading && <span className="text-gray-500 text-sm">데이터를 불러오는 중...</span>}
        </div>
      </div>
    </div>
  );
}