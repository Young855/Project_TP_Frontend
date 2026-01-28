import { useState } from "react";

export default function GalleryModal({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  if (!images || images.length === 0) return null;

  const handleNext = (e) => { e.stopPropagation(); setCurrent(prev => (prev + 1) % images.length); };
  const handlePrev = (e) => { e.stopPropagation(); setCurrent(prev => (prev - 1 + images.length) % images.length); };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* 닫기 버튼 */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl z-10">&times;</button>
      
      {/* 메인 뷰어 */}
      <div className="flex-1 flex items-center justify-center relative">
        <button onClick={handlePrev} className="absolute left-4 text-white text-4xl p-2 hover:bg-white/10 rounded-full">&#8249;</button>
        
        <div className="max-w-4xl max-h-[80vh]">
            <img 
                src={images[current].url} 
                alt="Gallery" 
                className="max-w-full max-h-[80vh] object-contain"
            />
            <p className="text-center text-white mt-4">{images[current].description} ({current + 1}/{images.length})</p>
        </div>

        <button onClick={handleNext} className="absolute right-4 text-white text-4xl p-2 hover:bg-white/10 rounded-full">&#8250;</button>
      </div>

      {/* 하단 썸네일 리스트 (하나씩 로딩됨) */}
      <div className="h-24 bg-black/80 flex gap-2 overflow-x-auto p-2 items-center justify-center">
         {images.map((img, idx) => (
            <button 
                key={idx} 
                onClick={() => setCurrent(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${idx === current ? 'border-blue-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
            >
                <img src={img.url} alt="thumb" className="w-full h-full object-cover" loading="lazy" />
            </button>
         ))}
      </div>
    </div>
  );
}