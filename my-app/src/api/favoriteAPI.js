import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 주소
  withCredentials: true,
});

// 1. 내 즐겨찾기 목록 조회  -> GET /favorites/list
export const getFavorites = async (userId) => {
  try {
    const res = await api.get("/favorites/list", {
      params: { userId },
    });
    return res.data;
  } catch (err) {
    console.error("즐겨찾기 목록 조회 오류:", err);
    throw err;
  }
};

// 2. 즐겨찾기 생성 (찜 추가) -> POST /favorites/create
export const addFavorite = async (userId, data) => {
  try {
    const res = await api.post("/favorites/create", data, {
      params: { userId },
    });
    return res.data;
  } catch (err) {
    console.error("즐겨찾기 생성 오류:", err);
    throw err;
  }
};

// 3. 즐겨찾기 삭제 (찜 해제) -> DELETE /favorites/delete
export const removeFavorite = async (userId, targetType, targetId) => {
  try {
    const res = await api.delete("/favorites/delete", {
      params: { userId, targetType, targetId },
    });
    return res.data;
  } catch (err) {
    console.error("즐겨찾기 삭제 오류:", err);
    throw err;
  }
};

// 4. 즐겨찾기 여부 확인 -> GET /favorites/detail (컨트롤러 이름이 detail임)
export const checkFavorite = async (userId, targetType, targetId) => {
  try {
    const res = await api.get("/favorites/detail", {
      params: { userId, targetType, targetId },
    });
    return res.data; // true or false
  } catch (err) {
    console.error("즐겨찾기 여부 확인 오류:", err);
    throw err;
  }
};
