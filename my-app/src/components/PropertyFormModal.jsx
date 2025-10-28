import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal'; // App.jsx가 사용하는 Modal 컴포넌트 경로

export default function PropertyFormModal({ isOpen, onClose, onSave, property }) {
  const [formData, setFormData] = useState({
    name: '',
    propertyType: 'HOTEL',
    address: '',
    description: '',
  });

  useEffect(() => {
    // 수정 모드일 경우, 기존 데이터 채우기
    if (property) {
      setFormData({
        name: property.name || '',
        propertyType: property.propertyType || 'HOTEL',
        address: property.address || '',
        description: property.description || '',
      });
    } else {
      // 추가 모드일 경우, 폼 리셋
      setFormData({
        name: '',
        propertyType: 'HOTEL',
        address: '',
        description: '',
      });
    }
  }, [property, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...property, ...formData }); // property가 null이 아니면 propertyId가 포함됨
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property ? '숙소 정보 수정' : '새 숙소 추가'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="form-label">숙소명</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label htmlFor="propertyType" className="form-label">숙소 유형</label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="form-input"
          >
            <option value="HOTEL">호텔</option>
            <option value="MOTEL">모텔</option>
            <option value="PENSION">펜션</option>
            <option value="RESORT">리조트</option>
            <option value="GUESTHOUSE">게스트하우스</option>
          </select>
        </div>
        <div>
          <label htmlFor="address" className="form-label">주소</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="form-label">숙소 설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            rows="4"
          ></textarea>
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