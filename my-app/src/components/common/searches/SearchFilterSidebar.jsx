import PriceRangeSlider from "../PriceRangeSlider";
import {
  ACCOMMODATION_TYPE_OPTIONS,
  HASHTAG_OPTIONS,
  COMMON_FACILITY_OPTIONS,
  ROOM_FACILITY_OPTIONS,
  MIN_PRICE, MAX_PRICE, PRICE_STEP
} from "../../../constants/SearchOption.js";

export default function SearchFilterSidebar({
  excludeSoldOut, setExcludeSoldOut,
  selectedType, setSelectedType,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  selectedTags, setSelectedTags,
  selectedCommonFacilities, setSelectedCommonFacilities,
  selectedRoomFacilities, setSelectedRoomFacilities,
  toggleInSet,
  resetFilters
}) {
  return (
    <aside className="w-64 bg-white rounded-xl shadow-sm p-4 h-fit sticky top-20 hidden md:block">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">필터</h2>
        <button
          onClick={resetFilters}
          className="px-2 py-1 test-sm text-gray-600 rounded-md hover:bg-gray-100 transition"
        >
          초기화
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm mb-4">
        <input
          type="checkbox"
          checked={excludeSoldOut}
          onChange={(e) => setExcludeSoldOut(e.target.checked)}
        />
        <span>매진 숙소 제외</span>
      </label>

      <div className="border-t pt-3 mt-3">
        <h3 className="text-sm font-semibold mb-2">숙소 유형</h3>
        <div className="space-y-1 text-sm">
          {ACCOMMODATION_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="accommodationType"
                value={opt.value}
                checked={selectedType === opt.value}
                onChange={() => setSelectedType(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <h3 className="text-sm font-semibold mb-2">가격 (1박 기준)</h3>
        <PriceRangeSlider
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          minValue={minPrice}
          maxValue={maxPrice}
          onChange={(newMin, newMax) => {
            setMinPrice(newMin);
            setMaxPrice(newMax);
          }}
        />
        <div className="mt-2 text-xs text-gray-600">
          {minPrice.toLocaleString()}원 ~ {maxPrice.toLocaleString()}원
          {maxPrice === MAX_PRICE ? " 이상" : ""}
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <h3 className="text-sm font-semibold mb-2">#취향</h3>
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {HASHTAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleInSet(setSelectedTags, tag)}
              className={`px-2 py-1 rounded-full text-xs border ${
                selectedTags.has(tag)
                  ? "bg-blue-50 text-blue-600 border-blue-600"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-3 mt-3 space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-1">공용 시설</h3>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {COMMON_FACILITY_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleInSet(setSelectedCommonFacilities, f)}
                className={`px-2 py-1 rounded-full text-xs border ${
                  selectedCommonFacilities.has(f)
                    ? "bg-blue-50 text-blue-600 border-blue-600"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-1">객실 내 시설</h3>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {ROOM_FACILITY_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleInSet(setSelectedRoomFacilities, f)}
                className={`px-2 py-1 rounded-full text-xs border ${
                  selectedRoomFacilities.has(f)
                    ? "bg-blue-50 text-blue-600 border-blue-600"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}