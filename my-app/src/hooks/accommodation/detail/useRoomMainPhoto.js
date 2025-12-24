// src/hooks/accommodation/detail/useRoomMainPhoto.js
// rooms 배열을 받아서 roomId -> 대표사진 URL 맵을 만든다.

// 동작 순서
// 1) room 객체에 imageUrl/mainPhotoUrl 등이 있으면 그대로 사용
// 2) room 객체에 photoId(mainPhotoId 등)가 있으면 /data로 blob 받아 objectURL 생성
// 3) (fallback) roomId로 사진 메타데이터 목록 조회(getRoomPhotos) -> 대표 photoId 선택 -> /data blob

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { getRoomPhotos } from "@/api/roomPhotoAPI";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function useRoomMainPhoto(rooms = []) {
  const [roomPhotoUrlMap, setRoomPhotoUrlMap] = useState({});
  const createdUrlsRef = useRef([]);
  const fetchedRoomIdsRef = useRef(new Set());

  // rooms가 바뀌었는지 감지용 키(불필요한 재호출 방지)
  const roomsKey = useMemo(() => {
    const ids = (Array.isArray(rooms) ? rooms : [])
      .map((r) => r?.roomId ?? r?.id ?? "")
      .filter(Boolean);
      
    return JSON.stringify(ids);
  }, [rooms]);

  useEffect(() => {
    
    const list = Array.isArray(rooms) ? rooms : [];

    // cleanup 기존 objectURL
    createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    createdUrlsRef.current = [];

    if (list.length === 0) {
      setRoomPhotoUrlMap({});
      fetchedRoomIdsRef.current = new Set();
      
      return;
    }

    const controller = new AbortController();

    const getRoomId = (r) => r?.roomId ?? r?.id ?? null;

    const getDirectUrl = (r) =>
      r?.imageUrl ?? r?.mainPhotoUrl ?? r?.thumbnailUrl ?? r?.photoUrl ?? null;

    const getEmbeddedPhotoId = (r) =>
      r?.mainPhotoId ??
      r?.photoId ??
      r?.thumbnailPhotoId ??
      r?.representPhotoId ??
      r?.mainPhoto?.photoId ??
      r?.mainPhoto?.id ??
      null;

    const pickMainPhotoIdFromMetaList = (metaList) => {
      if (!Array.isArray(metaList) || metaList.length === 0) return null;

      const isMain = (p) =>
        p?.isMain === true ||
        p?.isMainPhoto === true ||
        p?.isRepresentative === true ||
        p?.represent === true ||
        p?.main === true;

      const main = metaList.find(isMain);
      const best = main ?? metaList[0];
      return best?.photoId ?? best?.id ?? best?.roomPhotoId ?? null;
    };

    (async () => {
      const entries = await Promise.all(
        list.map(async (r) => {
          const roomId = getRoomId(r);
          if (!roomId) return null;

          // (1) URL이 이미 내려오는 경우
          const direct = getDirectUrl(r);
          if (direct) return [String(roomId), direct];

          // (2) room 객체 안에 photoId가 있으면 바로 blob
          const embeddedPhotoId = getEmbeddedPhotoId(r);
          if (embeddedPhotoId) {
            try {
              const blobRes = await api.get(
                `/partner/rooms/photos/${embeddedPhotoId}/data`,
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
          }

          // (3) fallback: roomId로 메타데이터 목록 조회 -> 대표 photoId -> blob
          if (fetchedRoomIdsRef.current.has(String(roomId))) return null;
          fetchedRoomIdsRef.current.add(String(roomId));

          try {
            const metaList = await getRoomPhotos(roomId);
            const mainPhotoId = pickMainPhotoIdFromMetaList(metaList);
            if (!mainPhotoId) return null;

            const blobRes = await api.get(
              `/partner/rooms/photos/${mainPhotoId}/data`,
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

      setRoomPhotoUrlMap((prev) => ({ ...prev, ...map }));
    })();

    return () => {
      controller.abort();
      createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    };
  }, [roomsKey]);

  return roomPhotoUrlMap;
}
