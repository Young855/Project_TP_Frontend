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
        setLoading(true);
        setError(null);

        // 🌟 [수정 3] 파라미터 전달
        const params = { checkIn, checkOut, guests };

        console.log("📡 [API 요청] 숙소 상세 조회 요청 파라미터:", params);
        const data = await getAccommodationDetail(id, params);

        console.log("📦 [API 응답] 백엔드에서 받은 데이터:", data);
        
        setAccommodation(data);
      } catch (err) {
        console.error("숙소 상세 정보 로딩 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, checkIn, checkOut, guests]); // 🌟 [수정 4] 날짜가 바뀌면 다시 불러오게 설정

  return { accommodation, loading, error };
};

export default useAccommodationDetail;