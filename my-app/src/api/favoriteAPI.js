import axios from "axios";
import { ACCOMMODATIONS_ENDPOINTS, axiosConfig, FAVORITE_ENDPOINTS } from "../config";

const client = axios.create(axiosConfig);

//  찜 추가
export async function addFavorite(userId, accommodationId) {

  // POST 요청인데 body는 null
  // 대신 쿼리스트링으로 ?userId=1&accommodationId=2를 붙이는 방식
  // 백엔드가 @RequestParam Long userId, @RequestParam Long accommodationId로 받는 구조면 된다
  // 백엔드가 @RequestBody로 받도록 짜여있으면 여기서 400/500이 터진다
  // 백엔드 확인
  return client.post(FAVORITE_ENDPOINTS.FAVORITES.ADD, null, {
    params: { userId, accommodationId },
  });
}

// 3. 찜 목록 조회 
export async function getFavorites(userId) {
  // 1) 먼저 찜 목록(Favorite 엔티티 리스트) 가져오고
  const res = await client.get(FAVORITE_ENDPOINTS.FAVORITES.LIST, {
    params: { userId },
  });
  const favorites = res.data ?? [];
  
  if (favorites.length === 0) return [];
  
  // 2) 찜된 accommodationId만 뽑아서
  const accommodationIds = [
    ...new Set(
      favorites
      .map((f) => f.accommodationId)
      .filter((id) => id != null)
    ),
  ];
  
  // 3) 각 숙소 상세 API를 여러 번 추가 호출
  const detailPromises = accommodationIds.map((id) =>
    client
  .get(ACCOMMODATIONS_ENDPOINTS.ACCOMMODATIONS.GET(id))
  .then((r) => r.data)
  .catch((e) => {
    console.error("숙소 상세 조회 실패:", id, e);
    return null;
  })
);
// getFavorite(userId) 한 번 호출하면 favorite/list + accommodations/{id} N번 호출이 함께 일어난다
// 대표사진 추가 이후 문제가 생겼다면 숙소 상사 API(ACCOMMODATIONS GET)가 바뀌면서 여기에 문제가 생겼을 가능성이 있다.

const detailList = await Promise.all(detailPromises);

  // 4) 찜 엔티티 + 숙소 상세 정보를 merge해서 반환
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
      reviewScore: acc?.reviewScore || acc?.ratingAvg || null,
      reviewCount: acc?.reviewCount || acc?.reviewCnt || null,
      minPrice: acc?.minPrice || acc?.lowestPrice || null,
    };
  });

  return merged;
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
// delete도 똑같이 쿼리스트링 방식으로 userId, accommodationId를 보낸다. 
// 백엔드가 @DeleteMapping + @RequestParam이면 OK
// 백엔드가 @DeleteMapping*("/{favoriteId}")같은 PathVariable 방식이면 프론트 요청이 안맞아서 오류난다
export async function removeFavorite(userId, accommodationId) {
  return client.delete(FAVORITE_ENDPOINTS.FAVORITES.DELETE, {
    params: { userId, accommodationId },
  });
}
