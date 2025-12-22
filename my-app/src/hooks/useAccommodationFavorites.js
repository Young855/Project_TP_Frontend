import { useState, useEffect } from "react";
import { addFavorite, getFavorites, removeFavorite } from "../api/favoriteAPI";

export function useAccommodationFavorites(userId) {
  const [favoriteMap, setFavoriteMap] = useState({});

  useEffect(() => {
    const uid = Number(userId);
    if (!Number.isFinite(uid)) {
      console.warn("[찜] userId 파싱 실패:", userId);
      return;
    }

    (async () => {
      try {
        const list = await getFavorites(uid);
        const nextMap = {};
        (list ?? []).forEach((fav) => {
          const aid = Number(fav?.accommodationId);
          if (Number.isFinite(aid)) nextMap[aid] = true;
        });
        setFavoriteMap(nextMap);
      } catch (err) {
        console.error("찜 목록 불러오기 실패:", err);
      }
    })();
  }, [userId]);

  const toggleFavorite = async (e, accommodationId) => {
    e.preventDefault();
    e.stopPropagation();

    const uid = Number(userId);
    const aid = Number(accommodationId);

    if (!Number.isFinite(uid)) {
      alert("userId가 없어서 찜을 처리할 수 없습니다. (?userId=1 확인)");
      return;
    }
    if (!Number.isFinite(aid)) return;

    const currentlyFavorite = !!favoriteMap[aid];

    // 1. Optimistic Update (UI 선반영)
    setFavoriteMap((prev) => ({
      ...prev,
      [aid]: !currentlyFavorite,
    }));

    try {
      // 2. API 호출
      if (!currentlyFavorite) {
        await addFavorite(uid, aid);
        alert("찜 목록에 추가 되었습니다.");
      } else {
        await removeFavorite(uid, aid);
        alert("찜 목록에서 삭제 되었습니다.");
      }

      // 3. 서버 동기화
      try {
        const list = await getFavorites(uid);
        const nextMap = {};
        (list ?? []).forEach((fav) => {
          const fid = Number(fav?.accommodationId);
          if (Number.isFinite(fid)) nextMap[fid] = true;
        });
        setFavoriteMap(nextMap);
      } catch (syncErr) {
        // 동기화 실패는 무시(토글 UX 유지)
      }
    } catch (error) {
      console.error("찜 토글 실패:", error);
      alert("찜 실패");

      // 실패 시 롤백
      setFavoriteMap((prev) => ({
        ...prev,
        [aid]: currentlyFavorite,
      }));
    }
  };

  return { favoriteMap, toggleFavorite };
}