import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. 우리가 ID를 붙인 스크롤 영역 찾기
    const scrollContainer = document.getElementById('main-scroll-container');
    
    // 만약 못 찾으면(일반 페이지면) 그냥 window를 사용하도록 예외 처리
    const target = scrollContainer || window;

    const toggleVisibility = () => {
      // scrollContainer인 경우 scrollTop, window인 경우 scrollY 사용
      const currentScroll = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      
      if (currentScroll > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 2. 해당 타겟에 이벤트 리스너 부착
    target.addEventListener('scroll', toggleVisibility);

    return () => {
      target.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('main-scroll-container');
    const target = scrollContainer || window;

    target.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          // z-index를 50 -> 9999로 높여서 확실하게 위로 오게 함
          className="fixed bottom-10 right-10 z-[9999] p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1"
          aria-label="맨 위로 가기"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;