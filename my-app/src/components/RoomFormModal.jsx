import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal'; // App.jsx가 사용하는 Modal

export default function RoomFormModal({ isOpen, onClose, onSave, room }) {
  const [formData, setFormData] = useState({
    name: '',
    capacity: 2,
    stock: 10,
    pricePerNight: 100000,
    refundable: true,
  });

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        capacity: room.capacity || 2,
        stock: room.stock || 0,
        pricePerNight: room.pricePerNight || 0,
        refundable: room.refundable || false,
      });
    } else {
      setFormData({
        name: '',
        capacity: 2,
        stock: 10,
        pricePerNight: 100000,
        refundable: true,
      });
    }
  }, [room, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...room, ...formData });
  };

  return (
    // 이 모달은 z-index가 RoomManagementModal(z-50)보다 높아야 합니다. (예: z-60)
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room ? '객실 정보 수정' : '새 객실 추가'}
      modalClassName="z-60" // Modal 컴포넌트가 className을 받는다고 가정
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="room-name" className="form-label">객실명</label>
          <input
            type="text"
            id="room-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="capacity" className="form-label">수용 인원 (Byte)</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="form-input"
              min="1"
              max="127" // Byte 범위
              required
            />
          </div>
          <div>
            <label htmlFor="stock" className="form-label">객실 재고 (Short)</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="form-input"
              min="0"
              max="32767" // Short 범위
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="pricePerNight" className="form-label">기본 1박 요금 (Integer)</label>
          <input
            type="number"
            id="pricePerNight"
            name="pricePerNight"
            value={formData.pricePerNight}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="1000"
            required
          />
        </div>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="refundable"
              checked={formData.refundable}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="form-label mb-0">환불 가능 여부 (Boolean)</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary-outline">
            취소
          </button>
          <button type="submit" className="btn-primary">
            저장
          </button>
        </div>
      </form>
    </Modal>
  );
}