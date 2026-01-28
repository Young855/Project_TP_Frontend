<<<<<<< HEAD
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
=======
import { useState, useEffect } from "react";
// 🌟 [수정 1] API 함수 변경 (단순 조회 -> 상세/정책 조회)
import { getAccommodationDetail } from "@/api/accommodationAPI"; 

// 🌟 [수정 2] 인자 추가 (날짜와 인원수)
const useAccommodationDetail = (id, checkIn, checkOut, guests) => {
>>>>>>> otherwork
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
<<<<<<< HEAD
    if (!accommodationId) {
      setAccommodation(null);
      setError(null);
      setLoading(false);
      return;
    }
=======
    if (!id) return;
>>>>>>> otherwork

    const fetchData = async () => {
      try {
<<<<<<< HEAD
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
=======
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
>>>>>>> otherwork
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, checkIn, checkOut, guests]); // 🌟 [수정 4] 날짜가 바뀌면 다시 불러오게 설정

  return { accommodation, loading, error };
};

export default useAccommodationDetail;