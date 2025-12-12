// src/components/AccommodationCard.jsx
export default function AccommodationCard({
  item,
  isFavorite,
  onToggleFavorite,
}) {
  const {
    name,
    address,
    thumbnailUrl,
    reviewScore,
    reviewCount,
    minPriceLabel, // 예: "가격 정보 없음" or "1박 최저가 120,000원"
  } = item;

  return (
    <div className="flex gap-4 p-4 border-b hover:bg-gray-50">
      {/* 썸네일 영역 */}
      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* 텍스트 + 하트 */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
            <p className="mt-1 text-sm text-gray-500">{address}</p>

            {reviewScore != null && (
              <div className="mt-2 flex items-center text-sm text-gray-700">
                <span className="mr-1">★</span>
                <span className="font-medium mr-1">{reviewScore}</span>
                {reviewCount != null && (
                  <span className="text-gray-400">({reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* 우상단 하트 */}
          <button
            type="button"
            onClick={onToggleFavorite}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
          >
            {/* isFavorite 값에 따라 색/아이콘 변경 */}
            <span
              className={
                "text-xl leading-none " +
                (isFavorite ? "text-red-500" : "text-gray-300")
              }
            >
              ❤
            </span>
          </button>
        </div>

        {/* 가격 */}
        <div className="mt-4 flex justify-end items-center text-sm text-gray-700">
          {minPriceLabel}
        </div>
      </div>
    </div>
  );
}
