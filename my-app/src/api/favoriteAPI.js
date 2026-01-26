import {  FAVORITE_ENDPOINTS } from "../config";
// AxiosInstance에서 만든 'api'는 이미 interceptor가 설정된 상태입니다.
import api from "./AxiosInstance"; 

// const client = api.create(axiosConfig);  <-- 이 줄 삭제! (범인)

// 찜 추가
export async function addFavorite(userId, accommodationId) {
  // client 대신 api를 직접 사용하세요
  return api.post(FAVORITE_ENDPOINTS.FAVORITES.ADD, null, {
    params: { userId, accommodationId },
  });
}

// 찜 목록 조회
export async function getFavorites(userId) {
  // 여기도 api 사용
  const res = await api.get(FAVORITE_ENDPOINTS.FAVORITES.LIST, {
    params: { userId },
  });

  return res.data ?? [];
}

export async function getFavoriteIdMap(userId) {
  if (!userId) return {};

  try {
    // 여기도 api 사용
    const res = await api.get(FAVORITE_ENDPOINTS.FAVORITES.LIST, {
      params: { userId },
    });
    
    const favorites = res.data ?? [];
    const idMap = {};

    favorites.forEach((fav) => {
      if (fav.accommodationId) {
        idMap[fav.accommodationId] = true;
      }
    });

    return idMap;
  } catch (error) {
    console.error("찜 목록 ID 조회 실패:", error);
    return {};
  }
}

// 찜 삭제
export async function removeFavorite(userId, accommodationId) {
  // 여기도 api 사용
  return api.delete(FAVORITE_ENDPOINTS.FAVORITES.DELETE, {
    params: { userId, accommodationId },
  });
}