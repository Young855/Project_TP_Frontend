export default function AccommodationCard({ 
  data, 
  photoUrl, 
  isFavorite, 
  onToggleFavorite, 
  onClick,
  totalPrice, 
  checkIn, 
  checkOut
}) {
  const p = data;
  return (
    <div
      className="relative bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <button
        type="button"
        onClick={onToggleFavorite}
        className="absolute top-3 right-3 w-9 h-9 rounded-md bg-white border border-gray-300 flex items-center justify-center p-0 leading-none"
        aria-label="찜 토글"
      >
        {isFavorite ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-7 h-7"
            fill="#ff4d4d"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                    2 5.42 4.42 3 7.5 3
                    c1.74 0 3.41.81 4.5 2.09
                    C13.09 3.81 14.76 3 16.5 3
                    19.58 3 22 5.42 22 8.5
                    c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-7 h-7"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733C11.285 4.876 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        )}
      </button>

      <div className="w-full md:w-40 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={p.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-room.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            이미지 없음
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {p.address} {p.city ? `(${p.city})` : ""}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {p.accommodationType}
            {p.checkinTime && p.checkoutTime
              ? ` · 체크인 ${p.checkinTime} / 체크아웃 ${p.checkoutTime}`
              : ""}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {p.ratingAvg != null ? (
              <span className="font-semibold text-yellow-600">
                ★ {p.ratingAvg.toFixed ? p.ratingAvg.toFixed(1) : p.ratingAvg}
              </span>
            ) : (
              <span className="text-gray-400">평점 없음</span>
            )}
          </div>

         <div className="text-right">
            {totalPrice === "예약가능한 객실이 없습니다" ? (
              <span className="text-lg font-bold text-red-600">
                예약가능한 객실이 없습니다
              </span>
            ) : totalPrice ? (
              <>
                <span className="text-lg font-bold text-blue-600">
                  {totalPrice.toLocaleString()}원
                </span>
                <div className="text-xs text-gray-500">
                  {checkIn}~{checkOut} (총액)
                </div>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {(data.minPrice ?? data.price ?? 0).toLocaleString()}원
                </span>
                <span className="text-xs text-gray-500 ml-1">/ 1박</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}