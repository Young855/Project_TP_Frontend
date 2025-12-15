import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom'; // 🌟 [추가] Portal 사용
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Check, Image as ImageIcon, Lock, Loader2 } from 'lucide-react';

// --- API Imports (숙소용) ---
import { saveAccommodationPhotos, getAccommodationPhotos } from '../../api/accommodationPhotoAPI';

// --- API Imports (객실용) ---
import { saveRoomPhotos, getRoomPhotos } from '../../api/roomPhotoAPI';

const PhotoCreate = ({ type = 'ACCOMMODATION' }) => {
    // type: 'ACCOMMODATION' | 'ROOM'
    const params = useParams();
    const navigate = useNavigate();
    
    const MAX_IMAGES = 10;

    const { targetId, api, label } = useMemo(() => {
        if (type === 'ROOM') {
            return {
                targetId: Number(params.roomId),
                label: '객실',
                api: { get: getRoomPhotos, save: saveRoomPhotos }
            };
        }
        return {
            targetId: Number(params.accommodationId),
            label: '숙소',
            api: { get: getAccommodationPhotos, save: saveAccommodationPhotos }
        };
    }, [type, params]);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const [existingCount, setExistingCount] = useState(0);
    const [hasExistingMain, setHasExistingMain] = useState(false);

    useEffect(() => {
        if (!targetId) return;
        const fetchExistingInfo = async () => {
            try {
                const response = await api.get(targetId);
                const list = Array.isArray(response) ? response : (response.data || []);
                setExistingCount(list.length);
                const mainExists = list.some(photo => photo.isMain === true);
                setHasExistingMain(mainExists);
            } catch (error) {
                console.error("기존 사진 정보를 불러오지 못했습니다.", error);
            }
        };
        fetchExistingInfo();
    }, [targetId, api]);

    const processFiles = useCallback((files) => {
        if (!files || files.length === 0) return;
        const currentTotal = existingCount + selectedFiles.length;
        
        if (currentTotal + files.length > MAX_IMAGES) {
            const available = MAX_IMAGES - currentTotal;
            alert(`사진은 ${label}당 최대 ${MAX_IMAGES}장까지만 등록 가능합니다.\n추가 가능: ${available > 0 ? available : 0}장`);
            return;
        }

        const newFiles = files.map(file => ({
            file, 
            previewUrl: URL.createObjectURL(file),
            fileName: '', 
            isMain: false,
            sortOrder: 0 
        }));

        setSelectedFiles(prev => {
            const updated = [...prev, ...newFiles];
            if (!hasExistingMain && updated.length > 0 && !updated.find(f => f.isMain)) {
                updated[0].isMain = true;
            }
            return updated;
        });
    }, [selectedFiles.length, existingCount, hasExistingMain, label]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
        e.target.value = ''; 
    };

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    const handleRemoveImage = (index) => {
        setSelectedFiles(prev => {
            const newFiles = prev.filter((_, i) => i !== index);
            if (!hasExistingMain && newFiles.length > 0 && !newFiles.find(f => f.isMain)) {
                newFiles[0].isMain = true;
            }
            return newFiles;
        });
    };

    const handleSetMain = (index) => {
        if (hasExistingMain) {
            alert("이미 등록된 대표 이미지가 있습니다.");
            return;
        }
        setSelectedFiles(prev => prev.map((item, i) => ({ ...item, isMain: i === index })));
    };

    const handleNameChange = (index, newName) => {
        setSelectedFiles(prev => prev.map((item, i) => i === index ? { ...item, fileName: newName } : item));
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) { alert("최소 1장의 이미지를 등록해주세요."); return; }
        if (existingCount + selectedFiles.length > MAX_IMAGES) { alert(`사진은 전체 ${MAX_IMAGES}장까지만 가능합니다.`); return; }

        for (let i = 0; i < selectedFiles.length; i++) {
            if (!selectedFiles[i].fileName.trim()) { alert(`${i + 1}번째 사진의 이름을 입력해주세요.`); return; }
        }

        setIsLoading(true);
        try {
            const dtos = await Promise.all(selectedFiles.map(async (item, index) => {
                const base64Data = await convertFileToBase64(item.file);
                const dto = {
                    fileName: item.fileName.trim(), 
                    isMain: item.isMain,            
                    sortOrder: existingCount + index + 1,        
                    imageData: base64Data           
                };
                if (type === 'ROOM') dto.roomId = targetId;
                else dto.accommodationId = targetId;
                return dto;
            }));

            await api.save(targetId, dtos);
            alert("이미지가 성공적으로 등록되었습니다.");
            navigate(-1);

        } catch (error) {
            console.error("업로드 실패:", error);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl relative">
            {/* 🌟 [수정] createPortal을 사용하여 body 바로 아래에 렌더링 (사이드바 덮기용) */}
            {isLoading && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-wait">
                    <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="animate-spin text-blue-600">
                            <Loader2 size={48} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-gray-800">이미지 저장 중...</p>
                            <p className="text-sm text-gray-500 mt-1">파일 크기에 따라 시간이 소요될 수 있습니다.<br/>잠시만 기다려주세요.</p>
                        </div>
                    </div>
                </div>,
                document.body // Portal Target
            )}

            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex items-end gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">{label} 이미지 등록</h1>
                    <span className={`text-sm font-medium ${existingCount + selectedFiles.length >= MAX_IMAGES ? 'text-red-500' : 'text-gray-500'}`}>
                        (기존: {existingCount} + 신규: {selectedFiles.length} / {MAX_IMAGES})
                    </span>
                </div>
                <button onClick={() => navigate(-1)} disabled={isLoading} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">취소</button>
            </div>

            <div className="mb-8">
                <label 
                    htmlFor="file-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
                        ${existingCount + selectedFiles.length >= MAX_IMAGES 
                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                            : isDragging 
                                ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-md' 
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                        <Upload className={`w-10 h-10 mb-3 ${existingCount + selectedFiles.length >= MAX_IMAGES ? 'text-gray-300' : isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                        {existingCount + selectedFiles.length >= MAX_IMAGES ? (
                             <p className="mb-2 text-sm text-red-500 font-bold">이미지 등록 한도({MAX_IMAGES}장)에 도달했습니다.</p>
                        ) : (
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                            </p>
                        )}
                        <p className="text-xs text-gray-400">최대 {MAX_IMAGES}장까지 업로드 가능</p>
                    </div>
                    <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isLoading || existingCount + selectedFiles.length >= MAX_IMAGES} 
                    />
                </label>
            </div>

            {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {selectedFiles.map((item, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200 aspect-square">
                                <img src={item.previewUrl} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => handleRemoveImage(index)} 
                                    disabled={isLoading}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50" 
                                    title="삭제"
                                >
                                    <X size={16} />
                                </button>
                                
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                    <button 
                                        onClick={() => handleSetMain(index)} 
                                        disabled={isLoading || hasExistingMain}
                                        className={`flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded w-full transition-colors 
                                            ${hasExistingMain 
                                                ? 'bg-gray-500/50 text-gray-200 cursor-not-allowed border border-gray-500' 
                                                : item.isMain 
                                                    ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300' 
                                                    : 'bg-white/20 text-white hover:bg-white/40 border border-white/50'
                                            }`}
                                    >
                                        {hasExistingMain ? <><Lock size={12} /> 기존 대표 있음</> : <>{item.isMain ? <Check size={14} /> : <ImageIcon size={14} />}{item.isMain ? '대표 이미지' : '대표 설정'}</>}
                                    </button>
                                </div>
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">No. {index + 1}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">사진 이름 (필수)</label>
                                <input 
                                    type="text" 
                                    value={item.fileName} 
                                    onChange={(e) => handleNameChange(index, e.target.value)} 
                                    disabled={isLoading}
                                    placeholder="예: 침실, 욕실" 
                                    className={`w-full text-sm p-2 border rounded focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 ${!item.fileName.trim() ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-300 focus:ring-blue-200'}`} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end gap-3 mt-8 border-t pt-6">
                <button onClick={() => navigate(-1)} disabled={isLoading} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">취소</button>
                <button 
                    onClick={handleSubmit} 
                    disabled={isLoading || selectedFiles.length === 0} 
                    className={`px-6 py-2.5 rounded-lg text-white font-bold shadow-md transition-all ${isLoading || selectedFiles.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}
                >
                    {isLoading ? '저장 중...' : '이미지 저장하기'}
                </button>
            </div>
        </div>
    );
};

export default PhotoCreate;