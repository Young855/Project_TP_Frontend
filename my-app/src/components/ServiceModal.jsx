// 서비스 모달
export default function ServiceModal({ open, onClose, amenities = [] }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl p-5 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기(X) - 확실히 보이게 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white hover:bg-gray-50 shadow flex items-center justify-center text-gray-700"
          aria-label="닫기"
        >
          ✕
        </button>

        <div className="mb-4 pr-12">
          <h3 className="text-lg font-bold text-gray-900">서비스 및 부대시설</h3>
        </div>

        {Array.isArray(amenities) && amenities.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenities.map((a) => (
              <div
                key={a.amenityId || a.name}
                className="border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50"
              >
                {a.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">등록된 편의시설이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
