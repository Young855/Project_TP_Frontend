import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

/**
 * 숙소 사진 로드
 * - 메타데이터: GET /partner/accommodations/photos/list/{accommodationId}
 * - 실제 이미지(blob): GET /partner/accommodations/photos/{photoId}/data
 *
 * ✅ 수정 포인트
 * - abort/unmount 후 setState 방지
 * - abort는 에러로 처리하지 않음
 */
export default function useAccommodationPhoto(accommodationId) {
  const [images, setImages] = useState([]);
  const [topImages, setTopImages] = useState([]);

  // 생성한 objectURL cleanup
  const createdUrlsRef = useRef([]);

  useEffect(() => {
    if (!accommodationId) return;

    const controller = new AbortController();
    let mounted = true;

    // 기존 objectURL 정리
    createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    createdUrlsRef.current = [];

    const getOrder = (p) =>
      p?.orderIndex ?? p?.sortOrder ?? p?.photoOrder ?? p?.seq ?? 0;

    const getPhotoId = (p) => p?.photoId ?? p?.id ?? p?.accommodationPhotoId;

    const getDirectUrl = (p) =>
      p?.imageUrl ?? p?.url ?? p?.photoUrl ?? p?.thumbnailUrl ?? null;

    (async () => {
      try {
        // 1) 메타데이터 목록
        const metaRes = await axios.get(
          `${API_BASE}/partner/accommodations/photos/list/${accommodationId}`,
          { signal: controller.signal }
        );

        const metaList = metaRes.data?.data ?? metaRes.data ?? [];
        const list = Array.isArray(metaList) ? metaList : [];

        // 정렬
        const sorted = [...list].sort((a, b) => getOrder(a) - getOrder(b));

        // 2) 실제 이미지 URL 확보
        const urls = await Promise.all(
          sorted.map(async (p) => {
            // (a) 서버가 직접 URL 주는 경우
            const direct = getDirectUrl(p);
            if (direct) return direct;

            // (b) photoId로 blob 받아 objectURL 생성
            const photoId = getPhotoId(p);
            if (!photoId) return null;

            try {
              const blobRes = await axios.get(
                `${API_BASE}/partner/accommodations/photos/${photoId}/data`,
                { responseType: "blob", signal: controller.signal }
              );
              const objUrl = URL.createObjectURL(blobRes.data);
              createdUrlsRef.current.push(objUrl);
              return objUrl;
            } catch {
              return null;
            }
          })
        );

        if (!mounted || controller.signal.aborted) return;

        const cleaned = urls.filter(Boolean);
        setImages(cleaned);
        setTopImages(cleaned.slice(0, 3));
      } catch {
        if (!mounted || controller.signal.aborted) return;
        setImages([]);
        setTopImages([]);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
      createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      createdUrlsRef.current = [];
    };
  }, [accommodationId]);

  return { images, topImages };
}
