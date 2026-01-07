import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

/**
 * 숙소 상세(기본정보) 로드
 * - (1) /partner/accommodations/{id}/with-all-photos 먼저 시도
 * - (2) 실패 시 /partner/accommodations/{id} 로 fallback
 *
 * ✅ 핵심 수정
 * - loading 초기값 true (처음 렌더에서 '오류 UI' 뜨는 것 방지)
 * - abort된 요청은 error로 처리하지 않음
 * - unmount 후 setState 방지
 */
export default function useAccommodationDetail(accommodationId) {
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ 중요: true
  const [error, setError] = useState(null);

  useEffect(() => {
    // id 없으면 상태 정리
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
        const res = await axios.get(
          `${API_BASE}/accommodations/${accommodationId}/with-all-photos`,
          { signal: controller.signal }
        );
        const next = res.data?.data ?? res.data ?? null;
        if (mounted) setAccommodation(next);
      } catch (e1) {
        if (controller.signal.aborted) return;

        try {
          const res2 = await axios.get(
            `${API_BASE}/accommodations/${accommodationId}`,
            { signal: controller.signal }
          );
          const next2 = res2.data?.data ?? res2.data ?? null;
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
