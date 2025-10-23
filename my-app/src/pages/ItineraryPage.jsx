import React, { useEffect, useRef } from 'react';
import { mockItinerary } from '../data/mockData';

/**
 * 일정 관리 페이지 (R001, R002, R005, R006)
 * @param {object} props
 * @param {object} props.itinerary - 일정 데이터
 */
const ItineraryPage = ({ itinerary }) => {
  const mapRef = useRef(null); // 지도를 담을 DOM 레퍼런스

  // R002: Naver Map API 연동
  useEffect(() => {
    // 1. 네이버 지도 API 스크립트가 로드되었는지 확인
    if (window.naver && window.naver.maps) {
      initMap();
    } else {
      console.error("Naver Maps API 스크립트가 로드되지 않았습니다.");
      // 스크립트가 App.js에서 로드 중일 수 있으므로, 로드를 기다리거나
      // 여기서 직접 로드할 수 있습니다. (App.js에서 이미 로드 중)
    }
    
  }, [itinerary]); // 일정이 변경될 때마다 지도 다시 그리기
  
  const initMap = () => {
    if (!mapRef.current || !itinerary || itinerary.items.length === 0) return;

    const firstItem = itinerary.items[0];
    
    // 2. 지도 생성
    const mapOptions = {
      center: new window.naver.maps.LatLng(firstItem.lat, firstItem.lng),
      zoom: 11,
    };
    const map = new window.naver.maps.Map(mapRef.current, mapOptions);

    // 3. 마커 및 경로 생성
    const markers = [];
    const path = [];
    
    itinerary.items.forEach(item => {
      const position = new window.naver.maps.LatLng(item.lat, item.lng);
      
      markers.push(new window.naver.maps.Marker({
        map: map,
        position: position,
        title: item.title,
      }));
      
      path.push(position);
    });

    // 4. 경로(Polyline) 그리기
    new window.naver.maps.Polyline({
      map: map,
      path: path,
      strokeColor: '#5347AA',
      strokeWeight: 3,
    });

    // 모든 마커가 보이도록 지도 범위 조절
    if (path.length > 0) {
      map.fitBounds(path);
    }
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">{itinerary.title}</h1>
      <p className="text-lg text-gray-600 mb-6">{itinerary.startDate} ~ {itinerary.endDate}</p>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 지도 (R002) */}
        <div className="w-full lg:w-1/2 h-96 lg:h-[600px] rounded-lg shadow-md overflow-hidden">
           <div id="map-container" ref={mapRef} style={{ width: '100%', height: '100%' }}>
             {/* R002: 지도가 여기에 렌더링됩니다. */}
           </div>
        </div>

        {/* 일정 목록 (R001, R005) */}
        <div className="w-full lg:w-1/2">
          {Array.from({ length: 3 }, (_, i) => i + 1).map(day => ( // 3일차까지 하드코딩
            <div key={day} className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Day {day}</h2>
              <div className="space-y-4 border-l-2 border-blue-500 pl-4">
                {itinerary.items.filter(item => item.day === day).map(item => (
                  <div key={item.id} className="relative p-4 bg-white rounded-lg shadow-sm">
                    <span className="absolute -left-6 top-4 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></span>
                    <p className="font-semibold text-lg">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.time}</p>
                    {/* R006: 네이버 지도 길찾기 링크 */}
                    <a 
                      href={`https://map.naver.com/v5/directions/,-,${item.title},,/${item.lat},${item.lng},/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                    >
                      길찾기 (R006)
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;