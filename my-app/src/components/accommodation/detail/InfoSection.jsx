import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaWifi,
  FaParking,
  FaBath,
  FaQuestionCircle,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

function HeartIcon({ active }) {
  if (active) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-7 h-7" fill="#ff4d4d">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                2 5.42 4.42 3 7.5 3
                c1.74 0 3.41.81 4.5 2.09
                C13.09 3.81 14.76 3 16.5 3
                19.58 3 22 5.42 22 8.5
                c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-7 h-7"
      fill="none"
      stroke="#9ca3af"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733C11.285 4.876 9.623 3.75 7.688 3.75 5.099 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}


export default function InfoSection({
  accommodation,
  typeLabel,
  rating,
  reviewCount,

  isFavorite,
  favLoading,
  onToggleFavorite,

  // 카드 클릭 이동
  onGoLocation,
  onGoReviews,

  // 편의시설
  amenities = [],
  amenityIcon,
  onOpenAmenityModal,
}) {
  return (
    <>
      {/* 숙소명 + 타입 + 찜 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {accommodation.name}
            </h1>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border border-gray-200 bg-white text-gray-700">
              {typeLabel}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-1">{accommodation.address}</p>
          {accommodation.city && (
            <p className="text-sm text-gray-500">({accommodation.city})</p>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          disabled={favLoading}
          className="mt-1 bg-white border border-gray-200 rounded-xl w-12 h-12 flex items-center justify-center"
          aria-label="찜"
        >
          <HeartIcon active={!!isFavorite} />
        </button>
      </div>

      {/* 개요 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* 리뷰 */}
        <button
          type="button"
          onClick={onGoReviews}
          className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2 h-full"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-sm font-semibold">
              <FaStar />
              {Number(rating).toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              {Number(reviewCount).toLocaleString()}명 평가
            </span>
          </div>

          {accommodation.shortReview ? (
            <p className="text-sm text-gray-700 line-clamp-2">
              {accommodation.shortReview}
            </p>
          ) : (
            <p className="text-sm text-gray-500">리뷰 요약이 없습니다.</p>
          )}
        </button>

        {/* ✅ 편의시설 (리뷰/위치와 동일한 스타일) */}
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2 h-full">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              <FaQuestionCircle className="text-gray-600" />
              편의시설
            </div>

            <button
              type="button"
              onClick={onOpenAmenityModal}
              className="text-xs text-gray-600 hover:text-gray-900 font-medium"
            >
              전체보기
            </button>
          </div>

          {amenities.length === 0 ? (
            <p className="text-sm text-gray-600">
              등록된 편의시설이 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {amenities.slice(0, 6).map((a) => (
                <div
                  key={a.amenityId || a.name}
                  className="flex items-center gap-2 text-sm text-gray-800"
                >
                  <span>{amenityIcon?.(a.name || "")}</span>
                  <span className="truncate">{a.name}</span>
                </div>
              ))}
            </div>
          )}

          {!amenityIcon && (
            <div className="hidden">
              <FaWifi />
              <FaParking />
              <FaBath />
            </div>
          )}
        </div>

        {/* 위치 */}
        <button
          type="button"
          onClick={onGoLocation}
          className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2 h-full"
        >
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <MdLocationOn className="text-gray-600" />
            위치
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {accommodation.address}
          </p>
        </button>
      </div>
    </>
  );
}
