import axios from "axios";
import { ACCOMMODATIONS_ENDPOINTS, axiosConfig, FAVORITE_ENDPOINTS } from "../config";


const client = axios.create(axiosConfig);

// 🔹 찜 추가
export async function addFavorite(userId, accommodationId) {
  return client.post(FAVORITE_ENDPOINTS.FAVORITES.ADD, null, {
    params: { userId, accommodationId }, 
  });
}

// 🔹 찜 목록 조회 + 숙소 상세 정보까지 합치기
export async function getFavorites(userId) {
  // 1) 먼저 찜 목록(Favorite 엔티티 리스트)만 가져온다
  const res = await client.get(FAVORITE_ENDPOINTS.FAVORITES.LIST, {
    params: { userId },
  });
  const favorites = res.data ?? [];

  if (favorites.length === 0) return [];

  // 2) 찜에 포함된 accommodationId 들만 추출(중복 제거)
  const accommodationIds = [
    ...new Set(
      favorites
        .map((f) => f.accommodationId)
        .filter((id) => id != null)
    ),
  ];

  // 3) 각 accommodationId 별로 숙소 상세 API 호출
  const detailPromises = accommodationIds.map((id) => 
  client
    .get(ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.GET(id))
    .then((r) => r.data)
    .catch((e) => {
      console.error("숙소 상세 조회 실패:", id, e);
      return null;
    })
  );

  const detailList = await Promise.all(detailPromises);

  // 4) accommodationId -> 숙소 상세정보 매핑
  const detailMap = {};
  detailList.forEach((acc, index) => {
    const id = accommodationIds[index];
    if (acc) {
      detailMap[id] = acc;
    }
  });

  // 5) Favorite + 숙소정보 merge 해서 반환
  const merged = favorites.map((fav) => {
    const acc = detailMap[fav.accommodationId];

    return {
      ...fav,
      accommodationName:
        acc?.accommodationName || acc?.name || acc?.title || null,
      address: acc?.address || acc?.fullAddress || null,
      thumbnailUrl:
        acc?.thumbnailUrl || acc?.mainPhotoUrl || acc?.imageUrl || null,
      reviewScore: acc?.reviewScore || acc?.ratingAvg|| null,
      reviewCount: acc?.reviewCount || acc?.reviewCnt || null,
      minPrice: acc?.minPrice || acc?.lowestPrice || null,
    };
  });

  return merged;
}



// 🔹 찜 삭제
export async function removeFavorite(userId, accommodationId) {
  return client.delete(FAVORITE_ENDPOINTS.FAVORITES.DELETE, {
    params: { userId, accommodationId },
  });
}
