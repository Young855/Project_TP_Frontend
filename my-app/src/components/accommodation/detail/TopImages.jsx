// 상단 3장 사진
export default function TopImages({ topImages, accommodationName, openGallery }) {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
      <div className="mt-4 rounded-2xl overflow-hidden bg-gray-100">
        <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100">
          {topImages.map((src, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full aspect-square overflow-hidden rounded-xl bg-gray-200"
              onClick={() => openGallery(idx)}
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
    </div>
  );
}
