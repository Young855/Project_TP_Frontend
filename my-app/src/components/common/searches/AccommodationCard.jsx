import { useState, useEffect } from "react";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

export default function AccommodationCard({
  data,
  photoUrl,
  isFavorite,
  onToggleFavorite,
  onClick,
  totalPrice,
  checkIn,
  checkOut,
}) {
  const [imgSrc, setImgSrc] = useState(photoUrl);

  useEffect(() => {
    setImgSrc(photoUrl);
  }, [photoUrl]);

  const handleImgError = () => {
    setImgSrc("/assets/default_hotel.png");
  };

  const formatPrice = (price) => {
    // 🌟 [수정] 문자열이 그대로 넘어오면 그냥 반환
    if (typeof price === "string") return price;
    return typeof price === "number"
      ? `${price.toLocaleString()}원`
      : price;
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col sm:flex-row bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer h-auto sm:h-48"
    >
      {/* [좌측] 이미지 영역 */}
      <div className="w-full sm:w-1/3 md:w-56 h-48 sm:h-full bg-gray-100 relative shrink-0">
        <img
          src={imgSrc || "/assets/default_hotel.png"}
          alt={data.name}
          onError={handleImgError}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* [우측] 정보 영역 */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        
        {/* 상단: 이름 및 찜 버튼 */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {data.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {data.address}
            </p>
          </div>
          
          <button
            onClick={onToggleFavorite}
            className="text-2xl p-1 hover:scale-110 transition-transform focus:outline-none"
          >
            {isFavorite ? (
              <FaHeart className="text-red-500 drop-shadow-sm" />
            ) : (
              <FaRegHeart className="text-gray-300 hover:text-gray-400" />
            )}
          </button>
        </div>

        {/* 중단: 평점 및 기타 정보 */}
        <div className="mt-2 flex items-center text-sm">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="font-semibold text-gray-800">
            {data.ratingAvg ? Number(data.ratingAvg).toFixed(1) : "0.0"}
          </span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-500 text-xs truncate">
            {data.accommodationType} • 체크인 {data.checkinTime?.substring(0, 5)}
          </span>
        </div>

        {/* 하단: 가격 정보 */}
        <div className="mt-4 flex flex-col items-end justify-end pt-3 border-t border-gray-100 sm:border-none sm:pt-0">
          {/* 🌟 [수정] 예약 불가 상태 처리 */}
          {totalPrice === "예약 가능한 방이 없습니다" ? (
             <span className="text-sm font-bold text-gray-400">
                예약 가능한 방이 없습니다
             </span>
          ) : (
            <>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(totalPrice)}
              </span>
              {checkIn && checkOut && (
                <span className="text-xs text-gray-400 mt-1">
                  {checkIn} ~ {checkOut} (총액)
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}