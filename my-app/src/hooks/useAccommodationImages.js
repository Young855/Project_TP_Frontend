import { useState, useEffect } from "react";
// API 함수들의 경로는 프로젝트 구조에 맞게 수정해주세요 (예: ../api/...)
import { getAccommodationPhotoBlobUrl, getAccommodationPhotos } from "../api/accommodationPhotoAPI";
import { getRepresentativePhotoId, pickRepresentativePhotoIdFromMeta } from "../utils/accommodationUtils";

export function useAccommodationImages(displayResults) {
  // 이미지 URL을 저장할 객체 상태 { accommodationId: "blob:http://..." }
  const [photoUrlMap, setPhotoUrlMap] = useState({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 화면에 보여질 숙소 리스트(displayResults)만 순회하며 이미지 로딩
        const tasks = (displayResults ?? [])
          .filter((p) => p?.accommodationId != null)
          .map(async (p) => {
            const accommodationId = p.accommodationId;

            // 1. DTO에 있는 ID 확인
            let photoId = getRepresentativePhotoId(p);

            // 2. 없으면 메타데이터 API 호출하여 ID 추출
            if (!photoId) {
              try {
                const meta = await getAccommodationPhotos(accommodationId);
                photoId = pickRepresentativePhotoIdFromMeta(meta);
              } catch (e) {
                // 이미지 로딩 실패해도 리스트 표시는 계속되어야 함
              }
            }

            // 3. Blob URL 생성
            const url = photoId ? getAccommodationPhotoBlobUrl(photoId) : null;
            return [accommodationId, url];
          });

        // 병렬 처리 (Promise.allSettled)
        const settled = await Promise.allSettled(tasks);
        
        const next = {};
        for (const r of settled) {
          if (r.status === "fulfilled") {
            const [accommodationId, url] = r.value;
            next[accommodationId] = url;
          }
        }

        if (!cancelled) setPhotoUrlMap(next);
      } catch (err) {
        console.error("대표사진 로딩 실패:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [displayResults]); // displayResults가 바뀔 때만 실행

  return { photoUrlMap };
}