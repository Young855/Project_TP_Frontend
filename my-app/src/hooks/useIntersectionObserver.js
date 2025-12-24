import { useEffect, useRef } from "react";

export function useIntersectionObserver(callback, options = {}) {
  const targetRef = useRef(null); // 감지할 HTML 요소를 담을 Ref

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    // 관찰자 생성
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      // 화면에 들어왔고(isIntersecting) + 콜백이 존재하면 실행
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    // 관찰 시작
    observer.observe(element);

    // 컴포넌트 언마운트 시 관찰 중단 (메모리 누수 방지)
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}