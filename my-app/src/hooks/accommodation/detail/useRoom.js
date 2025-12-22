// src/hooks/accommodation/detail/useAccommodationPhoto.js
// 숙소 사진 메타 + blob 로드 -> gallery images / topImages(최대 3장)
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9090";

/**
 * ⚠️ 수정 포인트
 * - accommodationId 변경 시에만 1회 로드
 * - abort된 요청으로 setState 하지 않도록 보호
 * - 불필요한 초기화(setImages([]))로 인한 재렌더 최소화
 */
export default function useAccommodationPhoto(accommodationId) {
  const [images, setImages] = useState([]);
  const [topImages, setTopImages] = useState([]);

  const createdUrlsRef = useRef([]);

  useEffect(() => {
    if (!accommodationId) return;

    const controller = new AbortController();
    let mounted = true;

    // objectURL 정리 (unmount 시에만)
    createdUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    createdUrlsRef.current = [];

    const getOrder = (p) =>
      p?.orderIndex ?? p?.sortOrder ?? p?.photoOrder ?? p?.seq ?? 0;

    const getPhotoId = (p) => p?.photoId ?? p?.id ?? p?.accommodationPhotoId;

    const getDirectUrl = (p) =>
      p?.imageUrl ?? p?.url ?? p?.photoUrl ?? p?.thumbnailUrl ?? null;

    (async () => {
      try {
        const metaRes = await axios.get(
          `${API_BASE}/partner/accommodations/photos/list/${accommodationId}`,
          { signal: controller.signal }
        );
        const metaList = metaRes.data?.data ?? metaRes.data ?? [];
        const list = Array.isArray(metaList) ? metaList : [];

        const sorted = [...list].sort((a, b) => getOrder(a) - getOrder(b));

        const urls = await Promise.all(
          sorted.map(async (p) => {
            const direct = getDirectUrl(p);
            if (direct) return direct;

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

        if (!mounted) return;
        const cleaned = urls.filter(Boolean);
        setImages((prev) => (prev.length === cleaned.length ? prev : cleaned));
        setTopImages((prev) =>
          prev.length === cleaned.slice(0, 3).length
            ? prev
            : cleaned.slice(0, 3)
        );
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
