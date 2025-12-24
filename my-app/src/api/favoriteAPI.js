import axios from "axios";
import { axiosConfig, FAVORITE_ENDPOINTS } from "../config";

const client = axios.create(axiosConfig);

// 찜 추가
export async function addFavorite(userId, accommodationId) {
  // POST 요청인데 body는 null
  // 대신 쿼리스트링으로 ?userId=1&accommodationId=2를 붙이는 방식
  return client.post(FAVORITE_ENDPOINTS.FAVORITES.ADD, null, {
    params: { userId, accommodationId },
  });
}

// 찜 목록 조회 (N+1 제거)
// 백엔드 /favorites/list 가 Favorite + 숙소정보(이름/주소/썸네일/평점/최저가 등)를
//    한 번에 내려준다는 전제에서, 프론트는 추가 호출을 절대 하지 않는다.
export async function getFavorites(userId) {
  const res = await client.get(FAVORITE_ENDPOINTS.FAVORITES.LIST, {
    params: { userId },
  });

  // 이 응답은 곧바로 렌더링에 사용 (추가 GET /partner/accommodations/{id} 호출 없음)
  return res.data ?? [];
}

export async function getFavoriteIdMap(userId) {
  if (!userId) return {};

  try {
    // 상세 정보 조회 없이 찜 목록 테이블만 조회 (가벼운 요청)
    const res = await client.get(FAVORITE_ENDPOINTS.FAVORITES.LIST, {
      params: { userId },
    });
    
    const favorites = res.data ?? [];
    const idMap = {};

    // 배열을 순회하며 Map(객체)으로 변환
    favorites.forEach((fav) => {
      // API 응답 구조에 따라 fav.accommodationId가 ID라고 가정
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
  return client.delete(FAVORITE_ENDPOINTS.FAVORITES.DELETE, {
    params: { userId, accommodationId },
  });
}
