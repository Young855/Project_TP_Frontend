// 탭 바 + 객실보기 버튼
export default function StickyTabs({ activeTab, onClickTab, onClickViewRooms }) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 mt-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2 ${
              activeTab === "overview"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => onClickTab?.("overview")}
          >
            개요
          </button>

          <button
            type="button"
            className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2  ${
              activeTab === "rooms"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => onClickTab?.("rooms")}
          >
            객실
          </button>

          <button
            type="button"
            className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2 ${
              activeTab === "services"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => onClickTab?.("services")}
          >
            서비스
          </button>

          <button
            type="button"
            className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2 ${
              activeTab === "location"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => onClickTab?.("location")}
          >
            위치
          </button>

          <button
            type="button"
            className={`py-4 !border-0 outline-none focus-visible:outline-none border-b-2 ${
              activeTab === "reviews"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => onClickTab?.("reviews")}
          >
            리뷰
          </button>
        </div>

        <button
          type="button"
          onClick={onClickViewRooms}
          className="shrink-0 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg whitespace-nowrap"
        >
          객실보기
        </button>
      </div>
    </div>
  );
}
