import React, { useState, useEffect } from 'react';
import PropertyFormModal from '../../components/PropertyFormModal'; // 숙소 추가/수정 모달
import RoomManagementModal from '../../components/RoomManagementModal'; // 객실 관리 모달

// --- Mock API Functions ---
// 실제로는 API를 호출해야 합니다.
const fetchPropertiesByPartner = async (partnerId) => {
  // 가짜 데이터 (파트너 ID 1에 속한 숙소)
  return [
    { propertyId: 1, partnerId: 1, name: '서울 신라 호텔', propertyType: 'HOTEL', address: '서울 중구 동호로 249', 
      rooms: [
        { roomId: 101, propertyId: 1, name: '디럭스 룸', capacity: 2, stock: 10, pricePerNight: 300000, refundable: true },
        { roomId: 102, propertyId: 1, name: '스위트 룸', capacity: 4, stock: 3, pricePerNight: 550000, refundable: true },
      ]
    },
    { propertyId: 2, partnerId: 1, name: '제주 신화월드', propertyType: 'RESORT', address: '제주 서귀포시 안덕면', 
      rooms: [
        { roomId: 201, propertyId: 2, name: '슈페리어 킹', capacity: 2, stock: 20, pricePerNight: 250000, refundable: false },
      ]
    },
  ];
};

const savePropertyAPI = async (propertyData) => {
  console.log("Saving property:", propertyData);
  if (propertyData.propertyId) {
    // Update
    return { ...propertyData };
  } else {
    // Create
    return { ...propertyData, propertyId: Date.now(), rooms: [] }; // 새 ID (임시)
  }
};

const deletePropertyAPI = async (propertyId) => {
  console.log("Deleting property:", propertyId);
  return true; // 성공 가정
};
// --- End Mock API Functions ---


// (아이콘 SVG: 편의를 위해 내부에 정의)
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.96 7.96a2 2 0 01-1.414.586H5.5a1 1 0 01-1-1v-2.5a2 2 0 01.586-1.414l7.96-7.96z" />
    <path fillRule="evenodd" d="M15 5l-2.086-2.086a2 2 0 00-2.828 0L3 10.086V14h3.914l7.086-7.086a2 2 0 000-2.828L15 5z" clipRule="evenodd" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 3a1 1 0 00-1 1v1H4a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V7h1a1 1 0 100-2h-1V4a1 1 0 00-1-1H6zm2 4v7h2V7H8zm4 0v7h2V7h-2z" clipRule="evenodd" />
  </svg>
);

const RoomIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
</svg>
);


export default function PartnerPropertiesPage({ partnerUser, showModal }) {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 모달 상태
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  
  // 편집/관리 대상이 되는 숙소
  const [selectedProperty, setSelectedProperty] = useState(null);

  // 파트너 ID (실제로는 partnerUser에서 가져와야 함)
  const partnerId = 1; // R004: 현재 로그인한 파트너의 ID (가정)

  useEffect(() => {
    // R004: 파트너가 자신의 숙소 목록을 조회
    const loadProperties = async () => {
      setIsLoading(true);
      const data = await fetchPropertiesByPartner(partnerId);
      setProperties(data);
      setIsLoading(false);
    };
    loadProperties();
  }, [partnerId]);

  // 숙소 추가/수정 모달 열기
  const handleOpenPropertyModal = (property = null) => {
    setSelectedProperty(property); // null이면 '추가', 객체면 '수정'
    setIsPropertyModalOpen(true);
  };

  // 객실 관리 모달 열기
  const handleOpenRoomModal = (property) => {
    setSelectedProperty(property);
    setIsRoomModalOpen(true);
  };

  // 모달 닫기 공통
  const handleCloseModals = () => {
    setIsPropertyModalOpen(false);
    setIsRoomModalOpen(false);
    setSelectedProperty(null);
  };

  // 숙소 저장 (추가/수정)
  const handleSaveProperty = async (propertyData) => {
    const savedProperty = await savePropertyAPI({ ...propertyData, partnerId });
    if (selectedProperty) {
      // 수정
      setProperties(properties.map(p => p.propertyId === savedProperty.propertyId ? savedProperty : p));
    } else {
      // 추가
      setProperties([...properties, savedProperty]);
    }
    handleCloseModals();
  };

  // 숙소 삭제
  const handleDeleteProperty = (propertyId) => {
    // R010 (확인 팝업) 재사용
    showModal('숙소 삭제', '정말 이 숙소를 삭제하시겠습니까? 객실 정보도 모두 삭제됩니다.', async () => {
      const success = await deletePropertyAPI(propertyId);
      if (success) {
        setProperties(properties.filter(p => p.propertyId !== propertyId));
      } else {
        // 실패 시 에러 모달 (showModal 사용)
        showModal('삭제 실패', '숙소 삭제에 실패했습니다.');
      }
    });
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
        {/* 'btn-primary' 클래스 사용 */}
        <button
          onClick={() => handleOpenPropertyModal(null)}
          className="btn-primary"
        >
          + 새 숙소 추가
        </button>
      </div>

      {/* 숙소 목록 테이블 */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-100">
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
                    {/* 'filter-chip' 클래스 활용 */}
                    <span className="filter-chip text-xs">{prop.propertyType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{prop.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">{prop.rooms?.length || 0}개</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* 'btn-secondary-outline' 클래스 활용 */}
                    <button 
                      onClick={() => handleOpenRoomModal(prop)}
                      className="btn-primary-outline text-xs px-3 py-1"
                    >
                      <RoomIcon /> 객실 관리
                    </button>
                    <button 
                      onClick={() => handleOpenPropertyModal(prop)}
                      className="btn-secondary-outline text-xs px-3 py-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <EditIcon />
                    </button>
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

      {/* 숙소 추가/수정 모달 */}
      <PropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveProperty}
        property={selectedProperty}
      />
      
      {/* 객실 관리 모달 */}
      {selectedProperty && (
         <RoomManagementModal
            isOpen={isRoomModalOpen}
            onClose={handleCloseModals}
            property={selectedProperty}
            showGlobalModal={showModal} // App.jsx의 showModal 전달
            onRoomsUpdated={onRoomsUpdated} // 객실 변경 시 부모 상태 업데이트
         />
      )}
    </div>
  );
}