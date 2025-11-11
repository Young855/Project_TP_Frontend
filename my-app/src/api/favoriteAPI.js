import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // 백엔드 주소에 맞게 조정
  withCredentials: true,
});

// 1 내 즐겨찾기 목록 조회
export const getFavorites = async (userId) => {
  try {
    const res = await api.get("/favorites", {
      params: { userId },
    });
    return res.data;
  } catch (err) {
    console.error("즐겨찾기 목록 조회 오류:", err);
    throw err;
  }
};

// 2 즐겨찾기 생성 (찜 추가)
export const addFavorite = async (userId, data) => {
  try {
    const res = await api.post("/favorites", data, {
      params: { userId },
    });
    return res.data;
  } catch (err) {
    console.error("즐겨찾기 생성 오류:", err);
    throw err;
  }
};

// 3 즐겨찾기 삭제 (찜 해제)
export const removeFavorite = async (userId, targetType, targetId) => {
  try {
    const res = await api.delete("/favorites", {
      params: { userId, targetType, targetId },
    });
    return res.data;
  } catch (err) {
    console.error("즐겨찾기 삭제 오류:", err);
    throw err;
  }
};

// 4 즐겨찾기 여부 확인
export const checkFavorite = async (userId, targetType, targetId) => {
  try {
    const res = await api.get("/favorites/check", {
      params: { userId, targetType, targetId },
    });
    return res.data; // true or false
  } catch (err) {
    console.error("즐겨찾기 여부 확인 오류:", err);
    throw err;
  }
};
