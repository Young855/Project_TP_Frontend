// com/example/tp/view/RoomEdit.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoom, updateRoom } from "../../api/roomAPI";

const PRESET_BED_TYPES = ['킹사이즈 침대', '퀸사이즈 침대', '더블 침대', '싱글 침대', '이층 침대'];

// 🌟 수량 조절 컴포넌트 (Quantity Input Component)
const QuantityInput = ({ label, name, value, onChange, min = 0 }) => {
    const handleDecrement = useCallback(() => {
        if (value > min) {
            onChange({ target: { name, value: Number(value) - 1 } });
        }
    }, [name, value, onChange, min]);

    const handleIncrement = useCallback(() => {
        onChange({ target: { name, value: Number(value) + 1 } });
    }, [name, value, onChange]);

    return (
        <div>
            <label className="form-label">{label}</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition duration-150 border-r"
                    style={{ width: '40px', height: '40px' }}
                >
                    -
                </button>
                <input
                    type="number"
                    name={name}
                    className="form-input text-center flex-grow border-0 focus:ring-0"
                    required
                    min={min}
                    value={value}
                    onChange={(e) => onChange(e)} // 직접 입력도 허용
                    style={{ height: '40px' }}
                />
                <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-2 bg-gray-100 hover:bg-gray-200 transition duration-150 border-l"
                    style={{ width: '40px', height: '40px' }}
                >
                    +
                </button>
            </div>
        </div>
    );
};
// 🌟 수량 조절 컴포넌트 끝

const RoomEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    propertyId: "",
    name: "",
    standardCapacity: 1, 
    maxCapacity: 1,      
    roomCount: 0,
    bathroomCount: 0,
    livingRoomCount: 0,
    areaSquareMeter: 0.0,
    packageDescription: "",
    bedTypes: [], 
    customBedType: "", 
    amenities: [],
    policies: [],
    refundable: true,
  });

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleBedTypeChange = (type) => {
    setFormData(prev => {
        const current = prev.bedTypes;
        if (current.includes(type)) {
            return { ...prev, bedTypes: current.filter(t => t !== type) };
        } else {
            return { ...prev, bedTypes: [...current, type] };
        }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Number 필드는 숫자로 변환
    const finalValue = ['standardCapacity', 'maxCapacity', 'roomCount', 'bathroomCount', 'livingRoomCount', 'areaSquareMeter'].includes(name) 
                            ? Number(value) : (type === 'checkbox' ? checked : value);

    setFormData(prev => ({
        ...prev,
        [name]: finalValue
    }));
  };

  const validate = () => {
    const { propertyId, name, standardCapacity, maxCapacity, roomCount, areaSquareMeter } = formData;
    const n = name.trim();
    if (!propertyId || Number(propertyId) <= 0) return "Property ID를 올바르게 입력하세요.";
    if (!n) return "객실명을 입력하세요.";
    if (Number(standardCapacity) < 1 || Number(maxCapacity) < 1) return "기준/최대 인원은 1 이상이어야 합니다.";
    if (Number(roomCount) < 0) return "객실 수는 0 이상이어야 합니다.";
    if (Number(areaSquareMeter) <= 0) return "평수를 입력하세요.";
    return "";
  };

  const load = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getRoom(id);
      
      const customBedType = data.bedTypes 
            ? data.bedTypes.filter(type => !PRESET_BED_TYPES.includes(type)).join(', ') 
            : '';
      const presetBedTypes = data.bedTypes 
            ? data.bedTypes.filter(type => PRESET_BED_TYPES.includes(type)) 
            : [];
            
      setFormData({
        propertyId: data?.property?.propertyId ?? data?.propertyId ?? "",
        name: data?.name ?? "",
        standardCapacity: data?.standardCapacity ?? 1, 
        maxCapacity: data?.maxCapacity ?? 1,           
        roomCount: data?.roomCount ?? 0,
        bathroomCount: data?.bathroomCount ?? 0,
        livingRoomCount: data?.livingRoomCount ?? 0,
        areaSquareMeter: data?.areaSquareMeter ?? 0.0,
        packageDescription: data?.packageDescription ?? "",
        amenities: data?.amenities ?? [],
        policies: data?.policies ?? [],
        
        bedTypes: presetBedTypes, 
        customBedType: customBedType, 
        
        refundable: Boolean(data?.refundable),
      });
      
    } catch (e) {
      console.error(e);
      setErrMsg("기존 객실 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      const finalBedTypes = [...formData.bedTypes];
      if (formData.customBedType.trim()) {
          formData.customBedType.split(',').forEach(type => {
              if (type.trim()) finalBedTypes.push(type.trim());
          });
      }

      const body = {
        propertyId: Number(formData.propertyId),
        name: formData.name.trim(),
        standardCapacity: Number(formData.standardCapacity),
        maxCapacity: Number(formData.maxCapacity),
        
        roomCount: Number(formData.roomCount),
        bathroomCount: Number(formData.bathroomCount),
        livingRoomCount: Number(formData.livingRoomCount),
        areaSquareMeter: Number(formData.areaSquareMeter),
        packageDescription: formData.packageDescription.trim(),
        
        bedTypes: finalBedTypes,
        amenities: formData.amenities,
        policies: formData.policies,
        
        refundable: Boolean(formData.refundable),
      };

      await updateRoom(id, body);
      navigate(`/rooms/${id}`);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("객실 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">객실 수정</h1>
      {errMsg && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errMsg}</div>}

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        
        <h2 className="text-lg font-semibold border-b pb-2">기본 정보</h2>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="form-label">Property ID</label>
                <input type="number" name="propertyId" className="form-input w-full" value={formData.propertyId} onChange={handleChange} required />
            </div>
            <div>
                <label className="form-label">객실 이름 (Type)</label>
                <input type="text" name="name" className="form-input w-full" value={formData.name} onChange={handleChange} maxLength={255} required />
            </div>
        </div>

        <h2 className="text-lg font-semibold border-b pb-2">객실 정보 (필수)</h2>
        <div className="grid grid-cols-4 gap-4">
            <div>
                <label className="form-label">기준 인원</label>
                <input type="number" name="standardCapacity" className="form-input w-full" required min={1} value={formData.standardCapacity} onChange={handleChange}/>
            </div>
            <div>
                <label className="form-label">최대 인원</label>
                <input type="number" name="maxCapacity" className="form-input w-full" required min={1} value={formData.maxCapacity} onChange={handleChange}/>
            </div>
            
            {/* 🌟 객실 수량 조절 컴포넌트 적용 */}
            <QuantityInput label="객실 수" name="roomCount" value={formData.roomCount} onChange={handleChange} min={0} />
            
            <div>
                <label className="form-label">평수 (m²)</label>
                <input type="number" step="0.1" name="areaSquareMeter" className="form-input w-full" required min={1} value={formData.areaSquareMeter} onChange={handleChange}/>
            </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
            {/* 🌟 욕실 수량 조절 컴포넌트 적용 */}
            <QuantityInput label="욕실 수" name="bathroomCount" value={formData.bathroomCount} onChange={handleChange} min={0} />
            
            {/* 🌟 거실 수량 조절 컴포넌트 적용 */}
            <QuantityInput label="거실 수" name="livingRoomCount" value={formData.livingRoomCount} onChange={handleChange} min={0} />
        </div>

        <h2 className="text-lg font-semibold border-b pb-2">침대 정보 (복수 선택 및 사용자 정의)</h2>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex flex-wrap gap-2">
                {PRESET_BED_TYPES.map(type => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => handleBedTypeChange(type)}
                        className={`px-3 py-1 text-sm rounded-full transition ${
                            formData.bedTypes.includes(type) ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border hover:bg-blue-50'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <div>
                <label className="form-label mt-3">기타 침대 정보 (직접 입력)</label>
                <input 
                    type="text" name="customBedType" 
                    className="form-input w-full" 
                    placeholder="예: 간이침대, 온돌 매트"
                    value={formData.customBedType}
                    onChange={handleChange}
                />
            </div>
        </div>

        <h2 className="text-lg font-semibold border-b pb-2">추가/정책 정보</h2>
        <div>
            <label className="form-label">패키지 상세 설명 (조식, 특전 등)</label>
            <textarea
                name="packageDescription"
                className="form-input w-full h-20"
                placeholder="예: 1인 조식 포함, 레이트 체크아웃 제공"
                value={formData.packageDescription}
                onChange={handleChange}
            />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border">
            <input 
                type="checkbox" name="refundable" id="refundable"
                className="w-5 h-5 text-blue-600 rounded"
                checked={formData.refundable} onChange={handleChange}
            />
            <label htmlFor="refundable" className="text-gray-700 font-medium cursor-pointer">환불 가능 여부</label>
        </div>


        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "수정 중..." : "수정"}</button>
          <button type="button" onClick={() => navigate(`/rooms/${id}`)} className="btn-secondary-outline">상세</button>
        </div>
      </form>
    </div>
  );
};

export default RoomEdit;