import React, { useEffect, useState } from "react";

export default function StickyTabs({ onTabClick }) {
  const [activeTab, setActiveTab] = useState("rooms");
  const [isSticky, setIsSticky] = useState(false);

  // 스크롤 감지해서 Sticky 효과 주기
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      // 400px 이상 스크롤되면 탭을 고정 (헤더 높이 등에 따라 조정 가능)
      if (offset > 450) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { id: "rooms", label: "객실안내/예약" },
    { id: "amenities", label: "숙소정보" }, // 클릭 시 서비스 모달 띄움
    { id: "location", label: "위치" },
    { id: "reviews", label: "리뷰" },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (onTabClick) {
      onTabClick(id);
    }
  };

  return (
    <>
      {/* sticky 상태일 때 높이만큼 공간을 차지해주는 placeholder 
         (이게 없으면 탭이 고정될 때 아래 콘텐츠가 툭 튀어 올라옵니다)
      */}
      {isSticky && <div className="h-14" />}

      <div
        className={`z-40 bg-white border-b border-gray-200 transition-all duration-300 ${
          isSticky
            ? "fixed top-0 left-0 right-0 shadow-md"
            : "relative"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-0">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex-1 py-4 text-sm md:text-base font-bold text-center transition-colors relative ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {/* 활성화된 탭 아래에 파란색 바 표시 */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}