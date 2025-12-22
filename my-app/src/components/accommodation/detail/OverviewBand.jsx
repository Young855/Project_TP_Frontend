// 숙소명 / 타입 / 찜 + 개요 카드 3개
export default function OverviewBand({ accommodationName, topImages = [], onOpenGallery }) {
  return (
    <div className="mt-4 rounded-2xl overflow-hidden bg-gray-100">
      {/* ✅ 상단 사진 3장(정사각형) 나란히 */}
      <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100">
        {topImages.map((src, idx) => (
          <button
            key={idx}
            type="button"
            className="w-full aspect-square overflow-hidden rounded-xl bg-gray-200"
            onClick={() => onOpenGallery?.(idx)}
            aria-label={`사진 크게 보기 ${idx + 1}`}
          >
            <img
              src={src}
              alt={`${accommodationName} - ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-room.jpg";
              }}
            />
          </button>
        ))}
      </div>

      <div className="h-3 bg-gray-100" />
    </div>
  );
}
