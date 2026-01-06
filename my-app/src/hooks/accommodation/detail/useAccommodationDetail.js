// src/hooks/accommodation/detail/useAccommodationDetail.js
import { useEffect, useState } from "react";
import {
  getAccommodation,
  getAccommodationWithAllPhotos,
} from "@/api/accommodationAPI";

/**
 * 숙소 상세(기본정보) 로드
 * - (1) /accommodations/{id}/with-all-photos 먼저 시도
 * - (2) 실패 시 /accommodations/{id} 로 fallback
 *
 * ✅ 유지
 * - loading 초기값 true
 * - abort된 요청은 error로 처리하지 않음
 * - unmount 후 setState 방지
 */
export default function useAccommodationDetail(accommodationId) {
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ 중요: true
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accommodationId) {
      setAccommodation(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getAccommodationWithAllPhotos(accommodationId, {
          signal: controller.signal,
        });

        console.log("detail raw (with-all-photos):", res);

        const payload = res?.data ?? res;
        const next = payload?.data ?? payload ?? null;

        if (mounted) setAccommodation(next);
      } catch (e1) {
        if (controller.signal.aborted) return;

        try {
          const res2 = await getAccommodation(accommodationId, {
            signal: controller.signal,
          });
          console.log("detail raw (fallback):", res2);
          const payload2 = res2?.data ?? res2;
          const next2 = payload2?.data ?? payload2 ?? null;

          if (mounted) setAccommodation(next2);
        } catch (e2) {
          if (controller.signal.aborted) return;
          if (mounted) {
            setError(e2);
            setAccommodation(null);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [accommodationId]);

  return { accommodation, loading, error };
}
