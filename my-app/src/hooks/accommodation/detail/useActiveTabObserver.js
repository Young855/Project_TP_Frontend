// src/hooks/accommodation/detail/useActiveTabObserver.js
// IntersectionObserver로 상세 페이지 탭(active) 상태 관리
import { useEffect, useState } from "react";

/**
 * 섹션 ref들을 받아 현재 화면에 보이는 섹션 id를 activeTab으로 반환
 *
 * 사용 예:
 * const { activeTab } = useActiveTabObserver({
 *   overview: overviewRef,
 *   rooms: roomsRef,
 *   service: serviceRef,
 *   location: locationRef,
 *   review: reviewRef,
 * });
 */
export default function useActiveTabObserver(sectionRefs = {}) {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const entries = Object.entries(sectionRefs)
      .filter(([, ref]) => ref?.current)
      .map(([key, ref]) => ({ key, el: ref.current }));

    if (entries.length === 0) return;

    const observer = new IntersectionObserver(
      (ioEntries) => {
        // 화면에 들어온 것 중 가장 위에 있는 섹션을 active로
        const visibles = ioEntries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibles.length > 0) {
          setActiveTab(visibles[0].target.dataset.section);
        }
      },
      {
        root: null,
        threshold: 0.25,
        rootMargin: "-80px 0px -60% 0px", // 헤더 높이 고려
      }
    );

    entries.forEach(({ key, el }) => {
      el.dataset.section = key;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionRefs]);

  return { activeTab };
}
