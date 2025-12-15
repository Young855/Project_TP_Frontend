import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom'; // 🌟 [추가] Portal 사용
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Star, GripVertical, Loader2 } from 'lucide-react'; 

import { getAccommodationPhotos, deleteAccommodationPhoto, getAccommodationPhotoBlobUrl, updateAccommodationPhotoList } from '../../api/accommodationPhotoAPI';
import { getRoomPhotos, deleteRoomPhoto, getRoomPhotoBlobUrl, updateRoomPhotoList } from '../../api/roomPhotoAPI';

const PhotoList = ({ type = 'ACCOMMODATION' }) => {
    const params = useParams();
    const navigate = useNavigate();

    const { targetId, api, label, createPath } = useMemo(() => {
        if (type === 'ROOM') {
            return {
                targetId: Number(params.roomId),
                label: '객실',
                createPath: `/partner/rooms/photos/${params.roomId}/new`,
                api: { get: getRoomPhotos, delete: deleteRoomPhoto, update: updateRoomPhotoList, getBlob: getRoomPhotoBlobUrl }
            };
        }
        return {
            targetId: Number(params.accommodationId),
            label: '숙소',
            createPath: `/partner/accommodations/photos/${params.accommodationId}/new`,
            api: { get: getAccommodationPhotos, delete: deleteAccommodationPhoto, update: updateAccommodationPhotoList, getBlob: getAccommodationPhotoBlobUrl }
        };
    }, [type, params]);

    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const loadPhotos = useCallback(async () => {
        if (!targetId) return;
        try {
            setIsLoading(true);
            const data = await api.get(targetId);
            const list = Array.isArray(data) ? data : data.data || [];
            const normalizedList = list.map(item => ({ ...item, photoId: item.photoId || item.imageId }));
            normalizedList.sort((a, b) => a.sortOrder - b.sortOrder);
            setPhotos(normalizedList);
            setIsDirty(false);
        } catch (error) {
            console.error(`${label} 사진 목록 로드 실패:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [targetId, api, label]);

    useEffect(() => { loadPhotos(); }, [loadPhotos]);

    const handleDragStart = (e, position) => { dragItem.current = position; e.dataTransfer.effectAllowed = "move"; };
    const handleDragEnter = (e, position) => { e.preventDefault(); dragOverItem.current = position; };
    const handleDragEnd = (e) => {
        e.preventDefault();
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
        const _photos = [...photos];
        const draggedItemContent = _photos[dragItem.current];
        _photos.splice(dragItem.current, 1);
        _photos.splice(dragOverItem.current, 0, draggedItemContent);
        const reorderedPhotos = _photos.map((item, index) => ({ ...item, sortOrder: index + 1 }));
        setPhotos(reorderedPhotos);
        setIsDirty(true);
        dragItem.current = null; dragOverItem.current = null;
    };

    const handleNameChange = (photoId, newName) => {
        setPhotos(prev => prev.map(p => p.photoId === photoId ? { ...p, fileName: newName } : p));
        setIsDirty(true);
    };

    const handleSetMain = (photoId) => {
        setPhotos(prev => prev.map(p => ({ ...p, isMain: p.photoId === photoId })));
        setIsDirty(true);
    };

    const handleDelete = async (photoId) => {
        if (!window.confirm("정말 이 사진을 삭제하시겠습니까?")) return;
        try {
            await api.delete(photoId);
            setPhotos(prev => {
                const filtered = prev.filter(p => p.photoId !== photoId);
                return filtered.map((item, index) => ({ ...item, sortOrder: index + 1 }));
            });
            setIsDirty(true);
        } catch (error) { console.error(error); alert("삭제에 실패했습니다."); }
    };

    const handleSaveChanges = async () => {
        if (photos.some(p => !p.fileName || !p.fileName.trim())) { alert("모든 사진의 이름을 입력해주세요."); return; }
        
        setIsSaving(true);
        try {
            const payload = photos.map(p => {
                if(type === 'ROOM') {
                    return { imageId: p.photoId, fileName: p.fileName, isMain: p.isMain, sortOrder: p.sortOrder };
                } else {
                    return p;
                }
            });
            await api.update(targetId, payload);
            alert("변경사항이 저장되었습니다.");
            setIsDirty(false);
            loadPhotos();
        } catch (error) { console.error(error); alert("저장 중 오류가 발생했습니다."); }
        finally { setIsSaving(false); }
    };

    const goToAddPage = () => { navigate(createPath); };

    return (
        <div className="container mx-auto p-6 max-w-6xl relative">
            {/* 🌟 [수정] createPortal을 사용하여 body 바로 아래에 렌더링 */}
            {isSaving && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-wait">
                    <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="animate-spin text-blue-600">
                            <Loader2 size={48} strokeWidth={2.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-gray-800">변경사항 저장 중...</p>
                            <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요.</p>
                        </div>
                    </div>
                </div>,
                document.body // Portal Target
            )}

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
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={18} />
                        추가
                    </button>
                </div>
            </div>

            {!isLoading && photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
                    {photos.map((photo, index) => (
                        <div 
                            key={photo.photoId} 
                            draggable={!isSaving}
                            onDragStart={(e) => !isSaving && handleDragStart(e, index)}
                            onDragEnter={(e) => !isSaving && handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} 
                            
                            className={`relative flex flex-col bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-200 
                                ${photo.isMain ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 hover:border-blue-300'}
                                ${isSaving ? 'opacity-70 pointer-events-none' : 'cursor-grab active:cursor-grabbing hover:-translate-y-1'}`} 
                        >
                            <div className="relative aspect-square bg-gray-100 group">
                                <div className="absolute top-2 left-2 z-10 p-1 bg-black/30 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <GripVertical size={16} />
                                </div>
                                <img 
                                    src={photo.imageData ? `data:image/jpeg;base64,${photo.imageData}` : api.getBlob(photo.photoId)} 
                                    className="w-full h-full object-cover pointer-events-none" 
                                    alt="photo"
                                    onError={(e) => { if (!e.target.src.includes("placeholder.png")) e.target.src = "/placeholder.png"; }}
                                />
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">{photo.sortOrder}</div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(photo.photoId); }}
                                    disabled={isSaving}
                                    className="absolute bottom-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-600 z-10 disabled:hidden"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="p-3 flex flex-col gap-2 bg-white">
                                <input 
                                    type="text" 
                                    value={photo.fileName || ''}
                                    onChange={(e) => handleNameChange(photo.photoId, e.target.value)}
                                    disabled={isSaving}
                                    className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
                                />
                                <button
                                    onClick={() => handleSetMain(photo.photoId)}
                                    disabled={isSaving}
                                    className={`w-full py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 transition-all ${photo.isMain ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} disabled:opacity-50`}
                                >
                                    {photo.isMain ? <><Star size={12} fill="white"/> 대표 이미지</> : '대표 설정'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isLoading && <div className="flex justify-center items-center py-20 text-gray-500">로딩 중...</div>}
            {!isLoading && photos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">등록된 이미지가 없습니다.</p>
                    <button onClick={goToAddPage} disabled={isSaving} className="text-blue-600 font-semibold hover:underline">이미지 등록하러 가기</button>
                </div>
            )}
        </div>
    );
};

export default PhotoList;