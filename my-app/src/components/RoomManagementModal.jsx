import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal'; // App.jsx가 사용하는 Modal
import RoomFormModal from './RoomFormModal'; // 객실 추가/수정 모달

// --- Mock API Functions for Rooms ---
const saveRoomAPI = async (roomData) => {
  console.log("Saving room:", roomData);
  if (roomData.roomId) {
    // Update
    return { ...roomData };
  } else {
    // Create
    return { ...roomData, roomId: Date.now() }; // 새 ID (임시)
  }
};

const deleteRoomAPI = async (roomId) => {
  console.log("Deleting room:", roomId);
  return true; // 성공 가정
};
// --- End Mock API Functions ---

// (아이콘 SVG: PartnerPropertiesPage에서 복사)
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-7.96 7.96a2 2 0 01-1.414.586H5.5a1 1 0 01-1-1v-2.5a2 2 0 01.586-1.414l7.96-7.96z" /><path fillRule="evenodd" d="M15 5l-2.086-2.086a2 2 0 00-2.828 0L3 10.086V14h3.914l7.086-7.086a2 2 0 000-2.828L15 5z" clipRule="evenodd" /></svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 3a1 1 0 00-1 1v1H4a1 1 0 000 2h1v9a2 2 0 002 2h6a2 2 0 002-2V7h1a1 1 0 100-2h-1V4a1 1 0 00-1-1H6zm2 4v7h2V7H8zm4 0v7h2V7h-2z" clipRule="evenodd" /></svg>
);


export default function RoomManagementModal({ isOpen, onClose, property, showGlobalModal, onRoomsUpdated }) {
  const [rooms, setRooms] = useState([]);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (property?.rooms) {
      setRooms(property.rooms);
    } else {
      setRooms([]);
    }
  }, [property]);

  // 객실 추가/수정 모달 열기
  const handleOpenRoomForm = (room = null) => {
    setSelectedRoom(room); // null이면 '추가', 객체면 '수정'
    setIsRoomFormOpen(true);
  };

  // 객실 저장 (추가/수정)
  const handleSaveRoom = async (roomData) => {
    // Room.java에 따라 propertyId를 포함하여 저장
    const savedRoom = await saveRoomAPI({ ...roomData, propertyId: property.propertyId });
    
    let updatedRooms;
    if (selectedRoom) {
      // 수정
      updatedRooms = rooms.map(r => r.roomId === savedRoom.roomId ? savedRoom : r);
    } else {
      // 추가
      updatedRooms = [...rooms, savedRoom];
    }
    setRooms(updatedRooms);
    
    // 부모(PartnerPropertiesPage)의 상태도 업데이트
    onRoomsUpdated({ ...property, rooms: updatedRooms });
    
    setIsRoomFormOpen(false);
    setSelectedRoom(null);
  };

  // 객실 삭제
  const handleDeleteRoom = (roomId) => {
    // App.jsx의 공용 모달 사용
    showGlobalModal('객실 삭제', '정말 이 객실을 삭제하시겠습니까?', async () => {
      const success = await deleteRoomAPI(roomId);
      if (success) {
        const updatedRooms = rooms.filter(r => r.roomId !== roomId);
        setRooms(updatedRooms);
        // 부모(PartnerPropertiesPage)의 상태도 업데이트
        onRoomsUpdated({ ...property, rooms: updatedRooms });
      } else {
        showGlobalModal('삭제 실패', '객실 삭제에 실패했습니다.');
      }
    });
  };
  
  // 이 모달은 App.jsx의 Modal을 직접 사용하지 않고,
  // 더 큰 모달 컨텐츠를 제공하기 위해 커스텀 모달 래퍼를 사용합니다.
  // (App.jsx의 Modal은 단순 알림/확인용으로 보임)
  // 여기서는 App.jsx의 Modal과 동일한 스타일을 사용한다고 가정합니다.
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop (배경) */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 'animate-modal-slide-in' 클래스 사용 */}
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-modal-slide-in">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              객실 관리: <span className="text-blue-600">{property.name}</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>

          {/* Modal Body (Table) */}
          <div className="p-5 overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => handleOpenRoomForm(null)}
                className="btn-primary"
              >
                + 새 객실 추가
              </button>
            </div>
            
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">객실명</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">인원</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">재고</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">1박 요금</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">환불</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                        등록된 객실이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room.roomId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{room.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-700">{room.capacity}명</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-700">{room.stock}개</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-700">{room.pricePerNight.toLocaleString()}원</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                          {room.refundable ? (
                            <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              가능
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              불가
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-1">
                          <button 
                            onClick={() => handleOpenRoomForm(room)}
                            className="btn-secondary-outline text-xs p-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <EditIcon />
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.roomId)}
                            className="btn-secondary-outline text-xs p-1 text-red-600 border-red-600 hover:bg-red-50"
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
          </div>
        </div>
      </div>
      
      {/* 객실 추가/수정 모달 (모달 위 모달) */}
      <RoomFormModal
        isOpen={isRoomFormOpen}
        onClose={() => setIsRoomFormOpen(false)}
        onSave={handleSaveRoom}
        room={selectedRoom}
      />
    </>
  );
}