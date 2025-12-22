// src/hooks/accommodation/detail/useFavorite.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { addFavorite, removeFavorite, getFavorites } from "@/api/favoriteAPI";
// ↑ 경로가 다르면 아래처럼 바꿔라
// import { addFavorite, removeFavorite, getFavorites } from "../../../api/favoriteAPI";

export default function useFavorite({ userId, accommodationId }) {
  const numericUserId = useMemo(() => Number(userId), [userId]);
  const numericId = useMemo(() => Number(accommodationId), [accommodationId]);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // 1) 최초 진입/ID 변경 시: 서버에서 찜 여부 동기화
  useEffect(() => {
    if (!Number.isFinite(numericUserId) || !Number.isFinite(numericId)) return;

    let alive = true;

    (async () => {
      try {
        setFavLoading(true);
        const list = await getFavorites(numericUserId);

        const exists = (list ?? []).some((f) => {
          const aid = Number(f?.accommodationId);
          return Number.isFinite(aid) && aid === numericId;
        });

        if (alive) setIsFavorite(exists);
      } catch (err) {
        console.error("[useFavorite] getFavorites 실패:", err);
      } finally {
        if (alive) setFavLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [numericUserId, numericId]);

  // 2) 토글: 서버에 add/remove 요청을 반드시 보냄
  const toggleFavorite = useCallback(async () => {
    if (!Number.isFinite(numericUserId)) {
      throw new Error("userId가 없어서 찜을 처리할 수 없습니다.");
    }
    if (!Number.isFinite(numericId)) {
      throw new Error("accommodationId가 올바르지 않습니다.");
    }

    setFavLoading(true);

    // 현재 상태 기준으로 add/remove
    const currently = isFavorite;

    try {
      if (!currently) {
        await addFavorite(numericUserId, numericId);
        setIsFavorite(true);
        return { action: "add", isFavorite: true };
      } else {
        await removeFavorite(numericUserId, numericId);
        setIsFavorite(false);
        return { action: "remove", isFavorite: false };
      }
    } finally {
      setFavLoading(false);
    }
  }, [numericUserId, numericId, isFavorite]);

  return {
    isFavorite,
    favLoading,
    toggleFavorite,
    numericId,
  };
}
