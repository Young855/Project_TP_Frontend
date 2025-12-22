import { useEffect } from "react";

export default function GalleryModal({
  open,
  images = [],
  currentIndex = 0,
  onClose,
  onPrev,
  onNext,
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 메인 이미지 */}
        <img
          src={images[currentIndex]}
          alt=""
          className="w-full max-h-[65vh] object-contain rounded-xl mx-auto"
        />

        {/* 좌우 버튼 */}
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 w-10 h-10 rounded-full"
        >
          ‹
        </button>
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 w-10 h-10 rounded-full"
        >
          ›
        </button>

        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white w-10 h-10 rounded-full"
        >
          ✕
        </button>

        {/* 하단 썸네일 */}
        <div className="mt-4 flex gap-2 overflow-x-auto justify-center">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => onNext(i)}
              className={`h-16 w-24 object-cover rounded cursor-pointer border
                ${i === currentIndex ? "border-blue-500" : "border-transparent"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
