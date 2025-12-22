// src/hooks/accommodation/detail/useRoomPrice.js
// 객실 가격 계산 훅 (1박 기준 최저가 / 기간별 가격 대응)
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

/**
 * 🔧 수정 포인트 요약
 * 1. useEffect deps에서 `room` 객체 자체 제거 (매 렌더마다 참조 변경 → 무한 루프 원인)
 * 2. roomId, basePrice 등 원시값만 deps로 사용
 * 3. setState는 항상 동일한 값이면 갱신하지 않도록 안전하게 처리
 */

export default function useRoomPrice(room, checkIn, checkOut) {
  const [priceMap, setPriceMap] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ room 객체에서 deps로 쓰기 안전한 값만 분리
  const roomId = room?.roomId;
  const basePrice = room?.basePrice ?? room?.price ?? room?.defaultPrice ?? 0;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut || nights === 0) {
      // 🔒 동일 값이면 setState 안 함 (불필요 렌더 방지)
      setPriceMap((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/daily-policies/calendar`, {
          params: {
            roomId,
            from: checkIn,
            to: checkOut,
          },
          signal: controller.signal,
        });

        const list = res.data?.data ?? res.data ?? [];
        const map = {};
        list.forEach((p) => {
          if (p?.date && p?.price != null) map[p.date] = p.price;
        });

        setPriceMap((prev) =>
          JSON.stringify(prev) === JSON.stringify(map) ? prev : map
        );
      } catch {
        // 정책 가격 없으면 기본 가격으로 채움
        const map = {};
        for (let i = 0; i < nights; i++) {
          const d = new Date(checkIn);
          d.setDate(d.getDate() + i);
          map[d.toISOString().slice(0, 10)] = basePrice;
        }
        setPriceMap((prev) =>
          JSON.stringify(prev) === JSON.stringify(map) ? prev : map
        );
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();

  }, [roomId, checkIn, checkOut, nights, basePrice]);

  const minPrice = useMemo(() => {
    const vals = Object.values(priceMap);
    if (vals.length === 0) return 0;
    return Math.min(...vals);
  }, [priceMap]);

  return { minPrice, priceMap, loading };
}
