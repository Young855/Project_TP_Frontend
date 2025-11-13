import React, { useState, useEffect } from 'react';
import { getAllAmenities } from '../api/amenityAPI';


const AmenitySelector = ({ selectedIds, onChange }) => {
  const [allAmenities, setAllAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const data = await getAllAmenities();
        setAllAmenities(data);
      } catch (err) {
        setError('편의시설 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchAmenities();
  }, []);

  if (loading) return <div className="text-gray-500">편의시설 목록 로딩 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <label className="form-label">편의시설</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg">
        {allAmenities.map((amenity) => (
          <label 
            key={amenity.amenityId} 
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
              checked={selectedIds.has(amenity.amenityId)}
              onChange={() => onChange(amenity.amenityId)}
            />
            <span className="text-gray-700">{amenity.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default AmenitySelector;