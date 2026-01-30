import { useEffect, useMemo, useState, useCallback } from "react";
import { addFavorite, removeFavorite, getFavorites } from "@/api/favoriteAPI"; 

export default function useFavorite({ userId, accommodationId }) {
  // Number 변환 (null이나 빈 문자열은 0이 됨)
  const numericUserId = useMemo(() => Number(userId), [userId]);
  const numericId = useMemo(() => Number(accommodationId), [accommodationId]);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // 1) 최초 진입/ID 변경 시: 서버에서 찜 여부 동기화
  useEffect(() => {
    // [수정 핵심] userId가 없으면(null, '', undefined) 즉시 종료 (API 호출 X)
    // numericUserId === 0 체크도 추가하여 변환된 0값도 방어
    if (!userId || !Number.isFinite(numericUserId) || numericUserId === 0) {
        setIsFavorite(false); // 비로그인 상태이므로 찜 해제 상태로 둠
        return; 
    }

    if (!Number.isFinite(numericId)) return;

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
  }, [userId, numericUserId, numericId]); // 의존성 배열에 userId 추가

  // 2) 토글: 서버에 add/remove 요청
  const toggleFavorite = useCallback(async () => {
    // 여기도 방어 코드 추가 (혹시 모를 호출 대비)
    if (!userId || !Number.isFinite(numericUserId) || numericUserId === 0) {
      throw new Error("로그인이 필요한 서비스입니다.");
    }
    if (!Number.isFinite(numericId)) {
      throw new Error("accommodationId가 올바르지 않습니다.");
    }

    setFavLoading(true);

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
  }, [userId, numericUserId, numericId, isFavorite]);

  return {
    isFavorite,
    favLoading,
    toggleFavorite,
    numericId,
  };
} 