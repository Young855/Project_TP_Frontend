// src/hooks/useUrlUser.js
import { useSearchParams } from "react-router-dom";

export function useUrlUser(defaultUserId = 1) {
  const [params] = useSearchParams();
  const idParam = params.get("userId");

  // URL에 userId가 없으면 개발용으로 1번 유저라고 가정
  const userId = idParam ? Number(idParam) : defaultUserId;

  return { userId };
}
