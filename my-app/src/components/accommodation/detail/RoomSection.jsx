// 객실 선택 리스트 섹션
// src/pages/accommodation/components/RoomSection.jsx
export default function RoomSection({
  roomsRef,
  roomsTitleRef,

  roomsLoading,
  rooms = [],

  checkIn,
  checkOut,

  roomPhotoUrlMap = {},
  roomPriceMap = {},

  onClickSelectRoom, // (room) => void
}) {
  const hasDates = Boolean(checkIn) && Boolean(checkOut);

  return (
    <section ref={roomsRef} className="mt-4 space-y-4 px-1 scroll-mt-28">
      <h2 ref={roomsTitleRef} className="text-xl font-semibold mb-2 scroll-mt-40">
        객실 선택
      </h2>

      {!hasDates && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
          날짜를 선택하면 예약 가능 여부와 1박 최저가를 확인할 수 있어요.
        </div>
      )}

      {roomsLoading ? (
        <p className="text-sm text-gray-500">객실 정보를 불러오는 중...</p>
      ) : Array.isArray(rooms) && rooms.length > 0 ? (
        rooms.map((room) => {
          const roomId = room?.roomId ?? room?.id;

          const imgUrl =
            roomPhotoUrlMap?.[String(roomId)] ||
            room.imageUrl ||
            room.photoUrl ||
            null;

          // ✅ useRoomPrice 결과(단일 진실)
          const priceInfo = roomPriceMap?.[String(roomId)];

          // ✅ 예약 가능: 가격 정책이 정상 로드되고 조건 충족할 때만 true
          // 날짜 미선택이면 무조건 false(선택 버튼 비활성)
          const isBookable =
            hasDates && priceInfo?.isBookable === true;

          // ✅ 화면 표시 가격: displayPrice (기본: MIN_PER_NIGHT)
          const price = priceInfo?.displayPrice ?? null;

          // ✅ 사유: 없으면 fallback(날짜 선택했는데 정책이 없을 때)
          const reason =
            !hasDates
              ? "날짜를 선택해주세요."
              : priceInfo?.reason ||
                (priceInfo && priceInfo.isBookable === false
                  ? "해당 기간에 예약할 수 없습니다."
                  : "");

          return (
            <div
              key={roomId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4"
            >
              <div className="w-full md:w-56 h-40 bg-gray-100 rounded-lg overflow-hidden">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={room.roomName ?? room.name ?? "객실"}
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
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {room.roomName ?? room.name ?? `객실 #${roomId}`}
                  </h3>

                  {/* ✅ 가격 */}
                  <div className="text-sm text-gray-700">
                    {price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">1박 최저가</span>
                        <span className="font-semibold text-gray-900">
                          {Number(price).toLocaleString()}원
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {hasDates ? "가격 정보 없음" : "날짜 선택 필요"}
                      </span>
                    )}
                  </div>

                  {/* ✅ 예약 불가 사유 */}
                  {!isBookable && reason && (
                    <div className="mt-2 text-xs text-red-600">{reason}</div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onClickSelectRoom?.(room)}
                    disabled={!isBookable}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                      isBookable
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    선택
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-500">등록된 객실 정보가 없습니다.</p>
      )}
    </section>
  );
}
