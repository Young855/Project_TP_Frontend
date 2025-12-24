// src/hooks/accommodation/detail/useRoom.js
// 특정 숙소(accommodationId)의 객실 목록을 불러오는 훅
// ✅ AccommodationRoomDetail.jsx에서 `const { rooms, roomsLoading } = useRoom(id);` 형태로 사용됨

import { useEffect, useState } from "react";
import { getRoomsByAccommodation, getRoomByAccommodationIDWithMainPhoto } from "@/api/roomAPI";

/**
 * @param {string|number} accommodationId
 * @param {{ withMainPhoto?: boolean, page?: number, size?: number }} [options]
 */
export default function useRoom(accommodationId, options = {}) {
  const { withMainPhoto = true, page = 0, size = 50 } = options;

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);

  useEffect(() => {
    if (!accommodationId) {
      setRooms([]);
      setRoomsLoading(false);
      setRoomsError(null);
      return;
    }

    let alive = true;

    (async () => {
      try {
        setRoomsLoading(true);
        setRoomsError(null);

        // 1) 메인사진까지 포함한 엔드포인트가 있으면 우선 사용
        //    (응답이 페이징일 수도 있어서 content 처리)
        const res = withMainPhoto
          ? await getRoomByAccommodationIDWithMainPhoto(accommodationId, page, size)
          : await getRoomsByAccommodation(accommodationId);

        if (!alive) return;

        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.content)
          ? res.content
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setRooms(list);
      } catch (e) {
        if (!alive) return;
        setRooms([]);
        setRoomsError(e);
        console.error("[useRoom] fetch failed:", e);
      } finally {
        if (!alive) return;
        setRoomsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [accommodationId, withMainPhoto, page, size]);

  return { rooms, roomsLoading, roomsError };
}
