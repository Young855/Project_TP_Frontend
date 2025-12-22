// src/hooks/accommodation/detail/useRoomMainPhoto.js
// rooms 배열을 받아서 roomId -> 대표사진 URL 맵을 만든다.
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

/**
 * rooms를 받아서 roomId -> 대표사진 URL 맵 생성
 * - room.imageUrl / room.mainPhotoUrl 등이 있으면 그대로 사용
 * - 없고 room.mainPhotoId(또는 photoId)가 있으면 blob 받아 objectURL 생성
 *
 * 반환: { [roomId]: imageUrl }
 */
export default function useRoomMainPhoto(rooms = []) {
  const [roomPhotoUrlMap, setRoomPhotoUrlMap] = useState({});
  const createdUrlsRef = useRef([]);

  useEffect(() => {
    const list = Array.isArray(rooms) ? rooms : [];

    // cleanup 기존 objectURL
    createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    createdUrlsRef.current = [];

    if (list.length === 0) {
      setRoomPhotoUrlMap({});
      return;
    }

    const controller = new AbortController();

    const getRoomId = (r) => r?.roomId ?? r?.id ?? null;
    const getDirectUrl = (r) =>
      r?.imageUrl ?? r?.mainPhotoUrl ?? r?.thumbnailUrl ?? r?.photoUrl ?? null;
    const getPhotoId = (r) =>
      r?.mainPhotoId ?? r?.photoId ?? r?.thumbnailPhotoId ?? r?.representPhotoId ?? null;

    (async () => {
      const entries = await Promise.all(
        list.map(async (r) => {
          const roomId = getRoomId(r);
          if (!roomId) return null;

          // (1) 서버가 URL을 이미 내려준 경우
          const direct = getDirectUrl(r);
          if (direct) return [String(roomId), direct];

          // (2) photoId로 blob 받아서 objectURL 생성
          const photoId = getPhotoId(r);
          if (!photoId) return null;

          try {
            const blobRes = await axios.get(
              `${API_BASE}/partner/rooms/photos/${photoId}/data`,
              {
                responseType: "blob",
                signal: controller.signal,
              }
            );
            const objUrl = URL.createObjectURL(blobRes.data);
            createdUrlsRef.current.push(objUrl);
            return [String(roomId), objUrl];
          } catch {
            return null;
          }
        })
      );

      const map = {};
      entries.filter(Boolean).forEach(([k, v]) => {
        map[k] = v;
      });
      setRoomPhotoUrlMap(map);
    })();

    return () => {
      controller.abort();
      createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    };
  }, [
    // rooms가 바뀌는지 판단(방 id 목록 기반)
    JSON.stringify(
      (Array.isArray(rooms) ? rooms : []).map((r) => r?.roomId ?? r?.id ?? "")
    ),
  ]);

  return roomPhotoUrlMap;
}
