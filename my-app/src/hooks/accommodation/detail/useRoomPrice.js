// 객실 목록(rooms) + 체크인/체크아웃을 받아서 roomId -> 가격/예약가능 맵을 만든다.

import { useEffect, useMemo, useState } from "react";
import {
  evaluatePoliciesForStay,
  getDailyPoliciesByRoomAndRange,
} from "@/api/dailyRoomPolicyAPI";

/**
 * @param {{ rooms?: any[], checkIn?: string, checkOut?: string }} params
 * @returns {{ [roomId: string]: { displayPrice: number|null, isBookable: boolean, reason: string } }}
 */
export default function useRoomPrice({ rooms = [], checkIn = "", checkOut = "" } = {}) {
  const [roomPriceMap, setRoomPriceMap] = useState({});
  const [loading, setLoading] = useState(false);

  const hasDates = Boolean(checkIn) && Boolean(checkOut);

  const nightsRequired = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  // ✅ 정책은 보통 '숙박하는 날짜들' 기준이므로 endDate는 checkOut-1로 맞춤
  const endDateForPolicy = useMemo(() => {
    if (!checkIn || !checkOut) return "";
    const end = new Date(checkOut);
    end.setDate(end.getDate() - 1);
    return end.toISOString().slice(0, 10);
  }, [checkIn, checkOut]);

  // roomId 목록(의존성 안정화)
  const roomIdsKey = useMemo(() => {
    const ids = (Array.isArray(rooms) ? rooms : [])
      .map((r) => r?.roomId ?? r?.id ?? "")
      .filter(Boolean)
      .map(String)
      .sort();
    return JSON.stringify(ids);
  }, [rooms]);

  useEffect(() => {
    // 날짜 없으면: RoomSection에서 안내 문구를 띄우므로 맵은 비움
    if (!hasDates || nightsRequired === 0) {
      setRoomPriceMap((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      setLoading(false);
      return;
    }

    const list = Array.isArray(rooms) ? rooms : [];
    if (list.length === 0) {
      setRoomPriceMap((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true); // 로딩 시작

    const getRoomId = (r) => r?.roomId ?? r?.id ?? null;

    const toInfo = (displayPrice, isBookable, reason) => ({
      displayPrice: displayPrice ?? null,
      isBookable: Boolean(isBookable),
      reason: reason ?? "",

    });

    (async () => {
      const entries = await Promise.all(
        list.map(async (r) => {
          const roomId = getRoomId(r);
          if (!roomId) return null;

          try {
            // ✅ DailyRoomPolicy API 사용
            // GET /daily-policies/calendar?roomId=&startDate=&endDate=
            const raw = await getDailyPoliciesByRoomAndRange(
              roomId,
              checkIn,
              endDateForPolicy
            );

            // 응답 방어: [{...}] 또는 {data:[...]} 형태
            const policies = raw?.data ?? raw ?? [];

            if (!Array.isArray(policies) || policies.length === 0) {
              return [
                String(roomId),
                toInfo(null, false, "해당 기간의 가격 정책이 없습니다."),
              ];
            }

            // ✅ [추가] 백엔드가 remainingStock 대신 stock(남은재고)을 주므로 키 정규화
            const normalizedPolicies = policies.map((p) => ({
              ...p,
              remainingStock: p?.remainingStock ?? p?.stock, // stock이 남은 재고라면 이게 정답
            }));


            if (!Array.isArray(policies) || policies.length === 0) {
              return [
                String(roomId),
                toInfo(null, false, "해당 기간의 가격 정책이 없습니다."),
              ];
            }
            
              const evaluated = evaluatePoliciesForStay(normalizedPolicies, {
                mode: "MIN_PER_NIGHT",
                nightsRequired,
              });

            // 숙박일수 불일치
            if ((evaluated?.nights ?? 0) !== nightsRequired) {
              return [
                String(roomId),
                toInfo(
                  evaluated?.displayPrice ?? null,
                  false,
                  "해당 기간에 예약할 수 없습니다. "
                ),
              ];
            }
<<<<<<< HEAD
              // ✅ 예약 가능한 경우
              return [
              String(roomId),
              toInfo(
              evaluated?.displayPrice ?? null,
              true,
              ""
              ),
              ];
              
=======

            // 예약 불가
            if (evaluated?.isBookable !== true) {
              return [
                String(roomId),
                toInfo(
                  evaluated?.displayPrice ?? null,
                  false,
                  "해당 기간에 예약할 수 없습니다."
                ),
              ];
            }

            // 예약 가능
            return [
              String(roomId),
              {
                displayPrice: evaluated?.displayPrice ?? null,
                isBookable: true,
                reason: null,
              },
            ];
>>>>>>> otherwork
          } catch (e) {
            return [String(roomId), toInfo(null, false, "다른 날짜 확인")];
          }
        })
      );

      if (!alive) return;

      const next = {};
      entries.filter(Boolean).forEach(([k, v]) => {
        next[k] = v;
      });

      setRoomPriceMap((prev) =>
        JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
      setLoading(false); // 로딩 종료
    })();

    return () => {
      alive = false;
    };
  }, [roomIdsKey, checkIn, endDateForPolicy, hasDates, nightsRequired, rooms]);

  return { roomPriceMap, loading };
}
