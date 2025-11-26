// com/example/tp/view/RoomEdit.jsx (RoomCreate 항목 통합 및 수정 기능 완성)

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
// [추가] deleteRoom 함수를 사용하기 위해 import 목록에 추가
import { getRoom, updateRoom, deleteRoom } from "../../api/roomAPI"; 

const PRESET_BED_TYPES = ['킹사이즈 침대', '퀸사이즈 침대', '더블 침대', '싱글 침대', '이층 침대'];
const PRESET_PACKAGES = ['해당사항 없음', '1인 조식', '2인 조식', '3인 조식', '4인 조식']; // [추가]
const PRESET_POLICIES = ['예약 후 취소 불가', '예약 변경 불가', '환불 불가 규정 적용']; // [추가]

// 🌟 수량 조절 컴포넌트 (Quantity Input Component) - 디자인 통일 및 안정화
const QuantityInput = ({ label, name, value, onChange, min = 0, max = 99 }) => { 
    
    const handleValueChange = useCallback((changeName, changeValue) => {
        onChange({ target: { name: changeName, value: changeValue } });
    }, [onChange]);
    
    const handleDecrement = useCallback(() => {
        if (value > min) {
            handleValueChange(name, Number(value) - 1);
        }
    }, [name, value, handleValueChange, min]);

    const handleIncrement = useCallback(() => {
        if (value < max) {
            handleValueChange(name, Number(value) + 1);
        }
    }, [name, value, handleValueChange, max]);

    const handleChangeInput = (e) => {
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            onChange(e); 
        } else if (e.target.value === '') { 
            onChange(e); 
        }
    };
    
    return (
        <div className="flex-1 min-w-[100px]">
            <label className="block text-sm font-medium text-gray-700 leading-none"> 
                {label}
            </label>
            
            <div className="flex items-end mt-0 !mt-0"> 
                
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="
                        h-12 w-9 {/* 버튼 높이와 너비 조정 */}
                        bg-gray-200 hover:bg-gray-300 
                        text-base font-bold text-gray-800 {/* 폰트 크기 조정 */}
                        transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center 
                        rounded-l-lg border-r border-gray-300 {/* 왼쪽 라운드 및 오른쪽 테두리 */}
                    "
                >
                    -
                </button>

                <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={handleChangeInput}
                    min={min}
                    max={max}
                    className="
                        flex-grow text-center 
                        text-lg font-semibold text-gray-900 {/* 폰트 크기 조정 */}
                        bg-white 
                        h-9 {/* 인풋 필드 높이 조정 */}
                        focus:outline-none 
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none 
                    "
                    aria-label={`${label} 수`}
                />

                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className="
                        h-12 w-9 {/* 버튼 높이와 너비 조정 */}
                        bg-gray-200 hover:bg-gray-300 
                        text-base font-bold text-gray-800 {/* 폰트 크기 조정 */}
                        transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center 
                        rounded-r-lg border-l border-gray-300 {/* 오른쪽 라운드 및 왼쪽 테두리 */}
                    "
                >
                    +
                </button>
            </div>
        </div>
    );
};
// 🌟 수량 조절 컴포넌트 끝

const RoomEdit = () => {
  const params = useParams();
  const { id } = params;
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
    
    // [확장] RoomCreate 항목들
    packageDescription: PRESET_PACKAGES[0], // 기본값으로 시작
    customPackageInput: '', 
    bedTypes: [], 
    customBedType: '', 
    amenities: [],
    policies: [],
    newPolicyItem: '', // 사용자 정의 정책 추가용
    refundable: true,
  });

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- 핸들러 함수들 ---

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

  const handlePackagePresetChange = (preset) => {
    setFormData(prev => ({ 
        ...prev, 
        packageDescription: preset,
        customPackageInput: ''
    }));
  };
  
  const handlePolicyItemToggle = (policyName) => {
    setFormData(prev => {
        const current = prev.policies;
        if (current.includes(policyName)) {
            return { ...prev, policies: current.filter(p => p !== policyName) };
        } else {
            return { ...prev, policies: [...current, policyName] };
        }
    });
  };
  
  const handleRemovePolicyItem = (policyName) => {
    setFormData(prev => ({
        ...prev,
        policies: prev.policies.filter(p => p !== policyName)
    }));
  };
  
  const handleAddNewPolicy = () => {
    const item = formData.newPolicyItem.trim();
    if (item && !formData.policies.includes(item)) {
        setFormData(prev => ({
            ...prev,
            policies: [...prev.policies, item],
            newPolicyItem: '' 
        }));
    } else if (formData.policies.includes(item)) {
        alert("이미 존재하는 항목입니다.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
  
  // --- 데이터 로딩 및 저장 로직 ---

  const load = useCallback(async () => {
    if (!id) {
        setLoading(false);
        setErrMsg("Room ID가 없습니다.");
        return;
    }
    
    try {
      setLoading(true);
      setErrMsg("");
      const data = await getRoom(id); // ⬅️ 기존 데이터 가져오기 (GET)
      
      // 1. 침대 정보 분리
      const roomBedTypes = data?.bedTypes || []; 
      const customBedType = roomBedTypes.filter(type => !PRESET_BED_TYPES.includes(type)).join(', ');
      const presetBedTypes = roomBedTypes.filter(type => PRESET_BED_TYPES.includes(type));
      
      // 2. 패키지 정보 분리
      let pkgDesc = data?.packageDescription || PRESET_PACKAGES[0];
      let customPkg = '';
      if (pkgDesc.startsWith('기타:')) {
        customPkg = pkgDesc.replace('기타:', '').trim();
        pkgDesc = '기타: [입력란]'; 
      }
      
      setFormData({
        propertyId: data?.property?.propertyId ?? data?.propertyId ?? "",
        name: data?.name ?? "",
        standardCapacity: data?.standardCapacity ?? 1, 
        maxCapacity: data?.maxCapacity ?? 1,           
        roomCount: data?.roomCount ?? 0,
        bathroomCount: data?.bathroomCount ?? 0,
        livingRoomCount: data?.livingRoomCount ?? 0,
        areaSquareMeter: data?.areaSquareMeter ?? 0.0,
        
        // [확장 항목 초기화]
        packageDescription: pkgDesc, 
        customPackageInput: customPkg, 
        bedTypes: presetBedTypes, 
        customBedType: customBedType, 
        amenities: data?.amenities ?? [],
        policies: data?.policies ?? [],
        newPolicyItem: '',
        refundable: Boolean(data?.refundable),
      });
      
    } catch (e) {
      console.error(e);
      setErrMsg("기존 객실 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErrMsg(v); return; }

    try {
      setSubmitting(true);
      setErrMsg("");

      // 1. 침대 정보 최종 구성
      const finalBedTypes = [...formData.bedTypes];
      if (formData.customBedType.trim()) {
          formData.customBedType.split(',').forEach(type => {
              if (type.trim()) finalBedTypes.push(type.trim());
          });
      }
      
      // 2. 패키지 정보 최종 구성
      let finalPackageDescription = formData.packageDescription;
      if (finalPackageDescription === '기타: [입력란]' && formData.customPackageInput.trim()) {
          finalPackageDescription = `기타: ${formData.customPackageInput.trim()}`;
      } else if (finalPackageDescription === '기타: [입력란]') {
          finalPackageDescription = '해당사항 없음';
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
        packageDescription: finalPackageDescription, // 최종 구성된 패키지
        
        bedTypes: finalBedTypes,
        amenities: formData.amenities || [],
        policies: formData.policies || [],
        
        refundable: Boolean(formData.refundable),
      };

      await updateRoom(id, body); // ⬅️ 수정 API 호출 (PUT)
      alert("객실이 성공적으로 수정되었습니다.");
      navigate(`/partner/properties/${formData.propertyId}/rooms`); 
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 400) setErrMsg(e?.response?.data?.message || "필드 검증에 실패했습니다.");
      else setErrMsg("객실 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };
  
  // [추가] 객실 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("객실을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
        return;
    }
    try {
        await deleteRoom(id); // ⬅️ 삭제 API 호출 (DELETE)
        alert("객실이 성공적으로 삭제되었습니다.");
        navigate(`/partner/properties/${formData.propertyId}/rooms`); 
    } catch (error) {
        console.error("객실 삭제 실패:", error);
        alert("객실 삭제 중 오류가 발생했습니다.");
    }
  };


  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">객실 수정: {formData.name}</h1>
      {errMsg && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errMsg}</div>}

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        
        <h2 className="text-lg font-semibold border-b pb-2">기본 정보</h2>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="form-label">Property ID</label>
                <input type="number" name="propertyId" className="form-input w-full bg-gray-100 cursor-not-allowed" value={formData.propertyId} readOnly />
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
            
            
            <div>
                <label className="form-label">평수 (m²)</label>
                <input type="number" step="0.1" name="areaSquareMeter" className="form-input w-full" required min={1} value={formData.areaSquareMeter} onChange={handleChange}/>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
            <QuantityInput label="객실 수" name="roomCount" value={formData.roomCount} onChange={handleChange} min={0} />
            <QuantityInput label="욕실 수" name="bathroomCount" value={formData.bathroomCount} onChange={handleChange} min={0} />
            <QuantityInput label="거실 수" name="livingRoomCount" value={formData.livingRoomCount} onChange={handleChange} min={0} />
            <div></div>
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
                            formData.bedTypes.includes(type) ? 'bg-blue-600 text-blue shadow' : 'bg-white text-gray-700 border hover:bg-blue-50'
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
        
        <h2 className="text-lg font-semibold border-b pb-2">추가 패키지 / 상세 설명</h2>
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex flex-wrap gap-2">
                {PRESET_PACKAGES.map(preset => (
                    <button
                        key={preset}
                        type="button"
                        onClick={() => handlePackagePresetChange(preset)}
                        className={`px-3 py-1 text-sm rounded-full transition ${
                            formData.packageDescription === preset ? 'bg-green-600 text-blue shadow' : 'bg-white text-gray-700 border hover:bg-green-50'
                        }`}
                    >
                        {preset}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => handlePackagePresetChange('기타: [입력란]')}
                    className={`px-3 py-1 text-sm rounded-full transition ${
                        formData.packageDescription.startsWith('기타') ? 'bg-green-600 text-blue shadow' : 'bg-white text-gray-700 border hover:bg-green-50'
                    }`}
                >
                    기타: [입력란]
                </button>
            </div>
            {(formData.packageDescription.startsWith('기타') || !PRESET_PACKAGES.includes(formData.packageDescription)) && (
                <div>
                    <label className="form-label mt-3">기타 패키지 상세 내용</label>
                    <input type="text" name="customPackageInput" className="form-input w-full" placeholder="예: 2인 조식 제공 및 웰컴 드링크 포함" value={formData.customPackageInput} onChange={handleChange}/>
                </div>
            )}
        </div>
        <textarea
            name="packageDescriptionDisplay"
            readOnly
            className="form-input w-full h-10 text-gray-500 bg-gray-100 resize-none"
            value={`[현재 설정]: ${formData.packageDescription === '기타: [입력란]' 
                ? (formData.customPackageInput.trim() ? `기타: ${formData.customPackageInput.trim()}` : '기타: 내용 없음') 
                : formData.packageDescription}`}
        />
        
        <h2 className="text-lg font-semibold border-b pb-2">취소 및 추가 정보 (정책)</h2>
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
            
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 pb-3">
                {PRESET_POLICIES.map(policyName => (
                    <div key={policyName} className="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            id={`policy-${policyName.replace(/\s/g, '-')}`}
                            checked={formData.policies.includes(policyName)}
                            onChange={() => handlePolicyItemToggle(policyName)}
                            className="w-4 h-4 text-red-600 rounded"
                        />
                        <label htmlFor={`policy-${policyName.replace(/\s/g, '-')}`} className="text-blue-700 cursor-pointer text-sm">
                            {policyName}
                        </label>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <label className="form-label block font-semibold text-sm">사용자 정의 정책 항목 추가</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        name="newPolicyItem" 
                        className="form-input w-full flex-1" 
                        placeholder="예: 22시 이후 체크인 금지"
                        value={formData.newPolicyItem}
                        onChange={(e) => setFormData(prev => ({...prev, newPolicyItem: e.target.value}))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewPolicy())}
                    />
                    <button type="button" onClick={handleAddNewPolicy} className="btn-secondary-outline px-4 py-2 text-sm">
                        항목 추가
                    </button>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {formData.policies
                        .filter(policy => !PRESET_POLICIES.includes(policy)) 
                        .map(policy => (
                        <span key={policy} className="px-2 py-0.5 rounded-full flex items-center gap-1 bg-purple-100 text-purple-700 border border-purple-300">
                            {policy}
                            <button 
                                type="button" 
                                onClick={() => handleRemovePolicyItem(policy)} 
                                className="text-xs font-bold -my-1 -mr-1 ml-0.5 hover:text-black leading-none"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border">
            <input 
                type="checkbox" name="refundable" id="refundable"
                className="w-5 h-5 text-blue-600 rounded"
                checked={formData.refundable} onChange={handleChange}
            />
            <label htmlFor="refundable" className="text-gray-700 font-medium cursor-pointer">환불 가능 여부</label>
        </div>


        {/* ---------------------------------------------------- */}
        {/* 수정/삭제/취소 버튼 그룹 (가시성 개선) */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            
            {/* 1. 수정 버튼 (PUT 요청) */}
            <button 
                type="submit" 
                disabled={submitting} 
                className="btn-primary px-5 py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
                {submitting ? "수정 중..." : "객실 정보 수정"}
            </button>
            
            {/* 2. 삭제 버튼 (DELETE 요청) */}
            <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition duration-150 font-semibold"
            >
                객실 삭제
            </button>

            {/* 3. 취소 버튼 */}
            <button 
                type="button" 
                onClick={() => navigate(`/partner/properties/rooms`)}
                className="btn-secondary-outline px-5 py-2.5 font-semibold text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg"
            >
                취소
            </button>
        </div>
      </form>
    </div>
  );
};

export default RoomEdit;