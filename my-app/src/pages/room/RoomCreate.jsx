import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createRoom } from '../../api/roomAPI';
import AmenitySelector from '../../components/AmenitySelector';

const PRESET_BED_TYPES = ['킹사이즈 침대', '퀸사이즈 침대', '더블 침대', '싱글 침대', '이층 침대'];
const PRESET_PACKAGES = ['해당사항 없음', '1인 조식', '2인 조식', '3인 조식', '4인 조식'];
const PRESET_POLICIES = ['예약 후 취소 불가', '예약 변경 불가', '환불 불가 규정 적용'];

const QuantityInput = ({ label, name, value, onChange, min = 0, max = 99 }) => {
    // ... (QuantityInput 코드는 변경 없음, 생략)
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
            <label className="block text-sm font-medium text-gray-700 leading-none">{label}</label>
            <div className="flex items-end mt-0 !mt-0 ">
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="
                        h-12 w-9
                        bg-gray-200 hover:bg-gray-300 
                        text-base font-bold text-gray-800
                        transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center 
                        rounded-l-lg border-r border-gray-300
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
                        text-lg font-semibold text-gray-900
                        bg-white 
                        h-9
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
                        h-12 w-9
                        bg-gray-200 hover:bg-gray-300 
                        text-base font-bold text-gray-800
                        transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center 
                        rounded-r-lg border-l border-gray-300
                    "
                >
                    +
                </button>
            </div>
        </div>
    );
};

const RoomCreate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // [변경] propertyId -> accommodationId
    const accommodationId = searchParams.get('accommodationId');


    const [formData, setFormData] = useState({
        name: '',
        standardCapacity: 2, 
        maxCapacity: 4,      
        
        roomCount: 1, 
        bathroomCount: 1, 
        livingRoomCount: 0, 
        areaSquareMeter: 30.0,
        packageDescription: PRESET_PACKAGES[0], 
        customPackageInput: '', 

        bedTypes: [], 
        customBedType: '', 
        amenities: [], 
        policies: [], 
        
        newPolicyItem: '',
        totalStock: 1, 

        refundable: true
    });

    const handleAmenityChange = (amenityName) => {
        setFormData(prev => {
            const currentList = prev.amenities || [];
            // 이미 있는지 확인 (객체 배열이므로 name 속성 비교)
            const exists = currentList.some(item => item.name === amenityName);
            
            let newList;
            if (exists) {
                // 있으면 제거
                newList = currentList.filter(item => item.name !== amenityName);
            } else {
                // 없으면 추가 (객체 형태로 추가)
                newList = [...currentList, { name: amenityName }];
            }
            
            return { ...prev, amenities: newList };
        });
    };

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
    
    // ... (이벤트 핸들러들 동일, 생략)
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
        const finalValue = ['standardCapacity', 'maxCapacity', 'roomCount', 'bathroomCount', 'livingRoomCount', 'areaSquareMeter', 'totalStock'].includes(name) 
                            ? Number(value) : (type === 'checkbox' ? checked : value);
        
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        // [변경] accommodationId 체크
        if (!accommodationId) {
            alert("숙소 정보가 없습니다.");
            return;
        }

        try {
            const finalBedTypes = [...formData.bedTypes];
            if (formData.customBedType.trim()) {
                formData.customBedType.split(',').forEach(type => {
                    if (type.trim()) finalBedTypes.push(type.trim());
                });
            }
            
            let finalPackageDescription = formData.packageDescription;
            if (finalPackageDescription === '기타: [입력란]' && formData.customPackageInput.trim()) {
                finalPackageDescription = `기타: ${formData.customPackageInput.trim()}`;
            } else if (finalPackageDescription === '기타: [입력란]') {
                finalPackageDescription = '해당사항 없음';
            }

            

            // 3. DTO 구성
            const body = {
                // [변경] propertyId -> accommodationId
                accommodationId: Number(accommodationId),
                name: formData.name,
                standardCapacity: Number(formData.standardCapacity),
                maxCapacity: Number(formData.maxCapacity),
                
                roomCount: Number(formData.roomCount),
                bathroomCount: Number(formData.bathroomCount),
                livingRoomCount: Number(formData.livingRoomCount),
                areaSquareMeter: Number(formData.areaSquareMeter),
                packageDescription: finalPackageDescription,
                
                bedTypes: finalBedTypes.length > 0 ? finalBedTypes : [], 
                amenities: formData.amenities.map(item => item.name),
                policies: formData.policies.length > 0 ? formData.policies : [], 
                
                refundable: Boolean(formData.refundable),
                totalStock: Number(formData.totalStock),
            };

            await createRoom(body);
            
            alert("객실이 성공적으로 생성되었습니다.");
            navigate('/partner/rooms');
        } catch (error) {
            console.error(error);
            alert("객실 생성에 실패했습니다.");
        }
    };

    const amenityNameSet = new Set(formData.amenities.map(a => a.name));

    return (
        // ... (JSX 내부는 변수명이 쓰이지 않아 동일하나, 생략된 부분은 위와 같음)
        <div className="container mx-auto p-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">새 객실 타입 추가</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-lg font-semibold border-b pb-2">기본 정보</h2>
                <div>
                    <label className="form-label">객실 이름 (Type)</label>
                    <input type="text" name="name" className="form-input w-full" placeholder="예: 스탠다드 더블, 디럭스 오션뷰" required onChange={handleChange}/>
                </div>

                {/* 나머지 폼 필드들 (변경사항 없음) */}
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
                <div className="grid grid-cols-4 gap-4"> 
                    <QuantityInput label="객실 수" name="roomCount" value={formData.roomCount} onChange={handleChange} min={0} />
                    <QuantityInput label="욕실 수" name="bathroomCount" value={formData.bathroomCount} onChange={handleChange} min={0} />
                    <QuantityInput label="거실 수" name="livingRoomCount" value={formData.livingRoomCount} onChange={handleChange} min={0} />
                    <QuantityInput label="총 재고량 (Stock)" name="totalStock" value={formData.totalStock} onChange={handleChange} min={1} max={999} />
                </div>

                {/* ... (침대, 패키지, 정책, 환불 여부 등 UI 코드 동일) ... */}
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
                        <input type="text" name="customBedType" className="form-input w-full" placeholder="예: 간이침대, 온돌 매트" value={formData.customBedType} onChange={handleChange}/>
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
                <h2 className="text-lg font-semibold border-b pb-2">취소 및 추가 정보</h2>
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

                

                <AmenitySelector 
                    selectedNames={amenityNameSet}
                    onChange={handleAmenityChange}
                    type="ROOM" 
                />
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border">
                    <input 
                        type="checkbox" name="refundable" id="refundable"
                        className="w-5 h-5 text-blue-600 rounded"
                        checked={formData.refundable} onChange={handleChange}
                    />
                    <label htmlFor="refundable" className="text-gray-700 font-medium cursor-pointer">환불 가능 여부</label>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <button type="submit" className="btn-primary">
                        객실 생성하기
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)} 
                        className="btn-secondary-outline"
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomCreate;