// src/components/accommodation/detail/RoomSection.jsx
// 객실 선택 리스트 섹션

import { useEffect } from "react";
import { getRoomPhotos } from "@/api/roomPhotoAPI";
import { prepareBooking } from "../../../api/bookingAPI";

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
          날짜를 선택하면 예약 가능 여부와 가격을 확인할 수 있어요.
        </div>
      )}

      {roomsLoading ? (
        <p className="text-sm text-gray-500">객실 정보를 불러오는 중...</p>
      ) : Array.isArray(rooms) && rooms.length > 0 ? (
        rooms.map((room) => {
          const roomId = room?.roomId ?? room?.id;

          const imgUrl =
            roomPhotoUrlMap?.[String(roomId)] ||
            room?.imageUrl ||
            room?.mainPhotoUrl ||
            room?.thumbnailUrl ||
            room?.photoUrl ||
            null;

          const priceInfo = roomPriceMap?.[String(roomId)];
          const isBookable = hasDates && priceInfo?.isBookable === true;
          const price = priceInfo?.displayPrice ?? null;
          const reason = hasDates ? priceInfo?.reason || "" : "";

          return (
            <div
              key={roomId}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4"
            >
              {/* 사진 */}
              <div className="w-full md:w-56 h-40 bg-gray-100 rounded-lg overflow-hidden">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={room?.roomName ?? room?.name ?? "객실"}
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

              {/* 오른쪽 영역 */}
              <div className="flex-1 flex flex-col min-h-[160px]">
                {/* 상단: 객실명 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {room?.roomName ?? room?.name ?? `객실 #${roomId}`}
                  </h3>
                </div>

                {/* 하단: 가격 + 사유 + 버튼 */}
                <div className="mt-auto flex items-end justify-between gap-4">
                  <div>
                    <div className="text-gray-900">
                      {price != null ? (
                        <span className="text-lg font-bold">
                          {Number(price).toLocaleString()}원
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {hasDates ? "가격 정보 없음" : "날짜 선택 필요"}
                        </span>
                      )}
                    </div>

                    {hasDates && reason && (
                      <div className="mt-1 text-xs text-red-600">{reason}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onClickSelectRoom?.(room)}
                    disabled={!isBookable}
                    className={`min-w-[88px] h-11 px-5 text-base font-semibold rounded-lg
                      flex items-center justify-center self-end mb-[2px] ${
                        isBookable
                          ? "bg-blue-600 text-gray-700 hover:bg-blue-500"
                          : "bg-blue-700 border border-gray-300 text-gray-400 cursor-not-allowed"
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
