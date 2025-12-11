import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Star, GripVertical } from 'lucide-react';

// --- API Imports (숙소용) ---
import { 
    getAccommodationPhotos, 
    deleteAccommodationPhoto, 
    getAccommodationPhotoBlobUrl, 
    updateAccommodationPhotoList 
} from '../../api/accommodationPhotoAPI';

// --- API Imports (객실용) ---
import {
    getRoomPhotos,
    deleteRoomPhoto,
    getRoomPhotoBlobUrl,
    updateRoomPhotoList
} from '../../api/roomPhotoAPI';

const PhotoList = ({ type = 'ACCOMMODATION' }) => {
    // type: 'ACCOMMODATION' | 'ROOM'
    const params = useParams();
    const navigate = useNavigate();

    // 1. 타입에 따른 설정 (Target ID, API 함수, 라우팅 경로)
    const { targetId, api, label, createPath } = useMemo(() => {
        if (type === 'ROOM') {
            return {
                targetId: Number(params.roomId), // :roomId
                label: '객실',
                createPath: `/partner/rooms/photos/${params.roomId}/new`,
                api: {
                    get: getRoomPhotos,
                    delete: deleteRoomPhoto,
                    update: updateRoomPhotoList,
                    getBlob: getRoomPhotoBlobUrl
                }
            };
        }
        // Default: ACCOMMODATION
        return {
            targetId: Number(params.accommodationId), // :accommodationId
            label: '숙소',
            createPath: `/partner/accommodations/photos/${params.accommodationId}/new`,
            api: {
                get: getAccommodationPhotos,
                delete: deleteAccommodationPhoto,
                update: updateAccommodationPhotoList,
                getBlob: getAccommodationPhotoBlobUrl
            }
        };
    }, [type, params]);

    // --- 상태 관리 ---
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // --- Drag & Drop refs ---
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // --- 초기 데이터 로딩 (핵심 수정 부분) ---
    const loadPhotos = useCallback(async () => {
        if (!targetId) return;
        try {
            setIsLoading(true);
            const data = await api.get(targetId); // 동적 API 호출
            const list = Array.isArray(data) ? data : data.data || [];
            
            // [수정] 데이터 정규화: Room(imageId)과 Accommodation(photoId)의 ID 변수명을 photoId로 통일
            // 이렇게 하면 아래의 삭제, 대표설정 로직이 모두 정상 작동합니다.
            const normalizedList = list.map(item => ({
                ...item,
                photoId: item.photoId || item.imageId, // imageId가 있으면 photoId로 매핑
            }));

            // sortOrder 기준 오름차순 정렬
            normalizedList.sort((a, b) => a.sortOrder - b.sortOrder);
            
            setPhotos(normalizedList);
            setIsDirty(false);
        } catch (error) {
            console.error(`${label} 사진 목록 로드 실패:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [targetId, api, label]);

    useEffect(() => {
        loadPhotos();
    }, [loadPhotos]);

    // --- Drag & Drop 핸들러 ---
    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e, position) => {
        e.preventDefault();
        dragOverItem.current = position;
    };

    const handleDragEnd = (e) => {
        e.preventDefault();
        
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }

        const _photos = [...photos];
        const draggedItemContent = _photos[dragItem.current];
        
        // 배열 재배치
        _photos.splice(dragItem.current, 1);
        _photos.splice(dragOverItem.current, 0, draggedItemContent);

        // 순서(sortOrder) 재할당 (1부터 시작)
        const reorderedPhotos = _photos.map((item, index) => ({
            ...item,
            sortOrder: index + 1 
        }));

        setPhotos(reorderedPhotos);
        setIsDirty(true);

        dragItem.current = null;
        dragOverItem.current = null;
    };

    // --- 기타 핸들러 ---

    const handleNameChange = (photoId, newName) => {
        setPhotos(prev => prev.map(p => 
            p.photoId === photoId ? { ...p, fileName: newName } : p
        ));
        setIsDirty(true);
    };

    // [대표 이미지 설정 로직]
    // ID가 정상화(normalization)되었으므로, Room에서도 정확히 하나만 선택됩니다.
    const handleSetMain = (photoId) => {
        setPhotos(prev => prev.map(p => ({
            ...p,
            isMain: p.photoId === photoId // 클릭된 것만 true, 나머지는 false로 강제 설정
        })));
        setIsDirty(true);
    };

    // [삭제 핸들러]
    // ID가 정상화되었으므로 undefined 오류 없이 올바른 ID로 삭제 요청을 보냅니다.
    const handleDelete = async (photoId) => {
        if (!window.confirm("정말 이 사진을 삭제하시겠습니까? (삭제 즉시 반영되며 순서가 재정렬됩니다)")) return;
        try {
            // Room의 경우 photoId 변수에 실제로는 imageId 값이 들어있음 (normalization 덕분)
            // 하지만 백엔드 API 호출 시에는 그냥 ID 값만 넘기면 되므로 그대로 사용
            await api.delete(photoId); 
            
            // 삭제 후 로컬 상태 업데이트 (공백 없이 재정렬)
            setPhotos(prev => {
                const filtered = prev.filter(p => p.photoId !== photoId);
                return filtered.map((item, index) => ({
                    ...item,
                    sortOrder: index + 1 
                }));
            });
            setIsDirty(true); 
        } catch (error) {
            console.error(error);
            alert("삭제에 실패했습니다.");
        }
    };

    const handleSaveChanges = async () => {
        const hasEmptyName = photos.some(p => !p.fileName || !p.fileName.trim());
        if (hasEmptyName) {
            alert("모든 사진의 이름을 입력해주세요.");
            return;
        }

        try {
            setIsSaving(true);
            
            // [중요] 업데이트 시, Room API는 DTO에 imageId를 기대할 수 있음
            // normalized된 데이터를 다시 원래대로(imageId 필드) 매핑해서 보낼 필요가 있는지 확인
            // RoomPhotoDTO가 imageId, photoId 둘 다 받지 않는다면, 
            // 백엔드 DTO 필드명(imageId)에 맞춰서 데이터를 변환해주는 것이 안전함.
            const payload = photos.map(p => {
                if(type === 'ROOM') {
                    return {
                        imageId: p.photoId, // 백엔드는 imageId를 원함
                        fileName: p.fileName,
                        isMain: p.isMain,
                        sortOrder: p.sortOrder
                    };
                } else {
                    return p; // 숙소는 그대로
                }
            });

            await api.update(targetId, payload); 
            
            alert("변경사항(순서, 이름, 대표설정)이 저장되었습니다.");
            setIsDirty(false);
            loadPhotos(); // 서버 데이터와 확실한 동기화
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const goToAddPage = () => {
        navigate(createPath);
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* 상단 헤더 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10 pt-4 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{label} 이미지 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">드래그하여 순서를 변경하고 저장하세요.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleSaveChanges}
                        disabled={!isDirty || isSaving}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow-md transition-all
                            ${isDirty 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Save size={18} />
                        {isSaving ? '저장 중...' : '변경사항 저장'}
                    </button>

                    <button 
                        onClick={goToAddPage}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm"
                    >
                        <Plus size={18} />
                        추가
                    </button>
                </div>
            </div>

            {/* 리스트 영역 */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">로딩 중...</div>
            ) : photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">등록된 이미지가 없습니다.</p>
                    <button onClick={goToAddPage} className="text-blue-600 font-semibold hover:underline">이미지 등록하러 가기</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
                    {photos.map((photo, index) => (
                        <div 
                            key={photo.photoId} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} 
                            
                            className={`relative flex flex-col bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-200 
                                ${photo.isMain ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 hover:border-blue-300'}
                                cursor-grab active:cursor-grabbing hover:-translate-y-1`} 
                        >

                            <div className="relative aspect-square bg-gray-100 group">
                                <div className="absolute top-2 left-2 z-10 p-1 bg-black/30 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <GripVertical size={16} />
                                </div>

                                {/* 이미지 표시: imageData가 있으면 우선 사용, 없으면 Blob API 호출 */}
                                <img 
                                    src={photo.imageData 
                                        ? `data:image/jpeg;base64,${photo.imageData}` 
                                        : api.getBlob(photo.photoId) 
                                    } 
                                    className="w-full h-full object-cover pointer-events-none" 
                                    alt="photo"
                                    onError={(e) => {
                                        const fallbackSrc = "/placeholder.png";
                                        if (!e.target.src.includes("placeholder.png")) {
                                            e.target.src = fallbackSrc;
                                        }
                                    }}
                                />
                                
                                {/* 순서 번호 표시 */}
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                                    {photo.sortOrder}
                                </div>

                                {/* 삭제 버튼 */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleDelete(photo.photoId);
                                    }}
                                    className="absolute bottom-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-600 z-10"
                                    title="삭제"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="p-3 flex flex-col gap-2 bg-white">
                                <div className="space-y-1">
                                    <input 
                                        type="text" 
                                        value={photo.fileName || ''}
                                        onChange={(e) => handleNameChange(photo.photoId, e.target.value)}
                                        className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="이름 입력"
                                        onKeyDown={(e) => e.stopPropagation()} 
                                        onMouseDown={(e) => e.stopPropagation()} 
                                    />
                                </div>

                                <button
                                    onClick={() => handleSetMain(photo.photoId)}
                                    className={`w-full py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all
                                        ${photo.isMain 
                                            ? 'bg-blue-600 text-white shadow-sm' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {photo.isMain ? <><Star size={12} fill="white"/> 대표 이미지</> : '대표 설정'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhotoList;