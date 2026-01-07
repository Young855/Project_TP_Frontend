import { useState, useEffect } from "react";
// 🌟 [수정 1] API 함수 변경 (단순 조회 -> 상세/정책 조회)
import { getAccommodationDetail } from "@/api/accommodationAPI"; 

// 🌟 [수정 2] 인자 추가 (날짜와 인원수)
const useAccommodationDetail = (id, checkIn, checkOut, guests) => {
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
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
        setLoading(false);
      }
    };

    fetchData();
  }, [id, checkIn, checkOut, guests]); // 🌟 [수정 4] 날짜가 바뀌면 다시 불러오게 설정

  return { accommodation, loading, error };
};

export default useAccommodationDetail;