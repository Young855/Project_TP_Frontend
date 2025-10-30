// 파일: src/pages/property/PartnerPropertiesPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위해 추가
// 💡 [수정] 실제 API 함수 임포트
import { getAllProperties, deleteProperty } from '../../api/propertyAPI'; 
// RoomManagementModal, PropertyFormModal은 모달 방식이 아니라면 제거하거나 주석 처리
import RoomManagementModal from '../../components/RoomManagementModal'; 


// 💡 [제거] Mock API 함수 (fetchPropertiesByPartner, savePropertyAPI, deletePropertyAPI) 제거

// (아이콘 SVG: EditIcon, DeleteIcon, RoomIcon은 그대로 유지)

// ... (아이콘 SVG 함수 유지)


export default function PartnerPropertiesPage({ partnerUser, showModal }) {
  const navigate = useNavigate(); // useNavigate 훅 사용
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 모달 상태 (객실 관리 모달만 유지)
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  
  // 관리 대상 숙소
  const [selectedProperty, setSelectedProperty] = useState(null);

  // 파트너 ID (실제 로그인 사용자 정보에서 가져와야 함. 현재는 Mock 값 1 사용)
  // 💡 Note: 실제 API에서는 파트너 ID로 필터링하는 엔드포인트가 필요할 수 있습니다.
  const partnerId = 1; // R004: 현재 로그인한 파트너의 ID (가정)

  // 💡 [수정] 1. API를 통해 숙소 목록을 불러오는 함수 (DB 연동)
  const loadProperties = async () => {
    setIsLoading(true);
    try {
      // 💡 Mock 대신 실제 getAllProperties 호출
      // 백엔드에서 파트너 ID 필터링을 지원하지 않으면 전체를 불러온 후 필터링해야 함.
      // 여기서는 DB에 접근하는 getAllProperties 호출 후 클라이언트에서 필터링하는 Mock 로직을 유지
      const allData = await getAllProperties(); 
      
      // 파트너 ID로 필터링 (임시)
      const partnerData = Array.isArray(allData) 
        ? allData.filter(p => (p.partnerId === partnerId || p.partner?.partnerId === partnerId)) 
        : [];
      
      setProperties(partnerData);
    } catch (e) {
      console.error("숙소 목록 불러오기 오류:", e);
      showModal('데이터 오류', '숙소 목록을 불러오는 데 실패했습니다.', null);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadProperties();
  }, [partnerId]); // partnerId 변경 시 다시 로드

  // 💡 [추가/수정] 2. 숙소 수정 페이지로 이동
  const handleEditProperty = (propertyId) => {
    // /properties/:id/edit 경로로 이동 (PropertyRouter.jsx에 정의된 경로)
    navigate(`/properties/${propertyId}/edit`); 
  };
  
  // 💡 [수정] 3. 숙소 삭제 (API 연동)
  const handleDeleteProperty = (propertyId) => {
    // R010 (확인 팝업) 재사용
    showModal('숙소 삭제', '정말 이 숙소를 삭제하시겠습니까? 객실 정보도 모두 삭제됩니다.', async () => {
      try {
        // 💡 실제 deleteProperty API 호출
        await deleteProperty(propertyId);
        // 삭제 성공 후 목록 새로고침
        loadProperties(); 
      } catch (e) {
        console.error("숙소 삭제 오류:", e);
        showModal('삭제 실패', e.response?.data?.message || '숙소 삭제에 실패했습니다.');
      }
    });
  };
  
  // 객실 관리 모달 열기
  const handleOpenRoomModal = (property) => {
    setSelectedProperty(property);
    setIsRoomModalOpen(true);
  };

  // 모달 닫기 공통
  const handleCloseModals = () => {
    setIsRoomModalOpen(false);
    setSelectedProperty(null);
    // 객실 관리 후 목록 상태가 최신화되도록 다시 로드할 수도 있음
  };
  
  // 객실 정보가 업데이트되었을 때 (RoomManagementModal에서 호출)
  const onRoomsUpdated = (updatedProperty) => {
     setProperties(properties.map(p => p.propertyId === updatedProperty.propertyId ? updatedProperty : p));
  };


  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">내 숙소 관리</h1>
        {/* 💡 [수정] 새 숙소 추가 버튼: 생성 라우트 경로로 이동 */}
        <button
          onClick={() => navigate("/properties/new")} // PropertyRouter.jsx에 정의된 생성 경로
          className="btn-primary"
        >
          + 새 숙소 추가
        </button>
      </div>

      {/* 숙소 목록 테이블 */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-100">
            {/* ... (테이블 헤더 유지) ... */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">숙소명</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">타입</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">주소</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">객실 수</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  등록된 숙소가 없습니다.
                </td>
              </tr>
            ) : (
              properties.map((prop) => (
                <tr key={prop.propertyId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{prop.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="filter-chip text-xs">{prop.propertyType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{prop.address}</td>
                  {/* Note: 객실 수는 prop.rooms가 로드될 때만 정확함. 현재는 목업 데이터 가정 */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">{prop.rooms?.length || 0}개</td> 
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleOpenRoomModal(prop)}
                      className="btn-primary-outline text-xs px-3 py-1"
                    >
                      <RoomIcon /> 객실 관리
                    </button>
                    {/* 💡 [수정] 수정 버튼: handleEditProperty 호출 */}
                    <button 
                      onClick={() => handleEditProperty(prop.propertyId)}
                      className="btn-secondary-outline text-xs px-3 py-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <EditIcon />
                    </button>
                    {/* 💡 [수정] 삭제 버튼: handleDeleteProperty 호출 */}
                    <button 
                      onClick={() => handleDeleteProperty(prop.propertyId)}
                      className="btn-secondary-outline text-xs px-3 py-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 객실 관리 모달 (유지) */}
      {selectedProperty && (
         <RoomManagementModal
            isOpen={isRoomModalOpen}
            onClose={handleCloseModals}
            property={selectedProperty}
            showGlobalModal={showModal} 
            onRoomsUpdated={onRoomsUpdated}
         />
      )}
    </div>
  );
}